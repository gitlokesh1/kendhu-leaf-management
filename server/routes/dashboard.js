const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET dashboard summary with enhanced stats
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    const [
      todayEntriesRes,
      todayPaymentsRes,
      allEntriesRes,
      allPaymentsRes,
      weekEntriesRes,
      monthEntriesRes,
      customersCountRes,
      allCustomersRes
    ] = await Promise.all([
      supabase.from('leaf_entries').select('total_amount').eq('date', today),
      supabase.from('payments').select('amount_paid').eq('payment_date', today),
      supabase.from('leaf_entries').select('customer_id, total_amount'),
      supabase.from('payments').select('customer_id, amount_paid'),
      supabase.from('leaf_entries').select('total_amount').gte('date', weekAgoStr),
      supabase.from('leaf_entries').select('total_amount').gte('date', monthStart),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('id, name, mobile')
    ]);

    const todayEntriesData = todayEntriesRes.data || [];
    const todayPaymentsData = todayPaymentsRes.data || [];
    const allEntries = allEntriesRes.data || [];
    const allPayments = allPaymentsRes.data || [];
    const weekEntries = weekEntriesRes.data || [];
    const monthEntries = monthEntriesRes.data || [];
    const allCustomers = allCustomersRes.data || [];

    const today_entries_count = todayEntriesData.length;
    const today_total_amount = todayEntriesData.reduce((sum, e) => sum + Number(e.total_amount), 0);
    const today_total_payments = todayPaymentsData.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const total_amount_all = allEntries.reduce((sum, e) => sum + Number(e.total_amount), 0);
    const total_paid_all = allPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const weekly_amount = weekEntries.reduce((sum, e) => sum + Number(e.total_amount), 0);
    const monthly_amount = monthEntries.reduce((sum, e) => sum + Number(e.total_amount), 0);
    const total_customers = customersCountRes.count || 0;

    const entryTotalByCustomer = new Map();
    allEntries.forEach((e) => {
      entryTotalByCustomer.set(e.customer_id, (entryTotalByCustomer.get(e.customer_id) || 0) + Number(e.total_amount));
    });
    const paymentTotalByCustomer = new Map();
    allPayments.forEach((p) => {
      paymentTotalByCustomer.set(p.customer_id, (paymentTotalByCustomer.get(p.customer_id) || 0) + Number(p.amount_paid));
    });

    const top_pending = allCustomers
      .map((c) => {
        const totalAmt = entryTotalByCustomer.get(c.id) || 0;
        const totalPaid = paymentTotalByCustomer.get(c.id) || 0;
        return { ...c, total_amount: totalAmt, total_paid: totalPaid, balance: totalAmt - totalPaid };
      })
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    res.json({
      today_entries_count,
      today_total_amount,
      today_total_payments,
      overall_pending_balance: total_amount_all - total_paid_all,
      weekly_amount,
      monthly_amount,
      total_customers,
      top_pending
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
