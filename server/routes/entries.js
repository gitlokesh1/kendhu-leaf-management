const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all entries, optionally filter by date
router.get('/', (req, res) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT le.*, c.name as customer_name
      FROM leaf_entries le
      JOIN customers c ON c.id = le.customer_id
    `;
    const params = [];
    if (date) {
      query += ' WHERE le.date = ?';
      params.push(date);
    }
    query += ' ORDER BY le.date DESC, le.created_at DESC';
    const entries = db.prepare(query).all(...params);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new entry
router.post('/', (req, res) => {
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

    const result = db.prepare(`
      INSERT INTO leaf_entries (customer_id, date, satta_count, bidda_count, total_bidda, rate_per_bidda, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(customer_id, date, satta, bidda, total_bidda, rate, total_amount);

    const entry = db.prepare('SELECT * FROM leaf_entries WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
