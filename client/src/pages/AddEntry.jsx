import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authFetch } from '../utils/auth';

const today = () => new Date().toISOString().split('T')[0];

export default function AddEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomer = searchParams.get('customer');

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer_id: preselectedCustomer || '',
    date: today(),
    satta_count: '',
    bidda_count: '',
    rate_per_bidda: '5',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    authFetch('/api/customers')
      .then((r) => r.json())
      .then(setCustomers)
      .catch(console.error);
  }, []);

  const satta = parseInt(form.satta_count) || 0;
  const bidda = parseInt(form.bidda_count) || 0;
  const rate = parseFloat(form.rate_per_bidda) || 5;
  const totalBidda = satta * 100 + bidda;
  const totalAmount = totalBidda * rate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) return setError('Please select a customer');
    if (satta === 0 && bidda === 0) return setError('Please enter satta or bidda count');
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save entry');
      setSuccess('Entry saved successfully!');
      setTimeout(() => navigate(`/customers/${form.customer_id}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Add Leaf Entry</h1>
      </div>

      <div className="card">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
            <select
              className="input-field"
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              required
            >
              <option value="">— Select Customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satta Count</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.satta_count}
                onChange={(e) => setForm({ ...form, satta_count: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1">1 Satta = 100 Bidda</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bidda Count</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.bidda_count}
                onChange={(e) => setForm({ ...form, bidda_count: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Bidda (₹)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              className="input-field"
              value={form.rate_per_bidda}
              onChange={(e) => setForm({ ...form, rate_per_bidda: e.target.value })}
            />
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-primary-800 text-sm">Live Preview</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Total Bidda:</div>
              <div className="font-semibold text-gray-900 text-right">{totalBidda.toLocaleString('en-IN')}</div>
              <div className="text-gray-600">Rate per Bidda:</div>
              <div className="font-semibold text-gray-900 text-right">₹{rate}</div>
              <div className="text-primary-700 font-semibold">Total Amount:</div>
              <div className="text-xl font-bold text-primary-700 text-right">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
