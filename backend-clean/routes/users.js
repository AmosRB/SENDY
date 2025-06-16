// users.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const { ObjectId } = require('mongodb');

// פונקציה לייצור ובדיקת ייחודיות של קוד על פני כל הקולקציות הרלוונטיות
async function generateUniqueCode(db) {
  let code;
  let existsInUsers = true;
  let existsInBrokers = true;

  while (existsInUsers || existsInBrokers) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    existsInUsers = await db.collection('users').findOne({ code });
    existsInBrokers = await db.collection('customs-brokers').findOne({ code: String(code) }); // לוודא השוואת מחרוזת
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
  // נוסיף name ו-phone לבקשה
  const { email, role, business, taxIdNumber, name, phone } = req.body; 

  // ודא ששדות חובה (כולל name ו-phone) קיימים
  if (!email || !role || !name || !phone) { 
    return res.status(400).json({ error: 'חסרים שדות חובה (שם, טלפון, אימייל, תפקיד)' });
  }

  try {
    const db = await connectToDatabase();

    // השתמש בפונקציה החדשה לייצור קוד ייחודי
    const code = await generateUniqueCode(db);

    const newUser = {
      name, // הוספת שם
      phone, // הוספת טלפון
      email,
      role,
      business: business || '',
      taxIdNumber: taxIdNumber || '',
      createdAt: new Date(),
      code, // הקוד הייחודי שנוצר
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
    res.status(500).json({ error: 'שליפה נכשלה' });
  }
});

// ✅ DELETE לפי ID (לא משתנה)
router.delete('/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'מחיקה נכשלה' });
  }
});

module.exports = router;