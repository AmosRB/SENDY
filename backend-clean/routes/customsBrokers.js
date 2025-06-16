// customsBrokers.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const generateUniqueCode = require('../utils/codeGenerator'); // <-- הוספה: ייבוא הפונקציה

// ❌ הסר את הפונקציה generateUniqueCode שהייתה מוגדרת פה

router.get('/all', async (req, res) => {
  // ... (הקוד הקיים של GET /all)
  try {
    const db = await connectToDatabase();
    const brokers = await db.collection('customs-brokers').find().sort({ name: 1 }).toArray();
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});


// ✅ רישום חדש עם לוגים ובדיקות קפדניות
router.post('/', async (req, res) => {
  const { name, company, taxId, phone, email } = req.body; // <-- שינוי: הסרת 'code' מה-body
  console.log('📥 POST /api/customs-brokers - body:', req.body);

  if (!name || !company || !taxId || !phone || !email) {
    console.warn('⚠️ שדות חסרים בטופס הרישום של עמיל המכס');
    return res.status(400).json({ error: 'חסרים שדות חובה' });
  }

  try {
    const db = await connectToDatabase();

    // ❌ הסר את הלוגיקה הזו מפה:
    // let code;
    // let existsInUsers = true;
    // let existsInBrokers = true;
    // while (existsInUsers || existsInBrokers) {
    //   code = Math.floor(100000 + Math.random() * 900000).toString();
    //   existsInUsers = await db.collection('users').findOne({ code });
    //   existsInBrokers = await db.collection('customs-brokers').findOne({ code: String(code) });
    // }

    const code = await generateUniqueCode(db); // <-- שימוש בפונקציה המיובאת

    const brokerData = {
      name: name.trim(),
      company: company.trim(),
      taxId: taxId.trim(),
      phone: phone.trim(),
      email: email.trim(),
      code: String(code), // הקוד שנוצר
      createdAt: new Date()
    };

    const result = await db.collection('customs-brokers').insertOne(brokerData);
    const newBroker = await db.collection('customs-brokers').findOne({ _id: result.insertedId });

    console.log('✅ עמיל חדש נוסף:', newBroker);
    res.status(201).json(newBroker);
  } catch (err) {
    console.error('❌ שגיאה ברישום עמיל:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// 🔍 שליפת עמיל לפי קוד (לא משתנה)
router.get('/', async (req, res) => {
  // ... (הקוד הקיים של GET)
  const { code } = req.query;
  console.log('📤 GET /api/customs-brokers?code=', code);

  if (!code || !/^\d{6}$/.test(code)) {
    console.warn('⚠️ קוד לא תקין או חסר');
    return res.status(400).json({ error: 'Missing or invalid broker code' });
  }

  try {
    const db = await connectToDatabase();
    const broker = await db.collection('customs-brokers').findOne({ code });
    if (!broker) {
      console.log('🤷‍♀️ לא נמצא עמיל מכס עם הקוד:', code);
      return res.status(404).json({ error: 'Customs broker not found' });
    }
    console.log('✅ נמצא עמיל מכס:', broker.name);
    res.json(broker);
  } catch (err) {
    console.error('❌ שגיאה בשליפת עמיל מכס:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;