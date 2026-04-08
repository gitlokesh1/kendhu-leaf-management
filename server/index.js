require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const authMiddleware = require('./middleware/auth');

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Protected routes
app.use('/api/customers', authMiddleware, require('./routes/customers'));
app.use('/api/entries', authMiddleware, require('./routes/entries'));
app.use('/api/payments', authMiddleware, require('./routes/payments'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));

// Serve React Frontend (Production) — must remain after all API route definitions
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
