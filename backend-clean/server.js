const express = require('express');
const cors = require('cors');
const scrapeProductFromAnySite = require('./scrapers/productScraper');
const trainSelector = require('./routes/trainSelector');

const app = express(); // ← הגדרה מוקדמת של app
app.use(cors());
app.use(express.json()); // ← נדרש כדי לקרוא JSON מ־fetch של התוסף

// מסלול לימוד סלקטור מהתוסף
app.use('/api/train-selector', trainSelector);

// נתיב שליפה רגיל
app.get('/extract', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  console.log(`🔍 Extracting from URL: ${url}`);

  try {
    const data = await scrapeProductFromAnySite(url);
    if (!data) return res.status(500).json({ error: 'Extraction failed' });

    console.log(`✅ Success for ${url}`);
    res.json(data);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ error: 'Scraping failed' });
  }
});


const PORT = 4135;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
