// backend/routes/trainSelector.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const learnedPath = path.join(__dirname, '../data/learned-selectors.json');
const dir = path.dirname(learnedPath);

// ודא שהתיקייה והקובץ קיימים
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
if (!fs.existsSync(learnedPath)) fs.writeFileSync(learnedPath, '[]', 'utf8');

// הוספה חדשה מהתוסף
router.post('/', (req, res) => {
  const { url, selector } = req.body;
  if (!url || !selector) return res.status(400).json({ error: 'Missing data' });

  const hostname = new URL(url).hostname.replace('www.', '');
  const entry = {
    timestamp: new Date().toISOString(),
    domain: hostname,
    url,
    selector
  };

  const data = JSON.parse(fs.readFileSync(learnedPath));
  data.push(entry);
  fs.writeFileSync(learnedPath, JSON.stringify(data, null, 2));

  console.log(`✅ Selector saved for ${hostname}`);
  res.json({ status: 'saved', entry });
});

// שליפה של כל הרשומות
router.get('/all', (req, res) => {
  const data = fs.existsSync(learnedPath)
    ? JSON.parse(fs.readFileSync(learnedPath, 'utf8'))
    : [];
  res.json(data);
});

// מחיקת רשומה לפי index
router.post('/delete', (req, res) => {
  const { index } = req.body;
  if (typeof index !== 'number') return res.status(400).json({ error: 'Invalid index' });

  const data = JSON.parse(fs.readFileSync(learnedPath));
  if (index < 0 || index >= data.length) return res.status(404).json({ error: 'Index not found' });

  const removed = data.splice(index, 1);
  fs.writeFileSync(learnedPath, JSON.stringify(data, null, 2));

  console.log(`🗑️ Selector deleted [${index}]`);
  res.json({ status: 'deleted', removed });
});

module.exports = router;
