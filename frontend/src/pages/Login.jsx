import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, bounce to dashboard or home
  useEffect(() => {
    if (user) {
      const origin = location.state?.from || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    
    setLoading(true);
    try {
      await login(email.trim(), password);
      // AuthContext will handle state updates and toast alerts
    } catch (err) {
      // Handled in Context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 relative">
      {/* Background Graphic */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl shadow-2xl"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center font-bold text-white text-lg">
              E
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Estate<span className="text-orange-500 font-extrabold">Elite</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1.5">Sign in to manage listings and contact sellers</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input pl-10 pr-4 py-2.5 text-sm"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input pl-10 pr-4 py-2.5 text-sm"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 font-bold"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>

        </form>

        {/* Footnote links */}
        <div className="border-t border-slate-900 mt-8 pt-6 text-center text-xs text-slate-400">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
