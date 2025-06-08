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


module.exports = router;