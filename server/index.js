require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 5000;
const authMiddleware = require('./middleware/auth');

// Validate required environment variables at startup
const requiredEnvVars = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Rate limiter for protected API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Protected routes
app.use('/api/customers', apiLimiter, authMiddleware, require('./routes/customers'));
app.use('/api/entries', apiLimiter, authMiddleware, require('./routes/entries'));
app.use('/api/payments', apiLimiter, authMiddleware, require('./routes/payments'));
app.use('/api/dashboard', apiLimiter, authMiddleware, require('./routes/dashboard'));

// Serve React Frontend (Production) — must remain after all API route definitions
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
