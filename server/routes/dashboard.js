const express = require('express');
const router = express.Router();
const db = require('../db');

// GET dashboard summary
router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayEntries = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
      FROM leaf_entries WHERE date = ?
    `).get(today);

    const todayPayments = db.prepare(`
      SELECT COALESCE(SUM(amount_paid), 0) as total
      FROM payments WHERE payment_date = ?
    `).get(today);

    const overallBalance = db.prepare(`
      SELECT 
        COALESCE((SELECT SUM(total_amount) FROM leaf_entries), 0) -
        COALESCE((SELECT SUM(amount_paid) FROM payments), 0) as pending_balance
    `).get();

    res.json({
      today_entries_count: todayEntries.count,
      today_total_amount: todayEntries.total,
      today_total_payments: todayPayments.total,
      overall_pending_balance: overallBalance.pending_balance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
