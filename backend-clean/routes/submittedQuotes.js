// routes/submittedQuotes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

// ✅ POST - הגשת הצעת מחיר על ידי עמיל מכס
router.post('/', async (req, res) => {
  const { quoteId, brokerCode, price, currency, shippingTime, notes } = req.body;

  if (!quoteId || !brokerCode || !price || !currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await connectToDatabase();
    const submission = {
      quoteId,
      brokerCode,
      price,
      currency,
      shippingTime: shippingTime || '',
      notes: notes || '',
      submittedAt: new Date(),
      status: 'active'
    };

    const result = await db.collection('submitted-quotes').insertOne(submission);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit quote' });
  }
});

// ✅ GET - שליפת כל הצעות המחיר שעמיל הגיש לפי קוד
router.get('/', async (req, res) => {
  const { brokerCode } = req.query;
  if (!brokerCode) return res.status(400).json({ error: 'Missing brokerCode' });

  try {
    const db = await connectToDatabase();
    const quotes = await db.collection('submitted-quotes')
      .find({ brokerCode })
      .sort({ submittedAt: -1 })
      .toArray();

    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submitted quotes' });
  }
});

module.exports = router;
