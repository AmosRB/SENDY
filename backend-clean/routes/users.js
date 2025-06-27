// users.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const { ObjectId } = require('mongodb');
const generateUniqueCode = require('../utils/codeGenerator');
const nodemailer = require('nodemailer');

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

router.post('/', async (req, res) => {
  const { name, phone, email, role, business, taxIdNumber } = req.body;

  if (!email || !role || !name || !phone) {
    return res.status(400).json({ error: 'חסרים שדות חובה (שם, טלפון, אימייל, תפקיד)' });
  }

  try {
    const db = await connectToDatabase();
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

    // ✅ שליחת מייל עם הקוד האישי לאחר רישום
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
            נרשמת בהצלחה למערכת <b>Share A Container</b>!<br/>
            מהיום תוכל לייבא חכם ובזול יותר.<br/><br/>
            <b>קוד הכניסה שלך:</b> <span style="font-size:20px;color:red">${code}</span><br/><br/>
            שמור את הקוד – תזדקק לו לכניסה למערכת.<br/><br/>
            בהצלחה!<br/>
            צוות Share A Container
          </div>
        `
      });
    } catch (err) {
      console.error('✉️ שגיאה בשליחת מייל רישום:', err.message);
    }

    res.status(201).json({ _id: result.insertedId, ...newUser });
  } catch (err) {
    console.error('❌ שגיאה ברישום:', err.message);
    res.status(500).json({ error: err.message });
  }
});

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