// users.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const { ObjectId } = require('mongodb');
const generateUniqueCode = require('../utils/codeGenerator'); // <-- הוספה: ייבוא הפונקציה

// ✅ GET לפי קוד אישי (לא משתנה)
router.get('/', async (req, res) => {
  // ... (הקוד הקיים של GET)
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
  const { name, phone, email, role, business, taxIdNumber } = req.body;

  if (!email || !role || !name || !phone) {
    return res.status(400).json({ error: 'חסרים שדות חובה (שם, טלפון, אימייל, תפקיד)' });
  }

  try {
    const db = await connectToDatabase();

    // ❌ הסר את הלוגיקה הזו מפה:
    // let code;
    // let exists = true;
    // while (exists) {
    //   code = Math.floor(100000 + Math.random() * 900000).toString();
    //   exists = await db.collection('users').findOne({ code });
    // }

    const code = await generateUniqueCode(db, 'client');


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