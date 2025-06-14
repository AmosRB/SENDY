// routes/testInsert.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

router.post('/', async (req, res) => {
  try {
    const db = await connectToDatabase();

    const testDoc = {
      text: req.body.text || 'בדיקה',
      createdAt: new Date()
    };

    const result = await db.collection('debug-test').insertOne(testDoc);

    console.log('🧪 נוצרה רשומת בדיקה:', result.insertedId);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('❌ שגיאה בכתיבת בדיקה:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

