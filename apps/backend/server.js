const express = require('express');
const cors = require('cors');
const scrapeProductFromAnySite = require('./scrapers/productScraper'); // ✅ עדכון כאן
const fs = require('fs');
const path = require('path');
const urlLib = require('url');

const app = express();
app.use(cors());

// טעינת API של ניהול סלקטורים
const selectorsRoute = require('./routes/selectors');
app.use('/api/selectors', express.json(), selectorsRoute);

// מיקום הקובץ המקומי של הסלקטורים
const SELECTOR_CACHE_PATH = path.join(__dirname, './data/selectors-cache.json');

// חילוץ דומיין מתוך קישור
function extractDomain(url) {
  const parsed = urlLib.parse(url);
  return parsed.hostname.replace('www.', '');
}

// בדיקה אם הדומיין כבר נלמד בעבר
function checkSelectorOrigin(domain) {
  if (!fs.existsSync(SELECTOR_CACHE_PATH)) return 'new';
  const cache = JSON.parse(fs.readFileSync(SELECTOR_CACHE_PATH));
  return cache[domain] ? 'cache' : 'new';
}

// נתיב חיצוני: חילוץ נתוני מוצר
app.get('/extract', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  const domain = extractDomain(url);
  const source = checkSelectorOrigin(domain);
  console.log(`🟡 Processing URL: ${url}`);
  console.log(`🔍 Domain: ${domain} → Selector source: ${source === 'cache' ? '🗂 cache' : '🧠 new learning'}`);

  try {
    const data = await scrapeProductFromAnySite(url); // ✅ שימוש בפונקציה החדשה
    if (!data) return res.status(500).json({ error: 'Failed to extract data' });

    console.log(`✅ Extraction success for ${domain}`);
    res.json(data);
  } catch (err) {
    console.error('❌ Error in /extract:', err.message);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

// הפעלת השרת
const PORT = 4135;
app.listen(PORT, () => {
  console.log(`🟢 API server running on http://localhost:${PORT}`);
});
