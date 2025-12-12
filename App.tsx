import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { Home } from './pages/public/Home';
import { BookingSummary } from './pages/public/BookingSummary';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Rooms } from './pages/admin/Rooms';
import { Facilities } from './pages/admin/Facilities';
import { Bookings } from './pages/admin/Bookings';
import { Users } from './pages/admin/Users';
import { MyBookings } from './pages/guest/MyBookings';
import { ConciergeChat } from './components/ConciergeChat';
import { UserRole } from './types';
import { Crown } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode, requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;
  
  if (!user) {
    // Redirect to login but save the current location so we can send them back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Allow SUPER_ADMIN to access ADMIN routes
  if (requiredRole === 'ADMIN' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
    return <>{children}</>;
  }

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const LayoutWithChat: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Luxurious MB Logo - Updated to Green Theme */}
          <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transform group-hover:scale-105 transition-transform duration-300 border border-emerald-300">
             <div className="absolute -top-1 -right-1">
                <Crown size={14} className="text-emerald-100 drop-shadow-sm fill-emerald-200" />
             </div>
             <span className="font-serif font-black text-lg tracking-tighter leading-none mt-0.5 drop-shadow-md">MB</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">Mero-Booking</span>
        </Link>
        <div className="flex items-center gap-4">
           <PublicNav />
        </div>
      </div>
    </nav>
    <main className="flex-1">{children}</main>
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-500 text-sm font-medium">
                copyright &copy;2025 <span className="text-emerald-600 font-bold">Nova IT Solutions</span>
            </p>
        </div>
    </footer>
    <ConciergeChat />
  </div>
);

const PublicNav = () => {
    const { user, logout } = useAuth();
    if (user) {
        return (
            <>
             <span className="text-sm text-gray-600 hidden md:block font-medium">Namaste, {user.name}</span>
             {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
               <Link to="/admin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Admin Panel</Link>
             )}
             {/* Show My Bookings for everyone so Admins can test the flow too */}
             <Link to="/my-bookings" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">My Bookings</Link>
             <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-900">Logout</button>
            </>
        )
    }
    return (
      <div className="flex gap-3">
        <Link 
          to="/login" 
          className="text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-2 transition-colors"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          Sign Up
        </Link>
      </div>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<LayoutWithChat><Home /></LayoutWithChat>} />
          
          <Route path="/book" element={
            <ProtectedRoute>
              <LayoutWithChat>
                <BookingSummary />
              </LayoutWithChat>
            </ProtectedRoute>
          } />

          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <LayoutWithChat>
                <MyBookings />
              </LayoutWithChat>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="rooms" element={<Rooms />} />
                  <Route path="facilities" element={<Facilities />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="users" element={
                    <ProtectedRoute requiredRole="SUPER_ADMIN">
                      <Users />
                    </ProtectedRoute>
                  } />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
