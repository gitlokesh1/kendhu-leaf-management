# 🌿 Kendhu Leaf Management System

A full-stack digital ledger / register for tracking Kendhu (Tendu) leaf procurement from sellers, managing payments, and generating printable receipts.

## Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/0b13c076-4952-46fd-b56b-2b57c40fd6eb)

### Customers List
![Customers List](https://github.com/user-attachments/assets/49fa88e3-005c-4b49-bcfe-17c7133b02b0)

### Customer Detail (Full Ledger)
![Customer Detail](https://github.com/user-attachments/assets/8fb4bce3-b1af-4aae-a9e3-06ad88e7254b)

### Add Leaf Entry (with Live Preview)
![Add Entry](https://github.com/user-attachments/assets/de0f9aa1-c270-45ce-a2ae-88c69640396d)

### Record Payment
![Add Payment](https://github.com/user-attachments/assets/99a7bcfd-a195-488a-bfff-7549b4c65b5a)

## Features

- **Dashboard**: Today's entries count, total amount, payments received, and overall pending balance
- **Customer Management**: Add customers, view balance summary, search by name/mobile
- **Unlimited Entries Per Customer**: Each customer can have unlimited leaf entries across unlimited days — all linked by `customer_id` and shown in one place
- **Leaf Entry Recording**: Record satta/bidda counts with auto-calculation of total amount
- **Live Preview**: While adding an entry, instantly see Total Bidda and Total Amount update in real time
- **Payment Recording**: Record payments with Cash/UPI/Bank modes; shows customer's current balance before saving
- **Customer Ledger**: Full per-customer ledger — all entries and payments on one page, sorted by date
- **Running Balance**: For each customer, always shows Total Amount, Total Paid, and Balance Due
- **Print Ledger**: Printable PDF-ready ledger for each customer via `window.print()`
- **Mobile Responsive**: Clean, professional UI that works on mobile and desktop
- **Indian Rupee (₹)**: All amounts displayed in ₹ format with DD-MM-YYYY dates

## Formula

- 1 Satta = 100 Bidda
- Total Bidda = (Satta Count × 100) + Bidda Count
- Total Amount = Total Bidda × Rate per Bidda (default ₹5)

**Example:** 8 satta → 800 bidda → ₹4,000

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6
- **Backend**: Node.js + Express.js
- **Database**: SQLite via built-in `node:sqlite` module (Node.js v22+) — no external DB needed, file created automatically
- **Language**: JavaScript

## Project Structure

```
kendhu-leaf-management/
├── package.json          # Root: server deps + dev scripts
├── server/
│   ├── index.js          # Express server (port 5000)
│   ├── db.js             # SQLite setup & schema initialization
│   └── routes/
│       ├── customers.js
│       ├── entries.js
│       ├── payments.js
│       └── dashboard.js
└── client/
    ├── package.json
    ├── vite.config.js    # Proxies /api → localhost:5000
    └── src/
        ├── App.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── CustomerList.jsx
        │   ├── CustomerDetail.jsx
        │   ├── AddEntry.jsx
        │   ├── AddPayment.jsx
        │   └── PrintLedger.jsx
        └── components/
            ├── Navbar.jsx
            ├── CustomerForm.jsx
            └── SummaryCard.jsx
```

## Setup & Running

```bash
# Clone the repo
git clone https://github.com/gitlokesh1/kendhu-leaf-management.git
cd kendhu-leaf-management

# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Start both server and client together
npm run dev
```

This starts:
- **Backend server** on http://localhost:5000
- **Frontend dev server** on http://localhost:5173

### Individual scripts

```bash
npm run server   # Start Express server only
npm run client   # Start Vite dev server only
```

### Production Build

```bash
cd client && npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Today's stats + overall pending balance |
| GET | /api/customers | All customers with balance summary |
| POST | /api/customers | Create new customer |
| GET | /api/customers/:id | Customer detail + all entries & payments |
| GET | /api/entries | All leaf entries (with customer name) |
| POST | /api/entries | Create leaf entry (auto-calculates totals) |
| GET | /api/payments | All payments |
| POST | /api/payments | Record a payment |

## Database Schema

### customers
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| name | TEXT | Customer name (required) |
| mobile | TEXT | Mobile number |
| address | TEXT | Address |
| created_at | DATETIME | Auto timestamp |

### leaf_entries
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| customer_id | INTEGER FK | Links to customers |
| date | TEXT | Entry date |
| satta_count | INTEGER | Number of satta |
| bidda_count | INTEGER | Extra bidda (< 100) |
| total_bidda | INTEGER | (satta × 100) + bidda |
| rate_per_bidda | REAL | Default ₹5 |
| total_amount | REAL | total_bidda × rate |

### payments
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| customer_id | INTEGER FK | Links to customers |
| amount_paid | REAL | Payment amount |
| payment_date | TEXT | Date of payment |
| payment_mode | TEXT | Cash / UPI / Bank |
| note | TEXT | Optional note |
