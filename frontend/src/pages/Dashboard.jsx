import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Heart, MessageSquare, PlusCircle, LayoutGrid, Trash2, Edit3, 
  MapPin, Eye, Calendar, User, Phone, Mail, Image as ImageIcon, Send 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import propertyService from '../services/propertyService';
import messageService from '../services/messageService';
import favoriteService from '../services/favoriteService';
import PropertyCard from '../components/PropertyCard';
import { SkeletonList } from '../components/Skeleton';

// Base backend URL to prefix local uploaded images
const BACKEND_URL = 'http://localhost:5000';

const Dashboard = () => {
  const { user, token, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route tab parsing
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(true);

  // Data Collections
  const [myProperties, setMyProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Selected property for editing
  const [editPropertyId, setEditPropertyId] = useState(null);

  // Property Form State (Used for both ADD and EDIT)
  const [formFields, setFormFields] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    address: '',
    type: 'apartment',
    bedrooms: '0',
    bathrooms: '0',
    surface: '',
    status: 'sale',
    phone: '',
    whatsapp: ''
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Auto-redirect unauthorized users
  useEffect(() => {
    if (!token) {
      showToast('Session expired. Please sign in to view your dashboard.', 'info');
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [token]);

  // Synchronize URL tabs
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const editId = params.get('edit_id');

    if (tab) {
      setActiveTab(tab);
      if (tab === 'edit-property' && editId) {
        setEditPropertyId(editId);
        loadEditProperty(editId);
      }
    } else {
      setActiveTab('listings');
    }
  }, [location.search]);

  // Trigger loads based on active tabs
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'listings') {
          const allProps = await propertyService.getProperties();
          const userProps = allProps.filter((p) => p.user_id === user.id);
          setMyProperties(userProps);
        } else if (activeTab === 'messages') {
          const inbox = await messageService.getInbox();
          setMessages(inbox);
        } else if (activeTab === 'favorites') {
          const favs = await favoriteService.getFavorites();
          setFavorites(favs);
        } else if (activeTab === 'add-property') {
          // Pre-fill phone specs if user has them
          setFormFields((prev) => ({
            ...prev,
            phone: user.phone || '',
            whatsapp: user.phone ? user.phone.replace(/[^0-9]/g, '') : ''
          }));
        }
      } catch (err) {
        showToast('Error syncing dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeTab, user]);

  const loadEditProperty = async (id) => {
    setLoading(true);
    try {
      const data = await propertyService.getPropertyDetails(id);
      const prop = data.property;
      
      setFormFields({
        title: prop.title,
        description: prop.description,
        price: prop.price.toString(),
        city: prop.city,
        address: prop.address,
        type: prop.type,
        bedrooms: prop.bedrooms.toString(),
        bathrooms: prop.bathrooms.toString(),
        surface: prop.surface.toString(),
        status: prop.status,
        phone: prop.phone,
        whatsapp: prop.whatsapp
      });
      setSelectedFiles([]);
    } catch (err) {
      showToast('Error loading property for editing.', 'error');
      navigate('/dashboard?tab=listings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build standard multipart FormData
    const formData = new FormData();
    formData.append('title', formFields.title.trim());
    formData.append('description', formFields.description.trim());
    formData.append('price', formFields.price);
    formData.append('city', formFields.city);
    formData.append('address', formFields.address.trim());
    formData.append('type', formFields.type);
    formData.append('bedrooms', formFields.type === 'land' ? '0' : formFields.bedrooms);
    formData.append('bathrooms', formFields.type === 'land' ? '0' : formFields.bathrooms);
    formData.append('surface', formFields.surface);
    formData.append('status', formFields.status);
    formData.append('phone', formFields.phone.trim());
    formData.append('whatsapp', formFields.whatsapp.trim());

    // Append file lists
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      if (activeTab === 'edit-property') {
        await propertyService.updateProperty(editPropertyId, formData);
        showToast('Property listing updated successfully!', 'success');
      } else {
        await propertyService.createProperty(formData);
        showToast('Property listing posted successfully!', 'success');
      }
      
      // Return to listings
      navigate('/dashboard?tab=listings');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit form. Check fields.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this property listing?')) return;
    
    try {
      await propertyService.deleteProperty(id);
      setMyProperties((prev) => prev.filter((p) => p.id !== id));
      showToast('Property listing deleted successfully.', 'success');
    } catch (err) {
      showToast('Could not delete listing.', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(price)
      .replace('MAD', 'DH');
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}/${url}`;
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* ============================================================== */}
      {/* A. LEFT MENU SELECTOR SIDEBAR                                  */}
      {/* ============================================================== */}
      <aside className="w-full md:w-64 flex flex-col bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl shrink-0 h-fit gap-2">
        <div className="px-3 py-3 border-b border-slate-900 mb-2">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Account Workspace</p>
          <h2 className="text-md font-bold text-white truncate mt-1">{user?.username}</h2>
        </div>

        <button
          onClick={() => navigate('/dashboard?tab=listings')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'listings'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-950/20'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4.5 h-4.5" />
          <span>My Listings</span>
        </button>

        <button
          onClick={() => navigate('/dashboard?tab=add-property')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'add-property'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-950/20'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Post New Property</span>
        </button>

        <button
          onClick={() => navigate('/dashboard?tab=messages')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'messages'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-950/20'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>Buyer Messages</span>
        </button>

        <button
          onClick={() => navigate('/dashboard?tab=favorites')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'favorites'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-950/20'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
          }`}
        >
          <Heart className="w-4.5 h-4.5" />
          <span>My Favorites</span>
        </button>
      </aside>

      {/* ============================================================== */}
      {/* B. RIGHT VIEWS CONTENT CONTAINER                               */}
      {/* ============================================================== */}
      <main className="flex-grow bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl min-h-[500px]">
        
        {/* TAB 1: MY ACTIVE POSTED LISTINGS */}
        {activeTab === 'listings' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Manage My Property Postings</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-28 bg-slate-900 rounded-2xl shimmer animate-pulse" />
                ))}
              </div>
            ) : myProperties.length > 0 ? (
              <div className="flex flex-col gap-4">
                {myProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/40 border border-slate-900 rounded-2xl gap-4 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                        <img
                          src={getImageUrl(prop.images ? prop.images.split(',')[0] : '')}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{prop.title}</h3>
                        <p className="text-xs text-orange-500 font-bold mt-1 uppercase">{formatPrice(prop.price)}</p>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{prop.city}</span>
                          <span className="text-slate-700">•</span>
                          <span className="capitalize">{prop.type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        to={`/properties/${prop.id}`}
                        className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                        title="View Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => navigate(`/dashboard?tab=edit-property&edit_id=${prop.id}`)}
                        className="p-2.5 bg-slate-950 border border-slate-800 hover:border-orange-500/30 text-slate-400 hover:text-orange-400 rounded-xl transition-all"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(prop.id)}
                        className="p-2.5 bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">You haven't listed any properties yet.</p>
                <button
                  onClick={() => navigate('/dashboard?tab=add-property')}
                  className="btn-primary py-2 px-6 text-xs mt-4"
                >
                  Create Your First Listing
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2 & TAB 3: ADD & EDIT PROPERTY FORM */}
        {(activeTab === 'add-property' || activeTab === 'edit-property') && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">
              {activeTab === 'edit-property' ? 'Modify Your Property Listing' : 'Post a New Property'}
            </h2>
            
            {loading && activeTab === 'edit-property' ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-slate-900 rounded-xl shimmer" />
                <div className="h-32 bg-slate-900 rounded-xl shimmer" />
                <div className="h-10 bg-slate-900 rounded-xl shimmer" />
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Listing Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Modern 3-Bedroom Ocean View Penthouse"
                    value={formFields.title}
                    onChange={handleInputChange}
                    className="luxury-input py-2.5 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Detailed Description</label>
                  <textarea
                    name="description"
                    required
                    rows="6"
                    placeholder="Describe the architectural layout, internal amenities, neighborhood qualities, building facilities, and custom specifications..."
                    value={formFields.description}
                    onChange={handleInputChange}
                    className="luxury-input py-2.5 text-sm resize-none"
                  />
                </div>

                {/* Primary specs row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Property Category</label>
                    <select
                      name="type"
                      value={formFields.type}
                      onChange={handleInputChange}
                      className="luxury-input py-2.5 text-sm"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="house">House</option>
                      <option value="land">Land</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Price (MAD / DH)</label>
                    <input
                      type="number"
                      name="price"
                      required
                      placeholder="e.g. 2400000"
                      value={formFields.price}
                      onChange={handleInputChange}
                      className="luxury-input py-2.5 text-sm"
                    />
                  </div>

                  {/* Surface area */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Surface Area (m²)</label>
                    <input
                      type="number"
                      name="surface"
                      required
                      placeholder="e.g. 140"
                      value={formFields.surface}
                      onChange={handleInputChange}
                      className="luxury-input py-2.5 text-sm"
                    />
                  </div>
                </div>

                {/* Beds and Baths (Only visible if type is NOT land) */}
                {formFields.type !== 'land' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Bedrooms</label>
                      <input
                        type="number"
                        name="bedrooms"
                        placeholder="e.g. 3"
                        value={formFields.bedrooms}
                        onChange={handleInputChange}
                        className="luxury-input py-2.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Bathrooms</label>
                      <input
                        type="number"
                        name="bathrooms"
                        placeholder="e.g. 2"
                        value={formFields.bathrooms}
                        onChange={handleInputChange}
                        className="luxury-input py-2.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Status (Rent/Buy)</label>
                      <select
                        name="status"
                        value={formFields.status}
                        onChange={handleInputChange}
                        className="luxury-input py-2.5 text-sm"
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Location row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">City Location</label>
                    <select
                      name="city"
                      required
                      value={formFields.city}
                      onChange={handleInputChange}
                      className="luxury-input py-2.5 text-sm"
                    >
                      <option value="">Select City</option>
                      <option value="Marrakech">Marrakech</option>
                      <option value="Casablanca">Casablanca</option>
                      <option value="Tangier">Tangier</option>
                      <option value="Agadir">Agadir</option>
                      <option value="Rabat">Rabat</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Physical Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="e.g. 24 Rue Gauthier, Building B"
                      value={formFields.address}
                      onChange={handleInputChange}
                      className="luxury-input py-2.5 text-sm"
                    />
                  </div>
                </div>

                {/* Contacts Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Call Dialer Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. +212 600-000000"
                      value={formFields.phone}
                      onChange={handleInputChange}
                      className="luxury-input py-2.5 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">WhatsApp phone number (Numeric only)</label>
                    <input
                      type="text"
                      name="whatsapp"
                      required
                      placeholder="e.g. 212600000000 (No leading + or spaces)"
                      value={formFields.whatsapp}
                      onChange={handleInputChange}
                      className="luxury-input py-2.5 text-sm"
                    />
                  </div>
                </div>

                {/* Image Upload Form */}
                <div className="flex flex-col gap-2 p-5 bg-slate-900/30 border border-slate-900 border-dashed rounded-2xl">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>Upload Property Images</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-800 file:cursor-pointer cursor-pointer"
                  />
                  {selectedFiles.length > 0 ? (
                    <p className="text-xs text-orange-400 font-semibold mt-1">
                      {selectedFiles.length} file(s) selected for upload.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Select multiple listing photos. If empty, the system will apply default premium category stock images.
                    </p>
                  )}
                </div>

                {/* Action button */}
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard?tab=listings')}
                    className="btn-secondary py-2.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2.5 text-xs font-bold px-8"
                  >
                    {activeTab === 'edit-property' ? 'Update Listing' : 'Post Listing'}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

        {/* TAB 4: CLIENT MESSAGE INBOX */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Client Inquiries Inbox</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-28 bg-slate-900 rounded-2xl shimmer animate-pulse" />
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="flex flex-col gap-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col gap-4"
                  >
                    {/* Related property line */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-950">
                          <img
                            src={getImageUrl(msg.property_images ? msg.property_images.split(',')[0] : '')}
                            alt="prop"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Regarding property</p>
                          <Link to={`/properties/${msg.property_id}`} className="font-bold text-slate-200 text-sm hover:text-orange-400 transition-colors">
                            {msg.property_title}
                          </Link>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(msg.created_at).toLocaleDateString('fr-MA')}
                      </span>
                    </div>

                    {/* Message body */}
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/45 p-3 rounded-xl border border-slate-900/60">
                      "{msg.message}"
                    </p>

                    {/* Sender profile */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-400 border-t border-slate-900/60 pt-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-orange-500" />
                        <span>{msg.sender_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <a href={`mailto:${msg.sender_email}`} className="hover:text-white transition-colors">{msg.sender_email}</a>
                      </div>
                      {msg.sender_phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-orange-500" />
                          <a href={`tel:${msg.sender_phone}`} className="hover:text-white transition-colors">{msg.sender_phone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Your inquiries inbox is currently empty.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FAVORITES CATALOG */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Bookmarked Properties</h2>
            {loading ? (
              <SkeletonList count={3} />
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((prop) => (
                  <PropertyCard 
                    key={prop.id} 
                    property={prop} 
                    isInitiallyFavorited={true}
                    onFavoriteToggle={(id, liked) => {
                      if (!liked) {
                        // Remove from favorites array reactively
                        setFavorites((prev) => prev.filter((p) => p.id !== id));
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Your bookmarks collection is currently empty.</p>
                <button
                  onClick={() => navigate('/search')}
                  className="btn-primary py-2 px-6 text-xs mt-4"
                >
                  Browse Real Estate Catalog
                </button>
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
};

export default Dashboard;
