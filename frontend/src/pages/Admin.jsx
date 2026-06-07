import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Building, MessageSquare, Trash2, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import propertyService from '../services/propertyService';

const Admin = () => {
  const { user, token, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Admin Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);

  // Restrict access strictly to Admins
  useEffect(() => {
    if (!token) {
      showToast('Authentication required.', 'info');
      navigate('/login');
      return;
    }
    
    if (user && user.is_admin !== 1) {
      showToast('Restricted Access. Administrator credentials required!', 'error');
      navigate('/');
    }
  }, [user, token]);

  // Sync data based on selected sub-tab
  useEffect(() => {
    if (!user || user.is_admin !== 1) return;

    const loadAdminData = async () => {
      setLoading(true);
      try {
        if (activeSubTab === 'overview') {
          const statsData = await adminService.getStats();
          setStats(statsData);
        } else if (activeSubTab === 'users') {
          const uList = await adminService.getUsers();
          setUsersList(uList);
        } else if (activeSubTab === 'properties') {
          const pList = await propertyService.getProperties();
          setPropertiesList(pList);
        }
      } catch (err) {
        showToast('Failed to compile administrative statistics.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [activeSubTab, user]);

  const handleDeleteUser = async (uId) => {
    if (uId === user.id) {
      showToast('Self-deletion is prohibited!', 'warning');
      return;
    }

    if (!window.confirm('WARNING: Deleting this user will wipe out their account and all corresponding listings. Proceed?')) return;

    try {
      await adminService.deleteUser(uId);
      setUsersList((prev) => prev.filter((u) => u.id !== uId));
      showToast('User account successfully terminated.', 'success');
    } catch (err) {
      showToast('Could not delete user account.', 'error');
    }
  };

  const handleForceDeleteListing = async (pId) => {
    if (!window.confirm('Are you sure you want to moderate and remove this listing from the platform?')) return;

    try {
      await adminService.deleteProperty(pId);
      setPropertiesList((prev) => prev.filter((p) => p.id !== pId));
      showToast('Listing removed by administrative override.', 'success');
    } catch (err) {
      showToast('Failed to override listing removal.', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(price)
      .replace('MAD', 'DH');
  };

  if (!user || user.is_admin !== 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShieldAlert className="w-10 h-10 text-rose-500 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Platform moderation, data analytics, and user directory auditing</p>
        </div>

        {/* Sub-tab selections */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 border border-slate-800 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'overview' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'users' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveSubTab('properties')}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'properties' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Listings
          </button>
        </div>
      </div>

      {/* Main content Area */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 bg-slate-900 rounded-2xl shimmer" />
            <div className="h-28 bg-slate-900 rounded-2xl shimmer" />
            <div className="h-28 bg-slate-900 rounded-2xl shimmer" />
          </div>
          <div className="h-[400px] bg-slate-900 rounded-2xl shimmer" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* VIEW A: ANALYTICS OVERVIEW */}
          {activeSubTab === 'overview' && stats && (
            <div className="space-y-8">
              {/* Top counter widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Users</p>
                    <p className="text-2xl font-black text-white mt-0.5">{stats.users}</p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Properties</p>
                    <p className="text-2xl font-black text-white mt-0.5">{stats.properties}</p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customer Messages</p>
                    <p className="text-2xl font-black text-white mt-0.5">{stats.messages}</p>
                  </div>
                </div>

              </div>

              {/* Categorical Breakdowns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Breakdown by listing type */}
                <div className="glass-panel p-6 rounded-3xl shadow-2xl flex flex-col gap-4">
                  <h3 className="font-extrabold text-white text-sm uppercase tracking-wider border-b border-slate-900 pb-2">Properties By Type</h3>
                  <div className="flex flex-col gap-3 text-sm">
                    {[
                      { type: 'apartment', label: 'Apartments' },
                      { type: 'villa', label: 'Villas' },
                      { type: 'house', label: 'Houses' },
                      { type: 'land', label: 'Lands' }
                    ].map((row) => (
                      <div key={row.type} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-900/60">
                        <span className="font-semibold text-slate-300">{row.label}</span>
                        <span className="font-bold px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-orange-400">
                          {stats.types[row.type] || 0} listings
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown by listing status */}
                <div className="glass-panel p-6 rounded-3xl shadow-2xl flex flex-col gap-4">
                  <h3 className="font-extrabold text-white text-sm uppercase tracking-wider border-b border-slate-900 pb-2">Properties By Status</h3>
                  <div className="flex flex-col gap-3 text-sm">
                    {[
                      { status: 'sale', label: 'For Sale / Buy' },
                      { status: 'rent', label: 'For Rent' }
                    ].map((row) => (
                      <div key={row.status} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-900/60">
                        <span className="font-semibold text-slate-300">{row.label}</span>
                        <span className="font-bold px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-orange-400">
                          {stats.statuses[row.status] || 0} listings
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW B: USERS MANAGEMENT TABLE */}
          {activeSubTab === 'users' && (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                      <th className="p-4 pl-6">Username</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Registered</th>
                      <th className="p-4 pr-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-900/20 text-slate-300 transition-colors">
                        <td className="p-4 pl-6 font-bold text-white">{usr.username}</td>
                        <td className="p-4">{usr.email}</td>
                        <td className="p-4">{usr.phone}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            usr.is_admin === 1 ? 'bg-orange-950 text-orange-400 border border-orange-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {usr.is_admin === 1 ? 'Admin' : 'Seller'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(usr.created_at).toLocaleDateString('fr-MA')}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-center">
                          {usr.id !== user.id ? (
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="p-2 bg-slate-950 border border-slate-900 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 rounded-xl transition-all"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Self</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW C: PROPERTIES AUDITING TABLE */}
          {activeSubTab === 'properties' && (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                      <th className="p-4 pl-6">Listing Title</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Owner Name</th>
                      <th className="p-4 pr-6 text-center">Moderate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {propertiesList.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-900/20 text-slate-300 transition-colors">
                        <td className="p-4 pl-6">
                          <Link to={`/properties/${prop.id}`} className="font-bold text-white hover:text-orange-400 transition-colors line-clamp-1">
                            {prop.title}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            {prop.city}
                          </span>
                        </td>
                        <td className="p-4 capitalize">{prop.type}</td>
                        <td className="p-4 font-bold text-orange-400 uppercase">{formatPrice(prop.price)}</td>
                        <td className="p-4 text-xs font-semibold text-slate-400">{prop.owner_name}</td>
                        <td className="p-4 pr-6 text-center">
                          <button
                            onClick={() => handleForceDeleteListing(prop.id)}
                            className="p-2 bg-slate-950 border border-slate-900 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 rounded-xl transition-all"
                            title="Force Remove Listing"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Admin;
