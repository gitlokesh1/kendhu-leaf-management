import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, Wallet } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/entries/new', label: 'Entry', icon: PlusCircle },
  { to: '/payments/new', label: 'Payment', icon: Wallet },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 no-print safe-area-bottom">
      <div className="flex">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors min-h-[56px] ${
                active
                  ? 'text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary-700' : 'text-gray-400'}`} />
              <span>{label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-primary-600 rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
