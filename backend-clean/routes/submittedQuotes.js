// routes/submittedQuotes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');

// ✅ POST - הגשת הצעת מחיר על ידי עמיל מכס
router.post('/', async (req, res) => {
  const submission = {
    ...req.body,
    submittedAt: new Date(),
    status: 'active' // סטטוס ראשוני בעת הגשה
  };

  // בדיקת שדות חובה לפני שמירה בבסיס הנתונים
  if (!submission.quoteId || !submission.brokerCode || !submission.price || !submission.currency || !submission.clientId) {
    console.error('שגיאה: שדות חובה חסרים בהגשת הצעה חדשה.', submission);
    return res.status(400).json({ error: 'חסרים שדות חובה' });
  }

  try {
    const db = await connectToDatabase();

    // 📨 שמירת ההצעה בקולקציית submitted-quotes
    const result = await db.collection('submitted-quotes').insertOne(submission);
    console.log(`הצעה חדשה הוגשה ונשמרה: ${submission.quoteId}`);

    // עדכון קולקציית quotes שההצעה הספציפית נשלחה על ידי עמיל זה
    await db.collection('quotes').updateOne(
      { quoteId: submission.quoteId },
      {
        $addToSet: { submittedBy: submission.brokerCode }, // הוספת קוד העמיל לרשימת מי שהגיש
        $set: { updatedAt: new Date() }
      }
    );
    console.log(`הצעה ${submission.quoteId} עודכנה עם העמיל ${submission.brokerCode}`);


    // === לוגיקת שליחת מייל ללקוח ===
    // המייל ללקוח נשלח רק אם יש clientId בנתוני ההגשה
    if (submission.clientId) {
      try {
        // שליפת פרטי הלקוח מקולקציית users
const clientObjectId = typeof submission.clientId === 'string'
  ? new ObjectId(submission.clientId)
  : submission.clientId;

const client = await db.collection('users').findOne({ _id: clientObjectId });


        if (client) { // וודא שהלקוח נמצא בבסיס הנתונים
          if (client.email && client.code) { // וודא שללקוח יש כתובת מייל וקוד כניסה
            console.log('📨 מנסה לשלוח מייל ללקוח לאחר הגשת הצעה:', client.email);
            await sendMailToClient(client.email, client.name, client.code);
            console.log(`✓ מייל נשלח בהצלחה ללקוח ${client.email}`);
          } else {
            // הודעה אם ללקוח חסרים מייל או קוד
            console.warn(`⚠️ חסרים נתונים (מייל או קוד) עבור לקוח ${submission.clientId}. המייל לא נשלח.`);
          }
        } else {
          // הודעה אם הלקוח לא נמצא בכלל
          console.warn(`⚠️ לקוח עם _id: ${submission.clientId} לא נמצא בקולקציית users. המייל לא נשלח.`);
        }
      } catch (e) {
        // שגיאה כלשהי במהלך שליפת הלקוח או שליחת המייל
        console.error('✗ שגיאה קריטית בשליחת מייל ללקוח לאחר הגשת הצעה:', e.message, e);
        // ייתכן ותרצה לטפל בשגיאה זו באופן ספציפי יותר, אך זה לא ימנע את הצלחת ההגשה עצמה
      }
    } else {
        // הודעה אם clientId לא סופק כלל בהגשת הצעה
        console.warn('⚠️ submission.clientId חסר בהגשת ההצעה. לא ניתן לשלוח מייל ללקוח.');
    }

    // שליחת תגובה חיובית לאחר שההצעה נשמרה והמיילים טופלו (גם אם לא נשלחו)
    res.status(201).json({ insertedId: result.insertedId, message: 'הצעת מחיר הוגשה בהצלחה.' });
  } catch (err) {
    // שגיאה כללית בשמירת ההצעה בבסיס הנתונים
    console.error('❌ שגיאה בשמירת הצעת המחיר ב-DB:', err.message, err);
    res.status(500).json({ error: 'הגשת הצעת מחיר נכשלה' });
  }
});

// ... (שאר הנתיבים והפונקציות בקובץ, כולל sendMailToClient, נשארות ללא שינוי) ...

// פונקציית sendMailToClient - ודא שהיא קיימת ומוגדרת כראוי באותו קובץ
async function sendMailToClient(email, name, code) {
  if (!email || !code || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('sendMailToClient: חסרים פרטי אימייל/קוד או משתני סביבה. לא ניתן לשלוח מייל.');
    return;
  }

  let transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false, // וודא שאפשרויות אבטחה תואמות לשרת ה-SMTP שלך
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: '"Share A Container" <noreply@shareacontainer.app>',
      to: email,
      subject: 'בקשתך נענתה!',
      html: `
        <div style="direction:rtl;font-family:Arial">
          שלום${name ? ' ' + name : ''},<br/>
          בקשתך לקבלת הצעת מחיר נענתה.<br/>
          <a href="https://shareacontainer.app/?code=${code}">לחץ כאן לכניסה לאזור האישי שלך</a>
          <br/><br/>
          בברכה,<br/>
          צוות Share A Container
        </div>
      `
    });
    console.log(`✓ מייל ללקוח ${email} נשלח דרך sendMailToClient.`);
  } catch (e) {
    console.error(`✗ שליחת מייל ללקוח ${email} נכשלה בתוך sendMailToClient:`, e.message);
    // חשוב לתפוס כאן שגיאות ברמת הנודמיילר (חיבור, אימות וכו')
  }
}

module.exports = router;
