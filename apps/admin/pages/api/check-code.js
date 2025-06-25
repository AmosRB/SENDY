import connectToDatabase from '../../../backend-clean/db'



export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const db = await connectToDatabase();

    // בדיקת לקוח רגיל
    const client = await db.collection('users').findOne({ code });
    if (client) return res.status(200).json({ type: 'client' });

    // בדיקת יבואן
    const importer = await db.collection('importers').findOne({ code });
    if (importer) return res.status(200).json({ type: 'importer' });

    // בדיקת עמיל מכס
    const broker = await db.collection('customs-brokers').findOne({ code });
    if (broker) return res.status(200).json({ type: 'broker' });

    // אם לא נמצא אף אחד
    return res.status(404).json({ error: 'not found' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
