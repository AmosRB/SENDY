// routes/users.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

// ✅ GET - שליפת כל המשתמשים
// routes/users.js
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { name, phone } = req.query;

    const query = {};
    if (name) query.name = { $regex: `^${name}$`, $options: 'i' };
    if (phone) query.phone = phone;

    const users = await db.collection('users').find(query).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});





// ✅ POST - הוספת משתמש חדש
router.post('/', async (req, res) => {
  const { name, phone, email, role } = req.body;

  if (!name || !phone || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await connectToDatabase();
    const result = await db.collection('users').insertOne({
      name,
      phone,
      email,
      role,
      createdAt: new Date()
    });

    res.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('❌ Failed to save user:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
