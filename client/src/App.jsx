import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import AddEntry from './pages/AddEntry';
import AddPayment from './pages/AddPayment';
import PrintLedger from './pages/PrintLedger';
import Login from './pages/Login';
import { isLoggedIn } from './utils/auth';

const PrivateRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 sm:pb-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<CustomerList />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/entries/new" element={<AddEntry />} />
                  <Route path="/payments/new" element={<AddPayment />} />
                  <Route path="/customers/:id/print" element={<PrintLedger />} />
                </Routes>
              </main>
              <BottomNav />
            </div>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
