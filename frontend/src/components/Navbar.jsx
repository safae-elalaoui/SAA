import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, Plus, Heart, LogOut, MessageSquare, Shield, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-40 px-4 md:px-8 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto w-full pointer-events-auto bg-slate-950/75 border border-slate-900/60 backdrop-blur-xl px-6 py-3.5 rounded-2xl flex items-center justify-between shadow-2xl">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-orange-950/20 transform group-hover:rotate-6 transition-all duration-300">
            E
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:text-orange-400 transition-colors">
            Estate<span className="text-orange-500 font-extrabold">Elite</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link
            to="/"
            className={`hover:text-orange-400 transition-colors py-1 relative ${isActive('/') ? 'text-orange-500' : ''}`}
          >
            Home
            {isActive('/') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />}
          </Link>
          <Link
            to="/search?status=rent"
            className={`hover:text-orange-400 transition-colors py-1 relative ${isActive('/search') && location.search.includes('status=rent') ? 'text-orange-500' : ''}`}
          >
            Rent
          </Link>
          <Link
            to="/search?status=sale"
            className={`hover:text-orange-400 transition-colors py-1 relative ${isActive('/search') && location.search.includes('status=sale') ? 'text-orange-500' : ''}`}
          >
            Buy
          </Link>
          <Link
            to="/search"
            className={`hover:text-orange-400 transition-colors py-1 relative ${isActive('/search') && !location.search ? 'text-orange-500' : ''}`}
          >
            Browse All
          </Link>
        </div>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 hover:border-slate-700 hover:text-white transition-all text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs uppercase">
                  {user.username.charAt(0)}
                </div>
                <span>{user.username}</span>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-20 flex flex-col gap-1 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs text-slate-500">Logged in as</p>
                      <p className="text-sm font-semibold text-slate-200 truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-4.5 h-4.5 text-slate-400" />
                      Dashboard
                    </Link>

                    <Link
                      to="/dashboard?tab=favorites"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Heart className="w-4.5 h-4.5 text-slate-400" />
                      My Favorites
                    </Link>

                    <Link
                      to="/dashboard?tab=messages"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-4.5 h-4.5 text-slate-400" />
                      Inquiries Inbox
                    </Link>

                    {user.is_admin === 1 && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-orange-400 hover:bg-slate-800 hover:text-orange-300 transition-colors border-t border-slate-800/50 mt-1 pt-2"
                      >
                        <Shield className="w-4.5 h-4.5 text-orange-500" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors border-t border-slate-800/50 mt-1 pt-2"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-xl text-sm font-semibold transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          <Link
            to={user ? "/dashboard?tab=add-property" : "/login"}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl text-sm font-semibold hover:from-orange-500 hover:to-amber-400 transition-all flex items-center gap-1.5 shadow-lg shadow-orange-950/20"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-24 right-4 left-4 rounded-2xl bg-slate-900/95 border border-slate-800 p-6 z-40 pointer-events-auto flex flex-col gap-6 shadow-2xl backdrop-blur-2xl transition-all duration-300">
            <div className="flex flex-col gap-4 text-lg font-medium text-slate-300">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`hover:text-orange-400 py-1 ${isActive('/') ? 'text-orange-500 font-bold' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/search?status=rent"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                Rent properties
              </Link>
              <Link
                to="/search?status=sale"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                Buy properties
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                Browse All Properties
              </Link>
            </div>

            <div className="border-t border-slate-800 pt-6 flex flex-col gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm uppercase">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-slate-300 font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard?tab=favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-slate-300 font-medium"
                    >
                      <Heart className="w-4 h-4" />
                      Favorites
                    </Link>
                  </div>

                  {user.is_admin === 1 && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 bg-orange-950/20 border border-orange-500/30 rounded-xl text-orange-400 font-semibold"
                    >
                      <Shield className="w-4 h-4 text-orange-500" />
                      Admin Control
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="py-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-400 font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-3 border border-slate-800 bg-slate-900/50 rounded-xl text-slate-300 font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-3 bg-slate-100 rounded-xl text-slate-900 font-semibold"
                  >
                    Register
                  </Link>
                </div>
              )}

              <Link
                to={user ? "/dashboard?tab=add-property" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20"
              >
                <Plus className="w-4.5 h-4.5" />
                Add Property
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
