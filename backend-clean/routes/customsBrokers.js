// customsBrokers.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const generateUniqueCode = require('../utils/codeGenerator');
const nodemailer = require('nodemailer');

router.get('/all', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const brokers = await db.collection('customs-brokers').find().sort({ name: 1 }).toArray();
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

router.post('/', async (req, res) => {
  const { name, company, taxId, phone, email } = req.body;
  console.log('📥 POST /api/customs-brokers - body:', req.body);

  if (!name || !company || !taxId || !phone || !email) {
    console.warn('⚠️ שדות חסרים בטופס הרישום של עמיל המכס');
    return res.status(400).json({ error: 'חסרים שדות חובה' });
  }

  try {
    const db = await connectToDatabase();
    const code = await generateUniqueCode(db, 'broker');

    const brokerData = {
      name: name.trim(),
      company: company.trim(),
      taxId: taxId.trim(),
      phone: phone.trim(),
      email: email.trim(),
      code: String(code),
      createdAt: new Date()
    };

    const result = await db.collection('customs-brokers').insertOne(brokerData);
    const newBroker = await db.collection('customs-brokers').findOne({ _id: result.insertedId });

    // ✅ שליחת מייל לעמיל מכס עם הקוד
    try {
      const transporter = nodemailer.createTransport({
        host: 'mail.smtp2go.com',
        port: 2525,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: '"Share A Container" <noreply@shareacontainer.app>',
        to: email,
        subject: 'נרשמת בהצלחה ל־Share A Container',
        html: `
          <div style="direction:rtl;font-family:Arial,sans-serif">
            שלום ${name},<br/>
            נרשמת בהצלחה למערכת <b>Share A Container</b> כעמיל מכס!<br/>
            מעכשיו תוכל להציע הצעות מחיר ללקוחות.<br/><br/>
            <b>קוד הכניסה שלך:</b> <span style="font-size:20px;color:red">${code}</span><br/><br/>
            שמור את הקוד – תזדקק לו לכניסה למערכת.<br/><br/>
            בהצלחה!<br/>
            צוות Share A Container
          </div>
        `
      });
    } catch (err) {
      console.error('✉️ שגיאה בשליחת מייל לעמיל מכס:', err.message);
    }

    console.log('✅ עמיל חדש נוסף:', newBroker);
    res.status(201).json(newBroker);
  } catch (err) {
    console.error('❌ שגיאה ברישום עמיל:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/', async (req, res) => {
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
