const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all customers with balance summary
router.get('/', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT 
        c.*,
        COALESCE(SUM(le.total_amount), 0) as total_amount,
        COALESCE((SELECT SUM(p.amount_paid) FROM payments p WHERE p.customer_id = c.id), 0) as total_paid,
        COALESCE(SUM(le.total_amount), 0) - COALESCE((SELECT SUM(p.amount_paid) FROM payments p WHERE p.customer_id = c.id), 0) as balance
      FROM customers c
      LEFT JOIN leaf_entries le ON le.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single customer with full details
router.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const entries = db.prepare(`
      SELECT * FROM leaf_entries WHERE customer_id = ? ORDER BY date DESC, created_at DESC
    `).all(req.params.id);

    const payments = db.prepare(`
      SELECT * FROM payments WHERE customer_id = ? ORDER BY payment_date DESC, created_at DESC
    `).all(req.params.id);

    const summary = db.prepare(`
      SELECT
        COALESCE(SUM(le.total_amount), 0) as total_amount,
        COALESCE((SELECT SUM(p.amount_paid) FROM payments p WHERE p.customer_id = ?), 0) as total_paid
      FROM leaf_entries le
      WHERE le.customer_id = ?
    `).get(req.params.id, req.params.id);

    summary.balance = summary.total_amount - summary.total_paid;

    res.json({ customer, entries, payments, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new customer
router.post('/', (req, res) => {
  try {
    const { name, mobile, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const result = db.prepare(
      'INSERT INTO customers (name, mobile, address) VALUES (?, ?, ?)'
    ).run(name, mobile || null, address || null);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
