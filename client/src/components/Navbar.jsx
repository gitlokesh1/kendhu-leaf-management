import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, LogOut, Menu, X } from 'lucide-react';
import { logout } from '../utils/auth';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/customers', label: 'Customers' },
    { to: '/entries/new', label: 'Add Entry' },
    { to: '/payments/new', label: 'Add Payment' },
  ];

  return (
    <nav className="bg-primary-700 text-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setMenuOpen(false)}>
            <Leaf className="h-6 w-6 text-primary-200" />
            <span className="hidden sm:block">Kendhu Leaf Management</span>
            <span className="sm:hidden">KLM</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex gap-1 sm:gap-2 items-center">
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

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-primary-600 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden bg-primary-800 border-t border-primary-600 px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-3 rounded-md text-sm font-medium transition-colors ${
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
            className="w-full flex items-center gap-2 px-3 py-3 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
