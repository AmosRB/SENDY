
// routes/adminSummary.js
const express3 = require('express');
const router3 = express3.Router();
const connectToDatabase3 = require('../db');

router3.get('/summary', async (req, res) => {
  try {
    const db = await connectToDatabase3();

    const [
      totalUsers,
      totalQuotes,
      totalPayments,
      totalInvoices,
      unreadNotifications,
      sumPaid,
      sumInvoiced,
      usersByRole,
      recentPayments,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('quotes').countDocuments(),
      db.collection('payments').countDocuments(),
      db.collection('invoices').countDocuments(),
      db.collection('notifications').countDocuments({ read: false }),
      db.collection('payments').aggregate([{ $group: { _id: null, sum: { $sum: "$amountPaid" } } }]).toArray(),
      db.collection('invoices').aggregate([{ $group: { _id: null, sum: { $sum: "$amount" } } }]).toArray(),
      db.collection('users').aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]).toArray(),
      db.collection('payments').find().sort({ paidAt: -1 }).limit(5).toArray(),
    ]);

    res.json({
      totalUsers,
      totalQuotes,
      totalPayments,
      totalInvoices,
      unreadNotifications,
      totalPaid: sumPaid[0]?.sum || 0,
      totalInvoiced: sumInvoiced[0]?.sum || 0,
      usersByRole,
      recentPayments
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router3;
