const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const scrapeProductFromAnySite = require('./scrapers/productScraper.js');
const trainSelector = require('./routes/trainSelector');
const quotes = require('./routes/quotes');
const payments = require('./routes/payments');
const adminSummary = require('./routes/adminSummary');
const connectToDatabase = require('./db');
const users = require('./routes/users');
const customsBrokers = require('./routes/customsBrokers');
const submittedQuotes = require('./routes/submittedQuotes'); // ✅

const app = express();
app.use(cors());
app.use(express.json());

// ✅ ראוטרים
app.use('/api/customs-brokers', customsBrokers);
app.use('/api/train-selector', trainSelector);
app.use('/api/quotes', quotes);
app.use('/api/payments', payments);
app.use('/api/admin', adminSummary);
app.use('/api/users', users);
app.use('/api/submitted-quotes', submittedQuotes); // ✅ חדש

// 📦 נתיב חילוץ מוצר
app.get('/extract', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await scrapeProductFromAnySite(url);
    if (!data) return res.status(500).json({ error: 'Extraction failed' });
    res.json(data);
  } catch (err) {
    console.error('❌ Scraping error:', err.message);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

// 🔁 התחברות למסד
const PORT = 4135;
const connectWithRetry = async () => {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB on startup');
  } catch (err) {
    console.error('❌ MongoDB connection failed. Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  connectWithRetry();
});
