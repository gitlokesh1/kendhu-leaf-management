const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET all entries, optionally filter by date
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;

    let query = supabase
      .from('leaf_entries')
      .select('*, customers(name)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    const entries = (data || []).map((e) => ({
      ...e,
      customer_name: e.customers ? e.customers.name : null,
      customers: undefined
    }));

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new entry
router.post('/', async (req, res) => {
  try {
    const { customer_id, date, satta_count, bidda_count, rate_per_bidda } = req.body;
    if (!customer_id || !date) {
      return res.status(400).json({ error: 'customer_id and date are required' });
    }

    const satta = parseInt(satta_count) || 0;
    const bidda = parseInt(bidda_count) || 0;
    const rate = parseFloat(rate_per_bidda) || 5;
    const total_bidda = (satta * 100) + bidda;
    const total_amount = total_bidda * rate;

    const dateStr = date.replace(/-/g, '');
    const { count } = await supabase
      .from('leaf_entries')
      .select('*', { count: 'exact', head: true })
      .eq('date', date);
    const serial = String((count || 0) + 1).padStart(3, '0');
    const transaction_id = `KL-E-${dateStr}-${serial}`;

    const { data, error } = await supabase
      .from('leaf_entries')
      .insert({ customer_id, date, satta_count: satta, bidda_count: bidda, total_bidda, rate_per_bidda: rate, total_amount, transaction_id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update entry
router.put('/:id', async (req, res) => {
  try {
    const { satta_count, bidda_count, rate_per_bidda, date } = req.body;
    const satta = parseInt(satta_count) || 0;
    const bidda = parseInt(bidda_count) || 0;
    const rate = parseFloat(rate_per_bidda) || 5;
    const total_bidda = (satta * 100) + bidda;
    const total_amount = total_bidda * rate;

    const updateData = { satta_count: satta, bidda_count: bidda, rate_per_bidda: rate, total_bidda, total_amount };
    if (date) updateData.date = date;

    const { data, error } = await supabase
      .from('leaf_entries')
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

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('leaf_entries')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
