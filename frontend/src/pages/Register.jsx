import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, UserPlus, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { user, register, showToast } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, bounce
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !phone.trim() || !password) {
      showToast('All registration fields are required!', 'warning');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password, phone.trim());
      // AuthContext handles token caching, profile seeding, and success redirects
    } catch (err) {
      // Handled in Context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 relative py-12">
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
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        {/* Title */}
        <div className="text-center mb-8 mt-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center font-bold text-white text-lg">
              E
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Immo<span className="text-orange-500 font-extrabold">direct</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Join us to post listings or make bookmark lists</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="luxury-input pl-10 pr-4 py-2 text-sm"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input pl-10 pr-4 py-2 text-sm"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="+212 600-000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="luxury-input pl-10 pr-4 py-2 text-sm"
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input pl-10 pr-4 py-2 text-sm"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 font-bold text-sm"
          >
            <UserPlus className="w-4.5 h-4.5" />
            <span>{loading ? 'Registering Account...' : 'Sign Up'}</span>
          </button>

        </form>

        {/* Existing account footnote */}
        <div className="border-t border-slate-900 mt-8 pt-6 text-center text-xs text-slate-400">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;
