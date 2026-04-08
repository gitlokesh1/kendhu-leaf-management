import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';
import { authFetch } from '../utils/auth';
import {
  BarChart3, CreditCard, AlertCircle, ArrowLeft, PlusCircle, Wallet,
  Printer, Phone, MapPin, Pencil, Trash2, X, BookOpen, List, Receipt
} from 'lucide-react';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
};

function EditEntryModal({ entry, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: entry.date,
    satta_count: entry.satta_count,
    bidda_count: entry.bidda_count,
    rate_per_bidda: entry.rate_per_bidda,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const satta = parseInt(form.satta_count) || 0;
  const bidda = parseInt(form.bidda_count) || 0;
  const rate = parseFloat(form.rate_per_bidda) || 5;
  const totalBidda = satta * 100 + bidda;
  const totalAmount = totalBidda * rate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`/api/entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update entry');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="input-field" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satta Count</label>
              <input type="number" min="0" className="input-field" value={form.satta_count}
                onChange={(e) => setForm({ ...form, satta_count: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bidda Count</label>
              <input type="number" min="0" className="input-field" value={form.bidda_count}
                onChange={(e) => setForm({ ...form, bidda_count: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Bidda (₹)</label>
            <input type="number" min="0" step="0.5" className="input-field" value={form.rate_per_bidda}
              onChange={(e) => setForm({ ...form, rate_per_bidda: e.target.value })} />
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bidda:</span>
              <span className="font-semibold">{totalBidda}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-primary-700 font-semibold">Total Amount:</span>
              <span className="font-bold text-primary-700">{fmt(totalAmount)}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPaymentModal({ payment, onClose, onSaved }) {
  const [form, setForm] = useState({
    payment_date: payment.payment_date,
    amount_paid: payment.amount_paid,
    payment_mode: payment.payment_mode,
    note: payment.note || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update payment');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="input-field" value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input type="number" min="0.01" step="0.01" className="input-field" value={form.amount_paid}
              onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <div className="flex gap-3">
              {['Cash', 'UPI', 'Bank'].map((mode) => (
                <button key={mode} type="button"
                  onClick={() => setForm({ ...form, payment_mode: mode })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.payment_mode === mode
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <input type="text" className="input-field" value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Partial payment, advance..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ledger');
  const [editEntry, setEditEntry] = useState(null);
  const [editPayment, setEditPayment] = useState(null);

  const fetchData = useCallback(() => {
    authFetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await authFetch(`/api/entries/${entryId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete entry');
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      const res = await authFetch(`/api/payments/${paymentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete payment');
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const { customer, entries, payments } = data;
    const rows = [['Type', 'Txn ID', 'Date', 'Description', 'Debit', 'Credit']];
    let balance = 0;
    const ledger = buildLedger(entries, payments);
    ledger.forEach((row) => {
      rows.push([
        row.type,
        row.txn_id || '',
        fmtDate(row.date),
        row.description,
        row.debit ? row.debit.toFixed(2) : '',
        row.credit ? row.credit.toFixed(2) : '',
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customer.name}-ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-20 text-primary-600">Loading...</div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;
  if (!data) return null;

  const { customer, entries, payments, summary } = data;

  return (
    <div className="space-y-6">
      {editEntry && (
        <EditEntryModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onSaved={() => { setEditEntry(null); fetchData(); }}
        />
      )}
      {editPayment && (
        <EditPaymentModal
          payment={editPayment}
          onClose={() => setEditPayment(null)}
          onSaved={() => { setEditPayment(null); fetchData(); }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
            {customer.mobile && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {customer.mobile}
              </span>
            )}
            {customer.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {customer.address}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Link to={`/entries/new?customer=${id}`} className="btn-primary text-sm flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Entry
          </Link>
          <Link to={`/payments/new?customer=${id}`} className="btn-secondary text-sm flex items-center gap-1">
            <Wallet className="h-4 w-4" /> Add Payment
          </Link>
          <Link to={`/customers/${id}/print`} target="_blank" className="btn-secondary text-sm flex items-center gap-1">
            <Printer className="h-4 w-4" /> Print Ledger
          </Link>
          <button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-1">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Amount" value={fmt(summary.total_amount)} icon={<BarChart3 className="h-5 w-5" />} color="blue" />
        <SummaryCard title="Total Paid" value={fmt(summary.total_paid)} icon={<CreditCard className="h-5 w-5" />} color="green" />
        <SummaryCard
          title="Balance Due"
          value={fmt(summary.balance)}
          icon={<AlertCircle className="h-5 w-5" />}
          color={summary.balance > 0 ? 'red' : 'green'}
        />
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'ledger', label: 'Ledger View', icon: <BookOpen className="h-4 w-4" /> },
            { key: 'entries', label: `Entries (${entries.length})`, icon: <List className="h-4 w-4" /> },
            { key: 'payments', label: `Payments (${payments.length})`, icon: <Receipt className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-700 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.key === 'ledger' ? 'Ledger' : tab.key === 'entries' ? `E(${entries.length})` : `P(${payments.length})`}</span>
            </button>
          ))}
        </div>

        {activeTab === 'ledger' && <LedgerView entries={entries} payments={payments} />}
        {activeTab === 'entries' && (
          <EntriesTable
            entries={entries}
            onEdit={setEditEntry}
            onDelete={handleDeleteEntry}
          />
        )}
        {activeTab === 'payments' && (
          <PaymentsTable
            payments={payments}
            onEdit={setEditPayment}
            onDelete={handleDeletePayment}
          />
        )}
      </div>
    </div>
  );
}

function buildLedger(entries, payments) {
  const rows = [];
  entries.forEach((e) => {
    rows.push({
      type: 'entry',
      date: e.date,
      txn_id: e.transaction_id,
      description: `${e.satta_count} Satta, ${e.bidda_count} Bidda`,
      debit: Number(e.total_amount),
      credit: 0,
      _raw: e,
    });
  });
  payments.forEach((p) => {
    rows.push({
      type: 'payment',
      date: p.payment_date,
      txn_id: p.transaction_id,
      description: `${p.payment_mode} Payment${p.note ? ' — ' + p.note : ''}`,
      debit: 0,
      credit: Number(p.amount_paid),
      _raw: p,
    });
  });
  rows.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return 0;
  });
  return rows;
}

function LedgerView({ entries, payments }) {
  const rows = buildLedger(entries, payments);
  let balance = 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Txn ID</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Description</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">Debit (+)</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">Credit (-)</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr className="bg-gray-50">
            <td colSpan={5} className="px-4 py-2 text-xs text-gray-500 font-medium">Opening Balance</td>
            <td className="px-4 py-2 text-right text-xs font-medium text-gray-700">₹0.00</td>
          </tr>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">No transactions yet</td>
            </tr>
          ) : (
            rows.map((row, i) => {
              balance += row.debit - row.credit;
              return (
                <tr key={i} className={`hover:bg-gray-50 ${row.type === 'payment' ? 'bg-green-50/30' : ''}`}>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(row.date)}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {row.txn_id ? (
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{row.txn_id}</span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    {row.debit > 0 ? fmt(row.debit) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    {row.credit > 0 ? fmt(row.credit) : '—'}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {fmt(balance)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        {rows.length > 0 && (
          <tfoot className="border-t-2 border-gray-300 bg-gray-50">
            <tr>
              <td colSpan={5} className="px-4 py-3 font-semibold text-gray-700">Closing Balance</td>
              <td className={`px-4 py-3 text-right font-bold text-lg ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {fmt(balance)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function EntriesTable({ entries, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Txn ID</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">Satta</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">Bidda</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Total Bidda</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Rate</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">Amount</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-8 text-gray-400">No entries yet</td></tr>
          ) : (
            entries.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 hidden md:table-cell">
                  {e.transaction_id ? (
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{e.transaction_id}</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{fmtDate(e.date)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{e.satta_count}</td>
                <td className="px-4 py-3 text-right text-gray-700">{e.bidda_count}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900 hidden sm:table-cell">{e.total_bidda}</td>
                <td className="px-4 py-3 text-right text-gray-600 hidden sm:table-cell">₹{e.rate_per_bidda}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary-700">{fmt(e.total_amount)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(e)} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(e.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
        {entries.length > 0 && (
          <tfoot className="bg-primary-50 border-t-2 border-primary-100">
            <tr>
              <td colSpan={4} className="px-4 py-3 font-semibold text-primary-800 hidden md:table-cell">Total</td>
              <td colSpan={4} className="px-4 py-3 font-semibold text-primary-800 md:hidden">Total</td>
              <td className="px-4 py-3 text-right font-semibold text-primary-800 hidden sm:table-cell">
                {entries.reduce((s, e) => s + e.total_bidda, 0)}
              </td>
              <td className="hidden sm:table-cell"></td>
              <td className="px-4 py-3 text-right font-bold text-primary-800">
                {fmt(entries.reduce((s, e) => s + e.total_amount, 0))}
              </td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function PaymentsTable({ payments, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Txn ID</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">Amount</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Mode</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Note</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments yet</td></tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 hidden md:table-cell">
                  {p.transaction_id ? (
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{p.transaction_id}</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{fmtDate(p.payment_date)}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">{fmt(p.amount_paid)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.payment_mode === 'Cash' ? 'bg-green-100 text-green-700' :
                    p.payment_mode === 'UPI' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {p.payment_mode}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.note || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(p)} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(p.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
        {payments.length > 0 && (
          <tfoot className="bg-blue-50 border-t-2 border-blue-100">
            <tr>
              <td colSpan={2} className="px-4 py-3 font-semibold text-blue-800 hidden md:table-cell">Total Paid</td>
              <td colSpan={2} className="px-4 py-3 font-semibold text-blue-800 md:hidden">Total Paid</td>
              <td className="px-4 py-3 text-right font-bold text-blue-800">
                {fmt(payments.reduce((s, p) => s + p.amount_paid, 0))}
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
