import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/customers')
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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add New Customer
        </button>
      </div>

      <div className="card !p-4">
        <input
          type="text"
          className="input-field"
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
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-50 border-b border-primary-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-primary-800">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-800">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-800 hidden sm:table-cell">Mobile</th>
                  <th className="text-right px-4 py-3 font-semibold text-primary-800">Total Amount</th>
                  <th className="text-right px-4 py-3 font-semibold text-primary-800 hidden md:table-cell">Total Paid</th>
                  <th className="text-right px-4 py-3 font-semibold text-primary-800">Balance</th>
                  <th className="text-center px-4 py-3 font-semibold text-primary-800">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.mobile || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-800">{fmt(c.total_amount)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium hidden md:table-cell">{fmt(c.total_paid)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {fmt(c.balance)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/customers/${c.id}`}
                          className="text-primary-600 hover:text-primary-800 font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {fmt(filtered.reduce((s, c) => s + (Number(c.total_amount) || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600 hidden md:table-cell">
                      {fmt(filtered.reduce((s, c) => s + (Number(c.total_paid) || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {fmt(filtered.reduce((s, c) => s + (Number(c.balance) || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
