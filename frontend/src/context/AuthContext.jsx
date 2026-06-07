import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Load user session on boot
  useEffect(() => {
    const savedToken = localStorage.getItem('estate_elite_token');
    const savedUser = localStorage.getItem('estate_elite_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      showToast(`Welcome back, ${data.user.username}!`, 'success');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, phone) => {
    setLoading(true);
    try {
      const data = await authService.register(username, email, password, phone);
      setUser(data.user);
      setToken(data.token);
      showToast('Registration successful! Welcome to EstateElite.', 'success');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    showToast('Logged out successfully.', 'info');
  };

  // Dispatch custom toast notification
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const syncProfile = async () => {
    if (!token) return;
    try {
      const data = await authService.getProfile();
      setUser(data.user);
      localStorage.setItem('estate_elite_user', JSON.stringify(data.user));
    } catch {
      // Sync failed
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        toasts,
        login,
        register,
        logout,
        showToast,
        removeToast,
        syncProfile
      }}
    >
      {children}
      
      {/* Premium custom Toast notifications container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 flex justify-between items-center ${
              toast.type === 'success'
                ? 'bg-emerald-950/85 border-emerald-500/30 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/85 border-rose-500/30 text-rose-200'
                : 'bg-slate-900/90 border-slate-500/20 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && (
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-slate-400 hover:text-white flex-shrink-0 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
