// pages/api/check-code.js
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) return res.status(400).json({ error: 'missing code' });

  const db = await connectToDatabase();

  // בדיקת לקוח רגיל
  const client = await db.collection('users').findOne({ code });
  if (client) return res.status(200).json({ type: 'client' });

  // בדיקת יבואן עסקי (אם יש)
  const importer = await db.collection('importers')?.findOne?.({ code });
  if (importer) return res.status(200).json({ type: 'importer' });

  // בדיקת עמיל מכס
  const broker = await db.collection('customs-brokers').findOne({ code });
  if (broker) return res.status(200).json({ type: 'broker' });

  // אם לא נמצא שום דבר
  return res.status(404).json({ error: 'not found' });
}
