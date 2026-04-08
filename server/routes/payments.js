const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all payments
router.get('/', (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT p.*, c.name as customer_name
      FROM payments p
      JOIN customers c ON c.id = p.customer_id
      ORDER BY p.payment_date DESC, p.created_at DESC
    `).all();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new payment
router.post('/', (req, res) => {
  try {
    const { customer_id, amount_paid, payment_date, payment_mode, note } = req.body;
    if (!customer_id || !amount_paid || !payment_date) {
      return res.status(400).json({ error: 'customer_id, amount_paid, and payment_date are required' });
    }

    const result = db.prepare(`
      INSERT INTO payments (customer_id, amount_paid, payment_date, payment_mode, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(customer_id, parseFloat(amount_paid), payment_date, payment_mode || 'Cash', note || null);

    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
