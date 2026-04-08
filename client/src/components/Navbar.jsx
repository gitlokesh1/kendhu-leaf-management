import { Link, useLocation } from 'react-router-dom';
import { Leaf, LogOut } from 'lucide-react';
import { logout } from '../utils/auth';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/customers', label: 'Customers' },
    { to: '/entries/new', label: 'Add Entry' },
    { to: '/payments/new', label: 'Add Payment' },
  ];

  return (
    <nav className="bg-primary-700 text-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Leaf className="h-6 w-6 text-primary-200" />
            <span className="hidden sm:block">Kendhu Leaf Management</span>
            <span className="sm:hidden">KLM</span>
          </Link>
          <div className="flex gap-1 sm:gap-2 items-center">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary-900 text-white'
                    : 'hover:bg-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={logout}
              aria-label="Logout"
              className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors ml-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
