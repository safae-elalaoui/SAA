import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Maximize, Phone, MessageCircle, Send, Heart, Eye } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import propertyService from '../services/propertyService';
import messageService from '../services/messageService';
import favoriteService from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { SkeletonCard } from '../components/Skeleton';

// Base backend URL to prefix local uploaded images
const BACKEND_URL = 'http://localhost:5000';

// Leaflet standard marker asset fix for Vite module compilation
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Coordinates coordinates for Morocco cities
const CITY_COORDINATES = {
  "Marrakech": [31.6295, -7.9811],
  "Casablanca": [33.5731, -7.5898],
  "Tangier": [35.7595, -5.8340],
  "Agadir": [30.4278, -9.5981],
  "Rabat": [34.0209, -6.8416]
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  
  // Message Inquiry Form States
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgPhone, setMsgPhone] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSending, setMsgSending] = useState(false);

  // Load user default text values if authenticated
  useEffect(() => {
    if (user) {
      setMsgName(user.username);
      setMsgEmail(user.email);
      setMsgPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getPropertyDetails(id);
        setProperty(data.property);
        setSimilarProperties(data.similar);
        setActiveImageIdx(0);
        
        // If user is logged in, check if they favorited this property
        if (user) {
          const favorites = await favoriteService.getFavorites();
          const found = favorites.some(fav => fav.id === data.property.id);
          setIsLiked(found);
        }
      } catch (err) {
        showToast('Property listing not found!', 'error');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  const handleToggleLike = async () => {
    if (!user) {
      showToast('Please sign in to bookmark listings!', 'info');
      navigate('/login');
      return;
    }
    
    setLikeLoading(true);
    try {
      const response = await favoriteService.toggleFavorite(property.id);
      setIsLiked(response.status === 'added');
      showToast(response.message, 'success');
    } catch (err) {
      showToast('Could not save favorite status.', 'error');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent.trim()) {
      showToast('Please type a message body first.', 'warning');
      return;
    }
    
    setMsgSending(true);
    try {
      const payload = {
        property_id: property.id,
        message: msgContent,
        sender_name: msgName,
        sender_email: msgEmail,
        sender_phone: msgPhone
      };
      
      await messageService.sendMessage(payload);
      showToast('Your inquiry was sent to the owner! They will respond soon.', 'success');
      setMsgContent('');
    } catch (err) {
      showToast('Failed to deliver message inquiry.', 'error');
    } finally {
      setMsgSending(false);
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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-20 max-w-7xl mx-auto px-3 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6 animate-pulse">
          <div className="h-[320px] sm:h-[400px] md:h-[480px] bg-slate-900 rounded-2xl md:rounded-3xl shimmer" />
          <div className="h-32 md:h-40 bg-slate-900 rounded-2xl md:rounded-3xl shimmer" />
        </div>
        <div className="h-[400px] md:h-[520px] bg-slate-900 rounded-2xl md:rounded-3xl shimmer" />
      </div>
    );
  }

  const images = property.images ? property.images.split(',') : [];
  const coords = CITY_COORDINATES[property.city] || [33.5731, -7.5898]; // Default Casablanca

  // Prefilled WhatsApp text message link
  const whatsappMsg = encodeURIComponent(
    `Hello! I saw your listing "${property.title}" on EstateElite (${formatPrice(property.price)} in ${property.city}). I would like to schedule a virtual tour or ask a few questions. Please let me know your availability!`
  );

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 md:pb-20 max-w-7xl mx-auto px-3 md:px-8">
      
      {/* Back link */}
      <div className="mb-4 md:mb-6">
        <Link to="/search" className="text-slate-400 hover:text-orange-500 transition-colors text-xs md:text-sm font-semibold flex items-center gap-1">
          ← Back to Catalog Search
        </Link>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        
        {/* ============================================================== */}
        {/* A. LEFT COLUMN: IMAGE SLIDESHOW & DESCRIPTION                  */}
        {/* ============================================================== */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Gallery Showcase */}
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Main Stage Image */}
            <div className="h-[280px] sm:h-[380px] md:h-[480px] w-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-900 relative shadow-2xl bg-slate-900 select-none">
              <img
                src={getImageUrl(images[activeImageIdx])}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {/* Bookmark status button */}
              <button
                onClick={handleToggleLike}
                disabled={likeLoading}
                className={`absolute top-4 md:top-6 right-4 md:right-6 z-20 p-2.5 md:p-3 rounded-full border backdrop-blur-md transition-all duration-300 ${
                  isLiked
                    ? 'bg-orange-500 border-orange-400 text-white shadow-glow scale-105'
                    : 'bg-slate-950/70 border-white/10 text-slate-200 hover:text-orange-400 hover:border-orange-500/50 hover:bg-slate-950'
                }`}
              >
                <Heart className={`w-5 h-5 md:w-5.5 md:h-5.5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Status rent/sale tag */}
              <span className={`absolute top-4 md:top-6 left-4 md:left-6 z-20 px-3 md:px-4 py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl ${
                property.status === 'sale'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white'
                  : 'bg-slate-950/90 text-slate-100 border border-slate-800'
              }`}>
                For {property.status === 'sale' ? 'Sale' : 'Rent'}
              </span>
            </div>

            {/* Thumbnail cards line */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      idx === activeImageIdx ? 'border-orange-500 scale-95 shadow-glow' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications header card */}
          <div className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl flex flex-col gap-4 md:gap-6 shadow-2xl">
            
            {/* Title & Price */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4 border-b border-slate-900/60 pb-4 md:pb-6">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-orange-400 font-bold uppercase tracking-widest mb-2">
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>{property.city}</span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {property.title}
                </h1>
                <p className="text-slate-400 text-xs md:text-sm mt-2">{property.address}</p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Evaluation</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-white bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                  {formatPrice(property.price)}
                  {property.status === 'rent' && <span className="text-xs font-semibold text-slate-400">/mo</span>}
                </p>
              </div>
            </div>

            {/* Layout parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
              <div className="p-3 md:p-4 bg-slate-900/40 rounded-xl md:rounded-2xl border border-slate-900 flex flex-col items-center gap-1">
                <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Property Type</span>
                <span className="text-xs md:text-sm font-semibold text-white capitalize">{property.type}</span>
              </div>
              <div className="p-3 md:p-4 bg-slate-900/40 rounded-xl md:rounded-2xl border border-slate-900 flex flex-col items-center gap-1">
                <BedDouble className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mb-1" />
                <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Bedrooms</span>
                <span className="text-xs md:text-sm font-semibold text-white">{property.type === 'land' ? 'N/A' : `${property.bedrooms} Beds`}</span>
              </div>
              <div className="p-3 md:p-4 bg-slate-900/40 rounded-xl md:rounded-2xl border border-slate-900 flex flex-col items-center gap-1">
                <Bath className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mb-1" />
                <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Bathrooms</span>
                <span className="text-xs md:text-sm font-semibold text-white">{property.type === 'land' ? 'N/A' : `${property.bathrooms} Baths`}</span>
              </div>
              <div className="p-3 md:p-4 bg-slate-900/40 rounded-xl md:rounded-2xl border border-slate-900 flex flex-col items-center gap-1">
                <Maximize className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mb-1" />
                <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Surface</span>
                <span className="text-xs md:text-sm font-semibold text-white">{property.surface} m²</span>
              </div>
            </div>

            {/* Full description */}
            <div className="flex flex-col gap-2 md:gap-3">
              <h3 className="font-extrabold text-white text-sm md:text-md uppercase tracking-wider border-b border-slate-900/60 pb-2">Description</h3>
              <p className="text-slate-350 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* C. INTERACTIVE MAP SECTION */}
          <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col gap-3 md:gap-4">
            <h3 className="font-extrabold text-white text-sm md:text-md uppercase tracking-wider border-b border-slate-900/60 pb-2">Geographic Location</h3>
            <div className="h-64 sm:h-72 md:h-80 w-full overflow-hidden rounded-xl md:rounded-2xl border border-slate-900 shadow-inner relative z-10">
              <MapContainer 
                center={coords} 
                zoom={13} 
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords}>
                  <Popup>
                    <div className="text-slate-900">
                      <p className="font-bold">{property.title}</p>
                      <p className="text-xs">{property.address}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* B. RIGHT COLUMN: DIRECT CONTACT PANEL                          */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-6 md:gap-8">
          
          {/* Owner details card */}
          <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col gap-4 md:gap-6">
            <h3 className="font-extrabold text-white text-sm md:text-md uppercase tracking-wider border-b border-slate-900/60 pb-2 md:pb-3">Broker Contact</h3>
            
            {/* Broker profile */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 text-white flex items-center justify-center font-extrabold text-base md:text-lg shadow-lg">
                {property.owner_name ? property.owner_name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <p className="font-bold text-white text-xs md:text-sm">{property.owner_name || 'Agent Partner'}</p>
                <p className="text-[10px] md:text-xs text-slate-500">Verified Representative</p>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <a
                href={`tel:${property.phone}`}
                className="btn-secondary py-2.5 md:py-3 flex items-center justify-center gap-2 text-[10px] md:text-xs font-semibold"
              >
                <Phone className="w-4 h-4 text-orange-500" />
                <span>Call Owner</span>
              </a>
              <a
                href={`https://wa.me/${property.whatsapp}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-[10px] md:text-xs transition-colors shadow-lg hover:shadow-emerald-500/20"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleSendMessage} className="flex flex-col gap-3 md:gap-4 border-t border-slate-900/60 pt-4 md:pt-6">
              <p className="text-[10px] md:text-xs text-slate-400 font-medium text-center">Or submit an email inquiry inquiry form below</p>
              
              {/* Senders Name */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  required
                  value={msgName}
                  onChange={(e) => setMsgName(e.target.value)}
                  className="luxury-input py-2 text-xs"
                />
              </div>

              {/* Senders Email */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={msgEmail}
                  onChange={(e) => setMsgEmail(e.target.value)}
                  className="luxury-input py-2 text-xs"
                />
              </div>

              {/* Senders Phone */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={msgPhone}
                  onChange={(e) => setMsgPhone(e.target.value)}
                  className="luxury-input py-2 text-xs"
                />
              </div>

              {/* Message text */}
              <div className="flex flex-col gap-1.5">
                <textarea
                  placeholder="Tell the owner about your interest..."
                  rows="4"
                  required
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  className="luxury-input py-2 text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={msgSending}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 md:py-3 text-[10px] md:text-xs font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>{msgSending ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
              </button>

            </form>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* D. SIMILAR PROPERTIES ROW                                      */}
      {/* ============================================================== */}
      {similarProperties.length > 0 && (
        <div className="border-t border-slate-900 mt-16 md:mt-20 pt-12 md:pt-16">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Similar Premium Recommendations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {similarProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetails;
