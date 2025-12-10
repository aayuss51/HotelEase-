import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BedDouble, Dumbbell, CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end: boolean;
  allowedRoles?: UserRole[];
}

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Safety check: If user is somehow null here (despite ProtectedRoute), don't render content that relies on it.
  if (!user) {
    return null; 
  }

  const navItems: NavItem[] = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/rooms', label: 'Rooms', icon: BedDouble, end: false },
    { 
      to: '/admin/facilities', 
      label: 'Facilities', 
      icon: Dumbbell, 
      end: false, 
      allowedRoles: ['SUPER_ADMIN'] // Only Super Admin can manage facilities
    },
    { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays, end: false },
  ];

  const visibleNavItems = navItems.filter(item => {
    // If no specific roles are defined, it's open to all authenticated admins
    if (!item.allowedRoles) return true;
    
    // Check if the current user has one of the allowed roles
    // Use optional chaining and ensure user.role exists
    return user.role && item.allowedRoles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-wider">Mero-Booking Admin</h1>
            {user.role && (
              <span className="text-xs text-slate-400 uppercase mt-1 tracking-wide font-medium">
                {user.role.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};