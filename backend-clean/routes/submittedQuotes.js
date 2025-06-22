
// routes/submittedQuotes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const nodemailer = require('nodemailer');

// ✅ POST - הגשת הצעת מחיר על ידי עמיל מכס
router.post('/', async (req, res) => {
  const submission = {
    ...req.body,
    submittedAt: new Date(),
    status: 'active'
  };

  if (!submission.quoteId || !submission.brokerCode || !submission.price || !submission.currency || !submission.clientId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await connectToDatabase();

    // 📨 שמירת ההצעה
    const result = await db.collection('submitted-quotes').insertOne(submission);

    await db.collection('quotes').updateOne(
      { quoteId: submission.quoteId },
      {
        $addToSet: { submittedBy: submission.brokerCode },
        $set: { updatedAt: new Date() }
      }
    );

    // === פה מוסיפים שליחת מייל ללקוח ===
    if (submission.clientEmail) {
      sendMailToClient(submission.clientEmail, submission.clientName);
      // לא מחכים לתשובה - המייל נשלח ברקע
    }

    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit quote' });
  }
});


// ✅ GET - שליפת כל הצעות המחיר שעמיל הגיש לפי קוד
router.get('/', async (req, res) => {
  const { brokerCode } = req.query;
  if (!brokerCode) return res.status(400).json({ error: 'Missing brokerCode' });

  try {
    const db = await connectToDatabase();
    const quotes = await db.collection('submitted-quotes')
      .find({ brokerCode })
      .sort({ submittedAt: -1 })
      .toArray();

    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submitted quotes' });
  }
});

// ✅ GET - שליפת כל ההצעות שהוגשו (עבור לקוח)
router.get('/all', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const all = await db.collection('submitted-quotes')
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all submitted quotes' });
  }
});




async function sendMailToClient(email, name) {
  if (!email || !process.env.MAIL_USER || !process.env.MAIL_PASS) return;
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      ciphers:'SSLv3'
    }
  });

  try {
    await transporter.sendMail({
      from: '"Share A Container" <noreply@shareacontainer.app>',
      to: email,
      subject: 'הבקשה שלך נענתה!',
      html: `
        <div style="direction:rtl;font-family:Arial">
          שלום${name ? ' ' + name : ''},<br/>
          בקשתך לקבלת הצעת מחיר נענתה.<br/>
          <a href="https://shareacontainer.app/clientopenquotes">לחץ כאן לכניסה לאזור האישי שלך</a>
          <br/><br/>
          בברכה,<br/>
          צוות Share A Container
        </div>
      `
    });
  } catch (e) {
    console.warn('✗ שליחה נכשלה ללקוח:', email, e.message);
  }
}

module.exports = router;
