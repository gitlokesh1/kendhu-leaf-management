import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const today = () => new Date().toISOString().split('T')[0];
const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function AddPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomer = searchParams.get('customer');

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [form, setForm] = useState({
    customer_id: preselectedCustomer || '',
    amount_paid: '',
    payment_date: today(),
    payment_mode: 'Cash',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then(setCustomers)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (form.customer_id) {
      fetch(`/api/customers/${form.customer_id}`)
        .then((r) => r.json())
        .then((d) => setSelectedCustomerData(d.summary))
        .catch(console.error);
    } else {
      setSelectedCustomerData(null);
    }
  }, [form.customer_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) return setError('Please select a customer');
    if (!form.amount_paid || parseFloat(form.amount_paid) <= 0) return setError('Please enter a valid amount');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save payment');
      setSuccess('Payment recorded successfully!');
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
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Record Payment</h1>
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

          {selectedCustomerData && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="text-blue-500 text-xs">Total Amount</div>
                <div className="font-bold text-blue-800">{fmt(selectedCustomerData.total_amount)}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-500 text-xs">Total Paid</div>
                <div className="font-bold text-green-700">{fmt(selectedCustomerData.total_paid)}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-500 text-xs">Balance Due</div>
                <div className={`font-bold ${selectedCustomerData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {fmt(selectedCustomerData.balance)}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="input-field"
              value={form.amount_paid}
              onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              className="input-field"
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <div className="flex gap-3">
              {['Cash', 'UPI', 'Bank'].map((mode) => (
                <button
                  key={mode}
                  type="button"
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
            <input
              type="text"
              className="input-field"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Partial payment, advance..."
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Saving...' : 'Record Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
