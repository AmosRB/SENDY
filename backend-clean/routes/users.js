const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const { ObjectId } = require('mongodb');


// ✅ GET - שליפת משתמשים לפי שם ו/או טלפון
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

// ✅ NEW: GET - שליפת כל המשתמשים (לדשבורד)
router.get('/all', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const users = await db.collection('users').find().sort({ createdAt: -1 }).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all users' });
  }
});

// DELETE - מחיקת משתמש לפי ID
router.delete('/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


module.exports = router;
