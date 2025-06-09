// routes/quotes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');


router.post('/', async (req, res) => {
  const quote = req.body;
  try {
    const db = await connectToDatabase();
    const result = await db.collection('quotes').insertOne(quote);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    console.error('❌ Error saving quote:', error);
    res.status(500).json({ error: 'Failed to save quote' });
  }
});


router.get('/download/:fileId', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    const fileId = new ObjectId(req.params.fileId);

    // מציאת שם הקובץ (metadata)
    const files = await db.collection('fs.files').find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

  } catch (err) {
    console.error('❌ Download error:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});


router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const quotes = await db.collection('quotes').find().toArray();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

router.get('/new-id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('quotes');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${yyyy}${mm}${dd}`;

    const todayQuotes = await collection
      .find({ quoteId: { $regex: `^${datePrefix}` } })
      .toArray();

    const nextSerial = todayQuotes.length + 1;
    const paddedSerial = String(nextSerial).padStart(3, '0');
    const newQuoteId = `${datePrefix}-${paddedSerial}`;

    // יצירת רשומת quote מלאה לטיוטה עם שדות לדף מילוי
    await collection.insertOne({
  quoteId: newQuoteId,
  createdAt: new Date(),
  status: 'draft',
  clientId: 'user123',       
  brokerId: 'broker456',  
  productName: '',
  manufacturer: '',
  origin: '',
  productUrl: '',
  totalWeight: '',
  totalVolume: '',
  shippingType: { FOB: false, EXW: false },
  destination: {
    toWarehouse: false,
    domestic: false,
    domesticAddress: ''
  },
  notes: '',
  services: {
    customs: false,
    standards: false,
    insurance: false
  },
  termsAccepted: false,
  total: 0,
  currency: 'ILS',
  expiresAt: null
});
 
    res.json({ quoteId: newQuoteId });
  } catch (err) {
    console.error('❌ Failed to generate new quoteId:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// הגדרת Storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      metadata: {
        quoteId: req.params.quoteId,
      }
    };
  }
});

const upload = multer({ storage });

// ⬆️ API: העלאת קובץ וקישור ל־quoteId
router.post('/upload/:quoteId', upload.single('file'), async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('quotes');
    const fileMeta = {
      fileId: req.file.id,
      filename: req.file.filename,
      uploadedAt: new Date()
    };

    await collection.updateOne(
      { quoteId: req.params.quoteId },
      { $push: { attachments: fileMeta } }
    );

    res.json({ status: 'uploaded', file: fileMeta });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});


module.exports = router;