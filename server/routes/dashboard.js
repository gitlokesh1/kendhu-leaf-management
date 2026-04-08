const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET dashboard summary
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: todayEntriesData } = await supabase
      .from('leaf_entries')
      .select('total_amount')
      .eq('date', today);

    const { data: todayPaymentsData } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('payment_date', today);

    const { data: allEntries } = await supabase
      .from('leaf_entries')
      .select('total_amount');

    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount_paid');

    const today_entries_count = todayEntriesData ? todayEntriesData.length : 0;
    const today_total_amount = todayEntriesData
      ? todayEntriesData.reduce((sum, e) => sum + Number(e.total_amount), 0)
      : 0;
    const today_total_payments = todayPaymentsData
      ? todayPaymentsData.reduce((sum, p) => sum + Number(p.amount_paid), 0)
      : 0;
    const total_amount_all = allEntries
      ? allEntries.reduce((sum, e) => sum + Number(e.total_amount), 0)
      : 0;
    const total_paid_all = allPayments
      ? allPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0)
      : 0;

    res.json({
      today_entries_count,
      today_total_amount,
      today_total_payments,
      overall_pending_balance: total_amount_all - total_paid_all
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
