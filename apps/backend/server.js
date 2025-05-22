const express = require('express');
const cors = require('cors');
const scrapeAliExpressProduct = require('./productScraper');

const app = express();
app.use(cors());

app.get('/extract', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await scrapeAliExpressProduct(url);
    if (!data) return res.status(500).json({ error: 'Failed to extract data' });
    res.json(data);
  } catch (err) {
    console.error('Error in /extract:', err.message);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

const PORT = 4135;
app.listen(PORT, () => {
  console.log(`🟢 API server running on http://localhost:${PORT}`);
});
