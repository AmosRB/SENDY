const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

router.get('/all', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const brokers = await db.collection('customs-brokers').find().sort({ name: 1 }).toArray();
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});


// שליפת כל העמילים (קיים)
router.get('/all', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const brokers = await db.collection('customs-brokers').find().sort({ name: 1 }).toArray();
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

// 🔍 שליפת עמיל מכס לפי קוד בן 6 ספרות
router.get('/', async (req, res) => {
  const { code } = req.query;
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Missing or invalid broker code' });
  }

  try {
    const db = await connectToDatabase();
    const broker = await db.collection('customs-brokers').findOne({ code });
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    res.json(broker);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch broker' });
  }
});


module.exports = router;
