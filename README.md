# 🌿 Kendhu Leaf Management System

A full-stack web application for managing Kendhu leaf procurement and payments.

## Features

- **Dashboard**: Today's entries count, total amount, payments received, and overall pending balance
- **Customer Management**: Add customers, view balance summary, search by name/mobile
- **Leaf Entry Recording**: Record satta/bidda counts with auto-calculation of total amount
- **Payment Recording**: Record payments with Cash/UPI/Bank modes
- **Customer Ledger**: Full per-customer ledger with all entries and payments
- **Print Ledger**: Printable PDF-ready ledger for each customer
- **Mobile Responsive**: Works on mobile and desktop

## Formula

- 1 Satta = 100 Bidda
- Total Bidda = (Satta Count × 100) + Bidda Count
- Total Amount = Total Bidda × Rate per Bidda (default ₹5)

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6
- **Backend**: Node.js + Express.js
- **Database**: SQLite via built-in `node:sqlite` module (Node.js v22+)

## Setup & Running

### Install dependencies

```bash
npm install
cd client && npm install
```

### Development

```bash
npm run dev
```

This starts:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:5173

### Production Build

```bash
cd client && npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Dashboard summary stats |
| GET | /api/customers | All customers with balance |
| POST | /api/customers | Create new customer |
| GET | /api/customers/:id | Customer detail with entries & payments |
| GET | /api/entries | All leaf entries |
| POST | /api/entries | Create new leaf entry |
| GET | /api/payments | All payments |
| POST | /api/payments | Record new payment |
