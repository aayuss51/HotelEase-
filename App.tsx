import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/public/Login';
import { Home } from './pages/public/Home';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Rooms } from './pages/admin/Rooms';
import { Facilities } from './pages/admin/Facilities';
import { Bookings } from './pages/admin/Bookings';
import { ConciergeChat } from './components/ConciergeChat';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode, requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // Allow SUPER_ADMIN to access ADMIN routes
  if (requiredRole === 'ADMIN' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
    return <>{children}</>;
  }

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const LayoutWithChat: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-blue-900">HotelEase</Link>
        <div className="flex items-center gap-4">
           <PublicNav />
        </div>
      </div>
    </nav>
    <main>{children}</main>
    <ConciergeChat />
  </>
);

const PublicNav = () => {
    const { user, logout } = useAuth();
    if (user) {
        return (
            <>
             <span className="text-sm text-gray-600 hidden md:block">Hi, {user.name}</span>
             {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
               <Link to="/admin" className="text-sm font-medium text-blue-600 hover:underline">Admin Panel</Link>
             )}
             <button onClick={logout} className="text-sm font-medium text-gray-600 hover:text-gray-900">Logout</button>
            </>
        )
    }
    return (
      <Link 
        to="/login" 
        className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Login
      </Link>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<LayoutWithChat><Home /></LayoutWithChat>} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;