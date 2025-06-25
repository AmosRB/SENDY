const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

router.get('/', async (req, res) => {
  const code = Number(req.query.code);

  if (!code) {
    return res.status(400).json({ error: 'Missing or invalid code' });
  }

  try {
    const db = await connectToDatabase();

    const client = await db.collection('users').findOne({ code });
    if (client) return res.status(200).json({ type: 'client', id: client._id.toString(), name: client.name });

    const importer = await db.collection('importers').findOne({ code });
    if (importer) return res.status(200).json({ type: 'importer', id: importer._id.toString(), name: importer.name });

    const broker = await db.collection('customs-brokers').findOne({ code });
    if (broker) return res.status(200).json({ type: 'broker', id: broker._id.toString(), name: broker.name });

    return res.status(404).json({ error: 'not found' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
