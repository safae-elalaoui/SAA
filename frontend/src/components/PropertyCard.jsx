import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, BedDouble, Bath, Maximize, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';

// Base backend URL to prefix local uploaded images
const BACKEND_URL = 'http://localhost:5000';

const PropertyCard = ({ property, isInitiallyFavorited = false, onFavoriteToggle = null }) => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(isInitiallyFavorited);
  const [likeLoading, setLikeLoading] = useState(false);

  // Parse images string (comma separated)
  const images = property.images ? property.images.split(',') : [];

  const handleToggleLike = async (e) => {
    e.preventDefault(); // Stop navigation click
    e.stopPropagation();
    
    if (!user) {
      showToast('Please log in to bookmark listings!', 'info');
      navigate('/login');
      return;
    }

    setLikeLoading(true);
    try {
      const response = await favoriteService.toggleFavorite(property.id);
      setIsLiked(response.status === 'added');
      showToast(response.message, 'success');
      if (onFavoriteToggle) {
        onFavoriteToggle(property.id, response.status === 'added');
      }
    } catch (err) {
      showToast('Could not save favorite status.', 'error');
    } finally {
      setLikeLoading(false);
    }
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(price)
      .replace('MAD', 'DH');
  };

  const formatType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper to absolute-path-prefix image URLs
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}/${url}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full shadow-luxury relative group"
    >
      {/* Property Listing Image Section with Slider */}
      <div className="relative h-64 overflow-hidden select-none bg-slate-900">
        
        {/* Render Carousel Image */}
        <Link to={`/properties/${property.id}`} className="w-full h-full block">
          <img
            src={getImageUrl(images[currentImgIndex])}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Favorite Heart Trigger */}
        <button
          onClick={handleToggleLike}
          disabled={likeLoading}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
            isLiked
              ? 'bg-orange-500 border-orange-400 text-white shadow-glow scale-105'
              : 'bg-slate-950/65 border-white/10 text-slate-200 hover:text-orange-400 hover:border-orange-500/50 hover:bg-slate-950/80'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} ${likeLoading ? 'animate-pulse' : ''}`} />
        </button>

        {/* Status Tag (Rent vs Sale) */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg ${
            property.status === 'sale'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border border-orange-500/20'
              : 'bg-gradient-to-r from-slate-900 to-slate-800 text-slate-100 border border-slate-700/30'
          }`}>
            For {property.status === 'sale' ? 'Sale' : 'Rent'}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/85 text-slate-300 border border-white/5 uppercase">
            {formatType(property.type)}
          </span>
        </div>

        {/* Image Sliding Navigators */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-950/60 border border-white/5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-950"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-950/60 border border-white/5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-950"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-slate-950/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImgIndex ? 'bg-orange-500 scale-125' : 'bg-slate-400/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Details Info Section */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* City and Location Line */}
        <div className="flex items-center gap-1 text-xs text-orange-400 font-semibold uppercase tracking-wider mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.city}</span>
        </div>

        {/* Title */}
        <Link to={`/properties/${property.id}`} className="block mb-2 group-hover:text-orange-400 transition-colors">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-orange-400 transition-colors leading-snug">
            {property.title}
          </h3>
        </Link>

        {/* Description Snippet */}
        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">
          {property.description}
        </p>

        {/* Layout Specifications Row (beds, baths, surface) */}
        {property.type !== 'land' ? (
          <div className="grid grid-cols-3 gap-2 border-t border-slate-900/60 pt-4 mb-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
              <span>{property.surface} m²</span>
            </div>
          </div>
        ) : (
          <div className="flex border-t border-slate-900/60 pt-4 mb-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <Maximize className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
              <span>Total Area: {property.surface} m²</span>
            </div>
          </div>
        )}

        {/* Price and Action row */}
        <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-auto">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Price</p>
            <p className="text-xl font-extrabold text-white">
              {formatPrice(property.price)}
              {property.status === 'rent' && <span className="text-xs font-medium text-slate-400">/mo</span>}
            </p>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="px-4 py-2 border border-slate-800 hover:border-orange-500 bg-slate-950/40 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-bold text-slate-300 hover:shadow-orange-950/20 hover:shadow-lg transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
