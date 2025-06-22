// routes/quotes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const multer = require('multer');
const { ObjectId, GridFSBucket } = require('mongodb');
const nodemailer = require('nodemailer');

const upload = multer({ storage: multer.memoryStorage() });

// שליחת מייל לכל העמילים עם קישור בלבד
async function sendMailToAllBrokers(brokers) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('לא מוגדרים MAIL_USER או MAIL_PASS, לא ניתן לשלוח מיילים');
    return;
  }

  console.log('שליחת מייל לכל העמילים:', brokers.map(b => b.email));

let transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    ciphers:'SSLv3'
  }
});

  for (const broker of brokers) {
    if (!broker.email) continue;
    console.log('מנסה לשלוח ל:', broker.name, broker.email);
    try {
      await transporter.sendMail({
        from: '"Share A Container" <noreply@shareacontainer.app>',
        to: broker.email,
        subject: 'ישנה בקשה חדשה להצעת מחיר',
        html: `
          <div style="direction:rtl;font-family:Arial">
            שלום ${broker.name},<br/>
            התקבלה בקשה חדשה להצעת מחיר במערכת.<br/>
            <a href="https://shareacontainer.app/brokerstatus">
              לחץ כאן לכניסה לאזור האישי שלך
            </a>
            <br/><br/>
            לא מצליח להיכנס? היכנס מהדף הראשי עם קוד הכניסה שלך.
          </div>
        `
      });
      console.log('✓ נשלח ל:', broker.email);
    } catch (e) {
      console.warn('✗ שליחה נכשלה ל:', broker.email, e.message);
    }
  }
}

// ===== יצירת מספר הצעה חדש =====
router.get('/new-id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let attempt = 0, quoteId;
    while (attempt < 5) {
      const count = await db.collection('quotes').countDocuments({ quoteId: { $regex: `^${today}-` } });
      const padded = String(count + 1).padStart(3, '0');
      quoteId = `${today}-${padded}`;
      try {
        await db.collection('quotes').insertOne({ quoteId, status: 'draft', createdAt: new Date() });
        return res.json({ quoteId });
      } catch (err) {
        if (err.code === 11000) { attempt++; continue; }
        else throw err;
      }
    }
    throw new Error('Exceeded maximum attempts to create unique quoteId');
  } catch (err) {
    res.status(500).json({ error: 'Failed to create unique quoteId' });
  }
});

// ===== קבלת כל ההצעות =====
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { clientId, broker } = req.query;

    if (clientId) {
      // שליפת כל הבקשות ללקוח – ללא הגבלת 5 הצעות!
      const quotes = await db.collection('quotes').find({
        clientId: clientId.toString(),
        status: 'submitted'
      }).toArray();
      res.json(quotes);
      return;
    }

    // אם יש broker (או קריאה עמיל מכס) – מגבילים ל־5 הצעות
    // (אפשר לזהות לפי broker או להוסיף תנאי נוסף לפי מה שיש במערכת)
    const submitted = await db.collection('submitted-quotes').aggregate([
      { $group: { _id: '$quoteId', count: { $sum: 1 } } }
    ]).toArray();

    const overLimit = new Set(submitted.filter(s => s.count >= 5).map(s => s._id));

    const quotes = await db.collection('quotes').find({
      quoteId: { $nin: Array.from(overLimit) },
      status: 'submitted'
    }).toArray();

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});


// ===== הורדת קובץ =====
router.get('/download/:fileId', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });
    const fileId = new ObjectId(req.params.fileId);
    const files = await db.collection('fs.files').find({ _id: fileId }).toArray();
    if (!files || files.length === 0) return res.status(404).json({ error: 'File not found' });
    const file = files[0];
    const safeFilename = file.filename.replace(/[^\w.\-]/g, '_');
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// ===== עדכון או שליחה =====
router.put('/', async (req, res) => {
  const { quoteId, ...updates } = req.body;
  if (!quoteId) return res.status(400).json({ error: 'Missing quoteId' });

  try {
    const db = await connectToDatabase();
    // אם רוצים להבדיל בין update ל-submitted – אפשר לבדוק כאן את updates.status
    const result = await db.collection('quotes').updateOne(
      { quoteId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) throw new Error("Quote not found");

    // שליחת מייל רק אם הבקשה הפכה ל־submitted (כך זה בד"כ בזרימה שלך)
    if (updates.status === 'submitted') {
      try {
        const brokers = await db.collection('customs-brokers').find().toArray();
        sendMailToAllBrokers(brokers); // לא מחכה, לא עוצר את הלקוח
      } catch (e) {
        console.warn('השליחה למיילים נכשלה', e.message);
      }
    }

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// ===== יצירת הצעה חדשה (POST) =====
router.post('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const data = req.body;
    data.createdAt = new Date();
    const result = await db.collection('quotes').insertOne(data);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quote' });
  }
});

// ===== העלאת קובץ =====
router.post('/upload/:quoteId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const db = await connectToDatabase();
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: { quoteId: req.params.quoteId }
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on('finish', async () => {
      const fileDoc = await db.collection('fs.files').findOne({
        filename: req.file.originalname,
        'metadata.quoteId': req.params.quoteId
      });
      if (!fileDoc) return res.status(500).json({ error: 'File saved but not found' });
      const fileMeta = { fileId: fileDoc._id, filename: fileDoc.filename, uploadedAt: new Date() };
      await db.collection('quotes').updateOne(
        { quoteId: req.params.quoteId },
        { $push: { attachments: fileMeta } }
      );
      res.json({ status: 'uploaded', file: fileMeta });
    });
    uploadStream.on('error', (err) => {
      res.status(500).json({ error: 'Failed to write file to GridFS' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ===== מחיקת הצעה =====
router.delete('/:quoteId', async (req, res) => {
  const { quoteId } = req.params;
  try {
    const db = await connectToDatabase();
    const result = await db.collection('quotes').deleteOne({ quoteId });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

module.exports = router;