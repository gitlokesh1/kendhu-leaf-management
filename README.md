# Kendhu Leaf Management System

A full-stack digital ledger for tracking Kendhu (Tendu) leaf procurement from sellers, managing payments, and generating printable receipts.

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

- **Dashboard**: Today's entries count, total amount, payments received, overall pending balance, weekly/monthly amounts, total customers, and top 5 pending customers
- **Customer Management**: Add/edit customers, view balance summary, search by name/mobile
- **Unlimited Entries Per Customer**: Each customer can have unlimited leaf entries across unlimited days — all linked by `customer_id` and shown in one place
- **Leaf Entry Recording**: Record satta/bidda counts with auto-calculation of total amount; each entry gets a unique Transaction ID (e.g. `KL-E-20260408-001`)
- **Live Preview**: While adding an entry, instantly see Total Bidda and Total Amount update in real time
- **Payment Recording**: Record payments with Cash/UPI/Bank modes; shows customer's current balance before saving; each payment gets a unique Transaction ID (e.g. `KL-P-20260408-001`)
- **Edit & Delete Transactions**: Edit or delete leaf entries and payments via pencil/trash icons in the customer ledger
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
- **Database**: [Supabase](https://supabase.com) (hosted PostgreSQL) via `@supabase/supabase-js`

## Project Structure

```
kendhu-leaf-management/
├── package.json          # Root: server deps + dev scripts
├── server/
│   ├── index.js          # Express server (port 5000)
│   ├── db.js             # Supabase client setup
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

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the **SQL Editor**, run the following to create the tables:

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leaf_entries (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  date DATE NOT NULL,
  satta_count INTEGER DEFAULT 0,
  bidda_count INTEGER DEFAULT 0,
  total_bidda INTEGER NOT NULL,
  rate_per_bidda NUMERIC DEFAULT 5,
  total_amount NUMERIC NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  amount_paid NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode TEXT DEFAULT 'Cash',
  note TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. From **Project Settings → API**, copy your **Project URL** and **anon public** key.

> **Existing database migration:** If you already have the tables created without the `transaction_id` column, run this in the SQL Editor:
> ```sql
> ALTER TABLE leaf_entries ADD COLUMN IF NOT EXISTS transaction_id TEXT;
> ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
> ```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in your SUPABASE_URL and SUPABASE_ANON_KEY
```

### 3. Install & Run

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

### Production Build (EC2 / any server)

```bash
# Build React frontend
cd client && npm run build && cd ..

# Start server (serves API + static frontend)
node server/index.js
```

> The server listens on `0.0.0.0` so it is accessible externally on EC2.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Today's stats, weekly/monthly amounts, total customers, top pending |
| GET | /api/customers | All customers with balance summary |
| POST | /api/customers | Create new customer |
| PUT | /api/customers/:id | Update customer details |
| GET | /api/customers/:id | Customer detail + all entries & payments |
| GET | /api/entries | All leaf entries (with customer name) |
| POST | /api/entries | Create leaf entry (auto-calculates totals, assigns transaction ID) |
| PUT | /api/entries/:id | Update leaf entry |
| DELETE | /api/entries/:id | Delete leaf entry |
| GET | /api/payments | All payments |
| POST | /api/payments | Record a payment (assigns transaction ID) |
| PUT | /api/payments/:id | Update payment |
| DELETE | /api/payments/:id | Delete payment |

## Database Schema

Tables are created in **Supabase** (PostgreSQL). See the SQL above.

### customers
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment |
| name | TEXT | Customer name (required) |
| mobile | TEXT | Mobile number |
| address | TEXT | Address |
| created_at | TIMESTAMPTZ | Auto timestamp |

### leaf_entries
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment |
| customer_id | INTEGER FK | Links to customers |
| date | DATE | Entry date |
| satta_count | INTEGER | Number of satta |
| bidda_count | INTEGER | Extra bidda (< 100) |
| total_bidda | INTEGER | (satta × 100) + bidda |
| rate_per_bidda | NUMERIC | Default ₹5 |
| total_amount | NUMERIC | total_bidda × rate |
| transaction_id | TEXT | Unique ID e.g. KL-E-20260408-001 |

### payments
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment |
| customer_id | INTEGER FK | Links to customers |
| amount_paid | NUMERIC | Payment amount |
| payment_date | DATE | Date of payment |
| payment_mode | TEXT | Cash / UPI / Bank |
| note | TEXT | Optional note |
| transaction_id | TEXT | Unique ID e.g. KL-P-20260408-001 |
