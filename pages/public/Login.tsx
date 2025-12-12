import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { UserRole } from '../../types';
import { Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin/Super Admin Logic - Strict Password Check
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      if (password !== 'admin123') {
        setError('Invalid admin password. (Hint: Use "admin123")');
        return;
      }
    } 
    // Guest Logic - Flexible Password for Mock App
    // We accept any password >= 6 chars to allow users who just registered 
    // with their own password to log in "successfully".
    else if (role === 'GUEST') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    login(email, role);
    
    // Smart Redirect:
    // 1. If user was redirected here (e.g. from /book), send them back there.
    // 2. If Admin, send to Dashboard.
    // 3. Otherwise, send to Home.
    const state = location.state as { from?: { pathname: string, search?: string } } | null;
    const from = state?.from?.pathname 
      ? state.from.pathname + (state.from.search || '')
      : (role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin' : '/');
    
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full animate-fade-in border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
             <div className="grid grid-cols-3 gap-2">
               <button
                 type="button"
                 onClick={() => { setRole('GUEST'); setError(''); }}
                 className={`py-3 rounded-lg border font-medium transition-all text-sm ${
                   role === 'GUEST' 
                   ? 'bg-emerald-600 text-white border-emerald-600' 
                   : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 Guest
               </button>
               <button
                 type="button"
                 onClick={() => setRole('ADMIN')}
                 className={`py-3 rounded-lg border font-medium transition-all text-sm ${
                   role === 'ADMIN' 
                   ? 'bg-slate-900 text-white border-slate-900' 
                   : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 Admin
               </button>
               <button
                 type="button"
                 onClick={() => setRole('SUPER_ADMIN')}
                 className={`py-3 rounded-lg border font-medium transition-all text-sm ${
                   role === 'SUPER_ADMIN' 
                   ? 'bg-purple-900 text-white border-purple-900' 
                   : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 Super Admin
               </button>
             </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3" size="lg">
            Sign In
          </Button>

          <div className="text-center mt-4">
             <p className="text-sm text-gray-600 mb-2">
               Don't have an account?{' '}
               <Link to="/register" className="text-emerald-600 font-medium hover:underline">
                 Sign up
               </Link>
             </p>
             {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
               <p className="text-xs text-gray-400 mt-2">
                 Hint: The mock admin password is 'admin123'
               </p>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};
