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

    const dateStr = payment_date.replace(/-/g, '');
    const { count } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_date', payment_date);
    const serial = String((count || 0) + 1).padStart(3, '0');
    const transaction_id = `KL-P-${dateStr}-${serial}`;

    const { data, error } = await supabase
      .from('payments')
      .insert({
        customer_id,
        amount_paid: parseFloat(amount_paid),
        payment_date,
        payment_mode: payment_mode || 'Cash',
        note: note || null,
        transaction_id
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment
router.put('/:id', async (req, res) => {
  try {
    const { amount_paid, payment_date, payment_mode, note } = req.body;
    const updateData = {};
    if (amount_paid !== undefined) updateData.amount_paid = parseFloat(amount_paid);
    if (payment_date) updateData.payment_date = payment_date;
    if (payment_mode) updateData.payment_mode = payment_mode;
    if (note !== undefined) updateData.note = note || null;

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
