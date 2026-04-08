import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
};

export default function PrintLedger() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!data) return null;

  const { customer, entries, payments, summary } = data;
  const printDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white p-6 max-w-4xl mx-auto">
      <div className="no-print mb-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="btn-primary"
        >
          🖨 Print / Save PDF
        </button>
        <Link to={`/customers/${id}`} className="btn-secondary">
          ← Back to Detail
        </Link>
      </div>

      <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
        <div className="bg-primary-700 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">🌿 Kendhu Leaf Management</h1>
          <p className="text-primary-200 mt-1">Customer Ledger Report</p>
          <p className="text-primary-300 text-sm mt-1">Printed on: {printDate}</p>
        </div>

        <div className="p-6 border-b border-gray-200 grid sm:grid-cols-2 gap-4 bg-gray-50">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Customer</p>
            <p className="text-xl font-bold text-gray-900">{customer.name}</p>
            {customer.mobile && <p className="text-gray-600 text-sm">📞 {customer.mobile}</p>}
            {customer.address && <p className="text-gray-600 text-sm">📍 {customer.address}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:text-right">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-500 font-semibold">Total Amount</p>
              <p className="font-bold text-blue-800 text-sm">{fmt(summary.total_amount)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-500 font-semibold">Total Paid</p>
              <p className="font-bold text-green-700 text-sm">{fmt(summary.total_paid)}</p>
            </div>
            <div className={`rounded-lg p-3 ${summary.balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-xs font-semibold ${summary.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>Balance Due</p>
              <p className={`font-bold text-sm ${summary.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>{fmt(summary.balance)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-bold text-gray-800 mb-3 text-lg">Patta Entries</h2>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-primary-800 border-b border-gray-200">#</th>
                <th className="text-left px-3 py-2 font-semibold text-primary-800 border-b border-gray-200">Date</th>
                <th className="text-right px-3 py-2 font-semibold text-primary-800 border-b border-gray-200">Satta</th>
                <th className="text-right px-3 py-2 font-semibold text-primary-800 border-b border-gray-200">Bidda</th>
                <th className="text-right px-3 py-2 font-semibold text-primary-800 border-b border-gray-200">Total Bidda</th>
                <th className="text-right px-3 py-2 font-semibold text-primary-800 border-b border-gray-200">Rate</th>
                <th className="text-right px-3 py-2 font-semibold text-primary-800 border-b border-gray-200">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">No entries</td></tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-700">{fmtDate(e.date)}</td>
                    <td className="px-3 py-2 text-right">{e.satta_count}</td>
                    <td className="px-3 py-2 text-right">{e.bidda_count}</td>
                    <td className="px-3 py-2 text-right font-medium">{e.total_bidda}</td>
                    <td className="px-3 py-2 text-right text-gray-600">₹{e.rate_per_bidda}</td>
                    <td className="px-3 py-2 text-right font-semibold text-primary-700">{fmt(e.total_amount)}</td>
                  </tr>
                ))
              )}
              {entries.length > 0 && (
                <tr className="bg-primary-50 border-t-2 border-primary-200 font-bold">
                  <td colSpan={4} className="px-3 py-2 text-primary-800">Total</td>
                  <td className="px-3 py-2 text-right text-primary-800">{entries.reduce((s, e) => s + e.total_bidda, 0)}</td>
                  <td></td>
                  <td className="px-3 py-2 text-right text-primary-800">{fmt(entries.reduce((s, e) => s + e.total_amount, 0))}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200">
          <h2 className="font-bold text-gray-800 mb-3 text-lg">Payments</h2>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-blue-800 border-b border-gray-200">#</th>
                <th className="text-left px-3 py-2 font-semibold text-blue-800 border-b border-gray-200">Date</th>
                <th className="text-right px-3 py-2 font-semibold text-blue-800 border-b border-gray-200">Amount</th>
                <th className="text-left px-3 py-2 font-semibold text-blue-800 border-b border-gray-200">Mode</th>
                <th className="text-left px-3 py-2 font-semibold text-blue-800 border-b border-gray-200">Note</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">No payments</td></tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-700">{fmtDate(p.payment_date)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-green-600">{fmt(p.amount_paid)}</td>
                    <td className="px-3 py-2">{p.payment_mode}</td>
                    <td className="px-3 py-2 text-gray-500">{p.note || '—'}</td>
                  </tr>
                ))
              )}
              {payments.length > 0 && (
                <tr className="bg-blue-50 border-t-2 border-blue-200 font-bold">
                  <td colSpan={2} className="px-3 py-2 text-blue-800">Total Paid</td>
                  <td className="px-3 py-2 text-right text-blue-800">{fmt(payments.reduce((s, p) => s + p.amount_paid, 0))}</td>
                  <td colSpan={2}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-800 text-white text-center text-xs">
          <p>Kendhu Leaf Management System • This is a computer-generated ledger</p>
        </div>
      </div>
    </div>
  );
}
