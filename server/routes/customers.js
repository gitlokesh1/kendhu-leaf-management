const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET all customers with balance summary
router.get('/', async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) throw error;

    // Fetch all entries and payments in bulk to avoid N+1 queries
    const { data: allEntries } = await supabase
      .from('leaf_entries')
      .select('customer_id, total_amount');

    const { data: allPayments } = await supabase
      .from('payments')
      .select('customer_id, amount_paid');

    const customersWithBalance = customers.map((c) => {
      const entries = allEntries ? allEntries.filter((e) => e.customer_id === c.id) : [];
      const payments = allPayments ? allPayments.filter((p) => p.customer_id === c.id) : [];
      const total_amount = entries.reduce((sum, e) => sum + Number(e.total_amount), 0);
      const total_paid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      return { ...c, total_amount, total_paid, balance: total_amount - total_paid };
    });

    res.json(customersWithBalance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single customer with full details
router.get('/:id', async (req, res) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !customer) return res.status(404).json({ error: 'Customer not found' });

    const { data: entries } = await supabase
      .from('leaf_entries')
      .select('*')
      .eq('customer_id', req.params.id)
      .order('date', { ascending: false });

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', req.params.id)
      .order('payment_date', { ascending: false });

    const total_amount = entries ? entries.reduce((sum, e) => sum + Number(e.total_amount), 0) : 0;
    const total_paid = payments ? payments.reduce((sum, p) => sum + Number(p.amount_paid), 0) : 0;

    res.json({
      customer,
      entries: entries || [],
      payments: payments || [],
      summary: { total_amount, total_paid, balance: total_amount - total_paid }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new customer
router.post('/', async (req, res) => {
  try {
    const { name, mobile, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { data, error } = await supabase
      .from('customers')
      .insert({ name, mobile: mobile || null, address: address || null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, mobile, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { data, error } = await supabase
      .from('customers')
      .update({ name, mobile: mobile || null, address: address || null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
