// pages/api/send-registration-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, code } = req.body;

  if (!email || !code) return res.status(400).json({ error: 'Missing data' });

  const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: '"Share A Container" <noreply@shareacontainer.app>',
      to: email,
      subject: 'נרשמת בהצלחה ל־Share A Container',
      html: `
        <div style="direction:rtl;font-family:Arial,sans-serif">
          שלום${name ? ` ${name}` : ''},<br/>
          נרשמת בהצלחה למערכת <b>Share A Container</b>!<br/>
          מהיום תוכל לייבא חכם ובזול יותר.<br/><br/>
          <b>קוד הכניסה שלך:</b> <span style="font-size:20px;color:red">${code}</span><br/><br/>
          שמור את הקוד – תזדקק לו לכניסה למערכת.<br/><br/>
          בהצלחה!<br/>
          צוות Share A Container
        </div>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('✉️ שגיאה בשליחת מייל:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
