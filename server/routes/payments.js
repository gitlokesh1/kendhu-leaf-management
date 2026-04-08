const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, customers(name)')
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const payments = (data || []).map((p) => ({
      ...p,
      customer_name: p.customers ? p.customers.name : null,
      customers: undefined
    }));

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new payment
router.post('/', async (req, res) => {
  try {
    const { customer_id, amount_paid, payment_date, payment_mode, note } = req.body;
    if (!customer_id || !amount_paid || !payment_date) {
      return res.status(400).json({ error: 'customer_id, amount_paid, and payment_date are required' });
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        customer_id,
        amount_paid: parseFloat(amount_paid),
        payment_date,
        payment_mode: payment_mode || 'Cash',
        note: note || null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
