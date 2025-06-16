// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  if (!db) {
    try {
      await client.connect();
      db = client.db('client-system-db');
      console.log('✅ Connected to MongoDB');

      // ⬅️ יצירת אינדקס ייחודי ל־quoteId (כבר קיים)
      await db.collection('quotes').createIndex({ quoteId: 1 }, { unique: true });

      // ✅ הוספת אינדקס ייחודי לקוד בשני הקולקציות
      // הקריאות הללו אידמפוטנטיות - ירוצו פעם אחת ולא יזרקו שגיאה אם האינדקס כבר קיים
      await db.collection('users').createIndex({ code: 1 }, { unique: true });
      await db.collection('customs-brokers').createIndex({ code: 1 }, { unique: true });
      console.log('✅ Unique indexes created for codes in users and customs-brokers collections.');

    } catch (err) {
      console.error('❌ Failed to connect to MongoDB:', err.message);
      throw new Error(`MongoDB connection error: ${err.message}`);
    }
  }
  return db;
}

console.log('📡 MONGO_URI בפועל:', uri);

module.exports = connectToDatabase;