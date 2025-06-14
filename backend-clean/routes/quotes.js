// routes/quotes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const multer = require('multer');
const { ObjectId, GridFSBucket } = require('mongodb');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/download/:fileId', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const bucket = new GridFSBucket(db, { bucketName: 'fs' });

    const fileId = new ObjectId(req.params.fileId);

    const files = await db.collection('fs.files').find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];
    const safeFilename = file.filename.replace(/[^\w.\-]/g, '_');
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${safeFilename}"`);

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
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    let attempt = 0;
    let quoteId;

    while (attempt < 5) {
      const count = await db.collection('quotes').countDocuments({ quoteId: { $regex: `^${today}-` } });
      const padded = String(count + 1).padStart(3, '0');
      quoteId = `${today}-${padded}`;

      try {
        await db.collection('quotes').insertOne({
          quoteId,
          status: 'draft',
          createdAt: new Date()
        });

        return res.json({ quoteId });
      } catch (err) {
        if (err.code === 11000) {
          attempt++;
          continue;
        } else {
          throw err;
        }
      }
    }

    throw new Error('Exceeded maximum attempts to create unique quoteId');
  } catch (err) {
    console.error('❌ Failed to create quoteId:', err.message);
    res.status(500).json({ error: 'Failed to create unique quoteId' });
  }
});

// ✅ עדכון quote קיים מ־draft ל־submitted מבלי למחוק אותו
router.put('/', async (req, res) => {
  const quote = req.body;
  try {
    const db = await connectToDatabase();
    const result = await db.collection('quotes').updateOne(
      { quoteId: quote.quoteId },
      {
        $set: {
          ...quote,
          status: 'submitted',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) throw new Error("Quote not found");

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to update quote:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

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

      if (!fileDoc) {
        console.error('❌ File not found after upload');
        return res.status(500).json({ error: 'File saved but not found' });
      }

      const fileMeta = {
        fileId: fileDoc._id,
        filename: fileDoc.filename,
        uploadedAt: new Date()
      };

      await db.collection('quotes').updateOne(
        { quoteId: req.params.quoteId },
        { $push: { attachments: fileMeta } }
      );

      res.json({ status: 'uploaded', file: fileMeta });
    });

    uploadStream.on('error', (err) => {
      console.error('❌ Error writing file to GridFS:', err);
      res.status(500).json({ error: 'Failed to write file to GridFS' });
    });
  } catch (err) {
    console.error('❌ Upload route error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// DELETE לפי quoteId
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
