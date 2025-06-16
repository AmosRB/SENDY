const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const cron = require('node-cron');
const connectToDatabase = require('./db');

const scrapeProductFromAnySite = require('./scrapers/productScraper.js');
const trainSelector = require('./routes/trainSelector');
const quotes = require('./routes/quotes');
const payments = require('./routes/payments');
const adminSummary = require('./routes/adminSummary');
const users = require('./routes/users');
const customsBrokers = require('./routes/customsBrokers');
const submittedQuotes = require('./routes/submittedQuotes');


const app = express();
const PORT = process.env.PORT || 4135;


app.use(cors());
app.use(express.json());


app.use('/api/test-insert', testInsert);
// ✅ ראוטים
console.log('✅ customsBrokers route loaded');

app.use('/api/customs-brokers', customsBrokers);
app.use('/api/train-selector', trainSelector);
app.use('/api/quotes', quotes);
app.use('/api/payments', payments);
app.use('/api/admin', adminSummary);
app.use('/api/users', users);
app.use('/api/submitted-quotes', submittedQuotes);

// 📦 נתיב חילוץ מוצר
app.get('/extract', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await scrapeProductFromAnySite(url);
    if (!data) return res.status(500).json({ error: 'Extraction failed' });
    res.json(data);
  } catch (err) {
    console.error('❌ Scraping error:', err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

// 🔁 התחברות למסד
const connectWithRetry = async () => {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB on startup');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

// 🧹 פונקציית מחיקה אוטומטית
const deleteExpiredQuotes = async () => {
  try {
    const db = await connectToDatabase();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const result = await db.collection('submitted-quotes').deleteMany({
      validUntil: { $lt: oneDayAgo }
    });

    console.log(`🧹 נמחקו ${result.deletedCount} הצעות שפג תוקפן`);
  } catch (err) {
    console.error('❌ שגיאה במחיקת הצעות שפגו:', err.message);
  }
};

// 🕒 קרון יומי
cron.schedule('0 3 * * *', () => {
  console.log('🔄 התחלת ניקוי הצעות שפג תוקפן...');
  deleteExpiredQuotes();
});

// 🚀 הפעלת השרת
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  connectWithRetry();
});

// 🛡️ הגנות כללייות מקריסה
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection:', reason);
});
