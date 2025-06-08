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
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB:', err.message);
      throw new Error(`MongoDB connection error: ${err.message}`);
    }
  }
  return db;
}

module.exports = connectToDatabase;
