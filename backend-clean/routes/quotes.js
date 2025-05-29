// routes/quotes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

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

router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const quotes = await db.collection('quotes').find().toArray();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

module.exports = router;