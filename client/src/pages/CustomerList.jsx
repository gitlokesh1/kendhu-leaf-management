import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';
import { authFetch } from '../utils/auth';
import { UserPlus, Search, Phone, MapPin, ChevronRight } from 'lucide-react';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    authFetch('/api/customers')
      .then((r) => r.json())
      .then((d) => { setCustomers(d); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.mobile && c.mobile.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <UserPlus className="h-4 w-4" />
          Add New Customer
        </button>
      </div>

      <div className="card !p-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Customer</h2>
            <CustomerForm
              onSuccess={() => { setShowModal(false); fetchCustomers(); }}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-primary-600">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">No customers found</div>
          ) : (
            filtered.map((c, i) => {
              const paidPct = c.total_amount > 0 ? Math.min(100, Math.round((c.total_paid / c.total_amount) * 100)) : 0;
              return (
                <Link
                  key={c.id}
                  to={`/customers/${c.id}`}
                  className="card !p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{c.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                          C-{String(i + 1).padStart(3, '0')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        {c.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {c.mobile}
                          </span>
                        )}
                        {c.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {c.address}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Paid {paidPct}%</span>
                          <span>{fmt(c.total_paid)} / {fmt(c.total_amount)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${paidPct >= 100 ? 'bg-green-500' : paidPct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${paidPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 flex-shrink-0">
                    <div className={`text-lg font-bold ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmt(c.balance)}
                    </div>
                    <div className="text-xs text-gray-500">balance due</div>
                    <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                  </div>
                </Link>
              );
            })
          )}

          {filtered.length > 0 && (
            <div className="card !p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-semibold">
              <span className="text-gray-600">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
              <div className="flex gap-4">
                <span className="text-gray-700">Total: {fmt(filtered.reduce((s, c) => s + (Number(c.total_amount) || 0), 0))}</span>
                <span className="text-green-600">Paid: {fmt(filtered.reduce((s, c) => s + (Number(c.total_paid) || 0), 0))}</span>
                <span className="text-red-600">Pending: {fmt(filtered.reduce((s, c) => s + (Number(c.balance) || 0), 0))}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
