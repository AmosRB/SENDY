// backend/routes/trainSelector.js (updated with field support + export + clear route)
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const learnedPath = path.join(__dirname, '../routes/data/learned-selectors.json');
const groupedPath = path.join(__dirname, '../routes/data/selectors-learned.json');

const dir = path.dirname(learnedPath);

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
if (!fs.existsSync(learnedPath)) fs.writeFileSync(learnedPath, '[]', 'utf8');

// שמירת סלקטור חדש מהתוסף
router.post('/', (req, res) => {
  const { url, selector, field } = req.body;
  if (!url || !selector || !field) {
    return res.status(400).json({ error: 'Missing data (url, selector, or field)' });
  }

  const hostname = new URL(url).hostname.replace(/^www\.|^he\./, '');
  const entry = {
    timestamp: new Date().toISOString(),
    domain: hostname,
    url,
    selector,
    field
  };

  const data = JSON.parse(fs.readFileSync(learnedPath));
  data.push(entry);
  fs.writeFileSync(learnedPath, JSON.stringify(data, null, 2));

  console.log(`✅ [${field}] selector saved for ${hostname}`);
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

// יצירת קובץ selectors-learned.json מקובץ הלמידה
// יצירת קובץ selectors-learned.json מקובץ הלמידה
router.post('/export', (req, res) => {
  const learned = fs.existsSync(learnedPath)
    ? JSON.parse(fs.readFileSync(learnedPath))
    : [];

  const learnedGroupedPath = path.join(__dirname, '../routes/data/selectors-learned.json');

  // טען את הקובץ המאוחד
  const learnedMerged = fs.existsSync(learnedGroupedPath)
    ? JSON.parse(fs.readFileSync(learnedGroupedPath))
    : {};

  // עדכון רשומות עם ניקוד
  for (const entry of learned) {
    const { domain, field, selector } = entry;
    if (!learnedMerged[domain]) learnedMerged[domain] = {};
    if (!learnedMerged[domain][field]) {
      learnedMerged[domain][field] = [{ selector, score: 1 }];
    } else {
      const match = learnedMerged[domain][field].find(s => s.selector === selector);
      if (match) match.score += 1;
      else learnedMerged[domain][field].push({ selector, score: 1 });
    }
  }

  // 🔴 שלב ניקוי: הסרת סלקטורים עם ניקוד 0 ומיון לפי score
  for (const domain in learnedMerged) {
    for (const field in learnedMerged[domain]) {
      learnedMerged[domain][field] = learnedMerged[domain][field]
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score);
    }
  }

  // שמור את הקובץ המאוחד
  fs.writeFileSync(learnedGroupedPath, JSON.stringify(learnedMerged, null, 2), 'utf8');

  // צור גיבוי של הרשומות המקוריות
  const exportPath = path.join(__dirname, `../routes/data/exported-${Date.now()}.json`);
  fs.writeFileSync(exportPath, JSON.stringify(learned, null, 2), 'utf8');

  // נקה את הרשומות הגולמיות
  fs.writeFileSync(learnedPath, '[]', 'utf8');

  console.log(`📦 Exported ${learned.length} entries to ${exportPath}`);
  res.json({ path: exportPath, totalDomains: Object.keys(learnedMerged).length });
});



// איפוס קובץ learned-selectors.json אחרי ייצוא
router.post('/clear', (req, res) => {
  fs.writeFileSync(learnedPath, '[]', 'utf8');
  console.log('🧹 learned-selectors.json cleared.');
  res.json({ status: 'cleared' });
});

// החזר את selectors-learned.json
router.get('/selectors-learned', (req, res) => {
 const mergedPath = path.join(__dirname, '../routes/data/selectors-learned.json');
  if (!fs.existsSync(mergedPath)) return res.status(404).json({ error: 'Not found' });

  const data = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
  res.json(data);
});


module.exports = router;
