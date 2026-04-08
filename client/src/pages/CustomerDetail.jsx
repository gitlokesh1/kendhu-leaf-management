import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <div className="text-center py-20 text-primary-600">Loading...</div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;
  if (!data) return null;

  const { customer, entries, payments, summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
            {customer.mobile && <span>📞 {customer.mobile}</span>}
            {customer.address && <span>📍 {customer.address}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Link to={`/entries/new?customer=${id}`} className="btn-primary text-sm">
            + Add Entry
          </Link>
          <Link to={`/payments/new?customer=${id}`} className="btn-secondary text-sm">
            + Add Payment
          </Link>
          <Link to={`/customers/${id}/print`} target="_blank" className="btn-secondary text-sm">
            🖨 Print Ledger
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Amount" value={fmt(summary.total_amount)} icon="📊" color="blue" />
        <SummaryCard title="Total Paid" value={fmt(summary.total_paid)} icon="✅" color="green" />
        <SummaryCard
          title="Balance Due"
          value={fmt(summary.balance)}
          icon="⚠️"
          color={summary.balance > 0 ? 'red' : 'green'}
        />
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
          <h2 className="font-semibold text-primary-800">Patta Entries ({entries.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Satta</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Bidda</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Total Bidda</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Rate</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No entries yet</td></tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{fmtDate(e.date)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{e.satta_count}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{e.bidda_count}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{e.total_bidda}</td>
                    <td className="px-4 py-3 text-right text-gray-600">₹{e.rate_per_bidda}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary-700">{fmt(e.total_amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {entries.length > 0 && (
              <tfoot className="bg-primary-50 border-t-2 border-primary-100">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-semibold text-primary-800">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary-800">
                    {entries.reduce((s, e) => s + e.total_bidda, 0)}
                  </td>
                  <td></td>
                  <td className="px-4 py-3 text-right font-bold text-primary-800">
                    {fmt(entries.reduce((s, e) => s + e.total_amount, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <h2 className="font-semibold text-blue-800">Payments ({payments.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Mode</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No payments yet</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-gray-500">{p.note || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
            {payments.length > 0 && (
              <tfoot className="bg-blue-50 border-t-2 border-blue-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-blue-800">Total Paid</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-800">
                    {fmt(payments.reduce((s, p) => s + p.amount_paid, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
