const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const FILE_PATH = path.join(__dirname, '../data/selectors-cache.json');

// GET - Load selectors
router.get('/', (req, res) => {
  try {
    const data = fs.existsSync(FILE_PATH)
      ? JSON.parse(fs.readFileSync(FILE_PATH))
      : {};
    res.json(data);
  } catch (err) {
    console.error('❌ Failed to load selectors:', err.message);
    res.status(500).json({ error: 'Failed to load selectors' });
  }
});

// POST - Save updated selectors
router.post('/', (req, res) => {
  try {
    const updated = req.body;
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2));
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Failed to save selectors:', err.message);
    res.status(500).json({ error: 'Failed to save selectors' });
  }
});

module.exports = router;
