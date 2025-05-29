// routes/payments.js
const express2 = require('express');
const router2 = express2.Router();
const connectToDatabase2 = require('../db');

router2.post('/', async (req, res) => {
  const payment = req.body;
  try {
    const db = await connectToDatabase2();
    const result = await db.collection('payments').insertOne(payment);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save payment' });
  }
});

router2.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase2();
    const payments = await db.collection('payments').find().toArray();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router2;