// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('client-system-db'); // ודא שהשם תואם למה שיצרת ב-Atlas
    console.log('✅ Connected to MongoDB');
  }
  return db;
}

module.exports = connectToDatabase;
