import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';
import { authFetch } from '../utils/auth';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-primary-600 text-lg">Loading...</div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className="text-4xl">🌿</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Today's Entries"
          value={data.today_entries_count}
          icon="📋"
          color="green"
          subtitle="Leaf entries today"
        />
        <SummaryCard
          title="Today's Amount"
          value={fmt(data.today_total_amount)}
          icon="💰"
          color="blue"
          subtitle="Total billed today"
        />
        <SummaryCard
          title="Today's Payments"
          value={fmt(data.today_total_payments)}
          icon="✅"
          color="purple"
          subtitle="Payments received today"
        />
        <SummaryCard
          title="Overall Pending"
          value={fmt(data.overall_pending_balance)}
          icon="⏳"
          color={data.overall_pending_balance > 0 ? 'red' : 'green'}
          subtitle="Total outstanding balance"
        />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/entries/new"
            className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors group"
          >
            <div className="text-3xl">📝</div>
            <div>
              <div className="font-semibold text-primary-800 group-hover:text-primary-900">Add Leaf Entry</div>
              <div className="text-sm text-primary-600">Record new patta delivery</div>
            </div>
          </Link>
          <Link
            to="/payments/new"
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors group"
          >
            <div className="text-3xl">💵</div>
            <div>
              <div className="font-semibold text-blue-800 group-hover:text-blue-900">Record Payment</div>
              <div className="text-sm text-blue-600">Mark payment received</div>
            </div>
          </Link>
          <Link
            to="/customers"
            className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors group"
          >
            <div className="text-3xl">👥</div>
            <div>
              <div className="font-semibold text-purple-800 group-hover:text-purple-900">View Customers</div>
              <div className="text-sm text-purple-600">Manage all customers</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
