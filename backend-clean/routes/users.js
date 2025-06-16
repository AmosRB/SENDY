// users.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const { ObjectId } = require('mongodb');

// פונקציה לייצור ובדיקת ייחודיות של קוד על פני כל הקולקציות הרלוונטיות
async function generateUniqueCode(db) {
  let code;
  let existsInUsers = true;
  let existsInBrokers = true; // וודא שזה כתוב כך, עם 'e' בסוף 'brokers'

  while (existsInUsers || existsInBrokers) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    existsInUsers = await db.collection('users').findOne({ code });
    existsInBrokers = await db.collection('customs-brokers').findOne({ code: String(code) }); // וודא שגם כאן כתוב existsInBrokers
  }
  return code;
}

// ✅ GET לפי קוד אישי (לא משתנה)
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { code } = req.query;

    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'קוד אישי לא תקין או חסר' });
    }

    const user = await db.collection('users').findOne({ code });
    if (!user) return res.status(404).json({ error: 'לא נמצא משתמש' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפה' });
  }
});

// ✅ POST - רישום משתמש חדש עם קוד אישי
router.post('/', async (req, res) => {
  const { name, phone, email, role, business, taxIdNumber } = req.body; // הוספתי name ו-phone ל-destructuring

  if (!name || !phone || !email || !role) { // וודא בדיקה גם על name ו-phone
    return res.status(400).json({ error: 'חסרים שדות חובה' });
  }

  try {
    const db = await connectToDatabase();

    // השתמש בפונקציה החדשה לייצור קוד ייחודי
    const code = await generateUniqueCode(db);

    const newUser = {
      name,
      phone,
      email,
      role,
      business: business || '',
      taxIdNumber: taxIdNumber || '',
      createdAt: new Date(),
      code,
    };

    const result = await db.collection('users').insertOne(newUser);

    if (!result.acknowledged) {
      return res.status(500).json({ error: 'שגיאה בהוספה' });
    }

    res.status(201).json({ _id: result.insertedId, ...newUser });
  } catch (err) {
    console.error('❌ שגיאה ברישום:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET כל המשתמשים (לא משתנה)
router.get('/all', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const users = await db.collection('users').find().sort({ createdAt: -1 }).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ GET משתמש לפי ID (לא משתנה)
router.get('/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// ✅ PUT - עדכון משתמש קיים (לא משתנה)
router.put('/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;
    const { name, phone, email, role, business, taxIdNumber } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const updatedUser = {
      name,
      phone,
      email,
      role,
      business: business || '',
      taxIdNumber: taxIdNumber || '',
    };

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUser }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// ✅ DELETE - מחיקת משתמש (לא משתנה)
router.delete('/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});


module.exports = router;