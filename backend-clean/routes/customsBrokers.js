// customsBrokers.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

// יש להעתיק את הפונקציה הזו גם לכאן או ליצור קובץ utilities נפרד
// המכיל פונקציה זו ולייצא אותה לשני הקבצים.
// לצורך הפתרון, נניח שהיא קיימת כאן גם כן.
async function generateUniqueCode(db) {
  let code;
  let existsInUsers = true;
  let existsInBrokers = true;

  while (existsInUsers || existsInBrokers) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    existsInUsers = await db.collection('users').findOne({ code });
    existsInBrokers = await db.collection('customs-brokers').findOne({ code: String(code) });
  }
  return code;
}

router.get('/all', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const brokers = await db.collection('customs-brokers').find().sort({ name: 1 }).toArray();
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

// שליפת כל העמילים (קיים)
router.get('/all', async (req, res) => {
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
  // הקוד נוצר בשרת, לכן לא נקבל אותו מה-body
  const { name, company, taxId, phone, email } = req.body; 
  console.log('📥 POST /api/customs-brokers - body:', req.body);

  // ודא ששדות חובה קיימים
  if (!name || !company || !taxId || !phone || !email) { 
    console.warn('⚠️ שדות חסרים בטופס');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // בדיקת פורמט (הסרת בדיקת ה-code כי הוא לא מגיע מה-body)
  if ([name, company, taxId, phone, email].some(v => typeof v !== 'string' || !v.trim())) { 
    console.warn('⚠️ שדה כלשהו לא תקין מבחינת סוג או ריק');
    return res.status(400).json({ error: 'Invalid input format' });
  }

  try {
    const db = await connectToDatabase();

    // יצירת קוד ייחודי באמצעות generateUniqueCode
    const code = await generateUniqueCode(db);

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
    // קבלת האובייקט המלא חזרה
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
  const { code } = req.query;
  console.log('📤 GET /api/customs-brokers?code=', code);

  if (!code || !/^\d{6}$/.test(code)) {
    console.warn('⚠️ קוד לא תקין או חסר');
    return res.status(400).json({ error: 'Missing or invalid broker code' });
  }

  try {
    const db = await connectToDatabase();
    const broker = await db.collection('customs-brokers').findOne({ code: String(code) });

    if (!broker) {
      console.warn('⚠️ לא נמצא עמיל עם קוד:', code);
      return res.status(404).json({ error: 'Broker not found' });
    }

    console.log('✅ נמצא עמיל:', broker.name);
    res.json(broker);
  } catch (err) {
    console.error('❌ שגיאה בשליפת עמיל:', err.message);
    res.status(500).json({ error: 'Failed to fetch broker' });
  }
});

module.exports = router;