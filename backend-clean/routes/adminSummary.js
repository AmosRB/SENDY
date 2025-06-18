const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const { ObjectId } = require('mongodb');

router.get('/dashboard-data', async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [
      totalUsers,
      totalQuotes,
      totalPayments,
      totalInvoices,
      sumPaid,
      sumInvoiced,
      usersByRole,
      recentPayments,
      users,
      brokers,
      quotes,
      submittedQuotes
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('quotes').countDocuments(),
      db.collection('payments').countDocuments(),
      db.collection('invoices').countDocuments(),
      db.collection('payments').aggregate([{ $group: { _id: null, sum: { $sum: "$amountPaid" } } }]).toArray(),
      db.collection('invoices').aggregate([{ $group: { _id: null, sum: { $sum: "$amount" } } }]).toArray(),
      db.collection('users').aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]).toArray(),
      db.collection('payments').find().sort({ paidAt: -1 }).limit(5).toArray(),

      // --- טבלאות עיקריות ---
      // החזרת users עם business ו-code
      db.collection('users').find({}, { projection: { name: 1, email: 1, phone: 1, role: 1, createdAt: 1, business: 1, code: 1 } }).sort({ createdAt: -1 }).toArray(),

      // החזרת brokers עם company ו-code
      db.collection('customs-brokers').find({}, { projection: { name: 1, email: 1, phone: 1, company: 1, createdAt: 1, code: 1 } }).sort({ createdAt: -1 }).toArray(),

      // הצעות מחיר
      db.collection('quotes').find().sort({ createdAt: -1 }).toArray(),

      // הצעות שהוגשו
      db.collection('submitted-quotes').find().sort({ submittedAt: -1 }).toArray(),
    ]);

    res.json({
      summary: {
        totalUsers,
        totalQuotes,
        totalPayments,
        totalInvoices,
        totalPaid: sumPaid[0]?.sum || 0,
        totalInvoiced: sumInvoiced[0]?.sum || 0,
        usersByRole,
        recentPayments,
      },
      users,           // כולל business, code
      brokers,         // כולל company, code
      quotes,          // כל טבלת הצעות מחיר
      submittedQuotes  // כל טבלת הצעות שהוגשו
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.delete('/user/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.delete('/broker/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.collection('customs-brokers').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete broker' });
  }
});

router.delete('/quote/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.collection('quotes').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

router.delete('/submitted-quote/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.collection('submitted-quotes').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete submitted quote' });
  }
});

module.exports = router;
