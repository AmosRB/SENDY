const dotenv = require('dotenv');
dotenv.config(); // טוען את MONGO_URI מיד בהתחלה

const express = require('express');
const cors = require('cors');

// כאן רק אחרי dotenv
const scrapeProductFromAnySite = require('./scrapers/productScraper.js');

const trainSelector = require('./routes/trainSelector');
const quotes = require('./routes/quotes');
const payments = require('./routes/payments');
const adminSummary = require('./routes/adminSummary');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/train-selector', trainSelector);
app.use('/api/quotes', quotes);
app.use('/api/payments', payments);
app.use('/api/admin', adminSummary);

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

const PORT = 4135;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
