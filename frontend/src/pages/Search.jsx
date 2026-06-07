import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Search as SearchIcon, RotateCcw, X, MapPin, Compass } from 'lucide-react';
import propertyService from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import { SkeletonList } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

const Search = () => {
  const location = useLocation();
  const { showToast } = useAuth();

  // Mobile filters drawer open/close
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  // Default Filter States
  const [filters, setFilters] = useState({
    status: '',       // 'rent' or 'sale' or ''
    type: '',         // 'apartment', 'villa', 'house', 'land', ''
    city: '',
    min_price: '',
    max_price: '',
    bedrooms: '',     // numbers
    bathrooms: '',    // numbers
    query: '',
    sort: 'newest'
  });

  // Extract initial filters from URL query parameters on boot
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const updatedFilters = {
      status: params.get('status') || '',
      type: params.get('type') || '',
      city: params.get('city') || '',
      min_price: params.get('min_price') || '',
      max_price: params.get('max_price') || '',
      bedrooms: params.get('bedrooms') || '',
      bathrooms: params.get('bathrooms') || '',
      query: params.get('query') || '',
      sort: params.get('sort') || 'newest'
    };
    
    setFilters(updatedFilters);
  }, [location.search]);

  // Fetch properties matching our filters
  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getProperties(filters);
        setProperties(data);
      } catch (err) {
        showToast('Error loading properties.', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input fetch to avoid spamming the SQLite database
    const delayDebounce = setTimeout(() => {
      loadProperties();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      type: '',
      city: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      query: '',
      sort: 'newest'
    });
    showToast('Filters cleared successfully.', 'info');
  };

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 md:pb-20 px-3 md:px-8 max-w-7xl mx-auto">
      
      {/* Search Header Line */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white">Find Your Dream Estate</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            {loading ? 'Searching catalog...' : `Showing ${properties.length} matches in Morocco`}
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          {/* Sorting */}
          <div className="flex items-center gap-2 flex-grow md:flex-grow-0">
            <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="luxury-input py-2 px-3 text-xs w-full md:w-40"
            >
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="surface_desc">Surface Area (m²)</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold text-xs transition-colors hover:text-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Split Column Layout */}
      <div className="flex gap-4 md:gap-8 items-start">
        
        {/* ============================================================== */}
        {/* A. DESKTOP ADVANCED SIDEBAR FILTERS PANEL                      */}
        {/* ============================================================== */}
        <aside className="hidden md:flex flex-col w-72 lg:w-80 bg-slate-950 border border-slate-900 rounded-2xl p-4 lg:p-6 shadow-2xl shrink-0 sticky top-24 md:top-28 gap-4 lg:gap-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 lg:pb-4">
            <h2 className="font-bold text-white text-sm lg:text-md">Filter Searches</h2>
            <button
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Term Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title, address, city..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="luxury-input pl-10 pr-4 py-2 text-sm"
              />
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Listing Status</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-1 border border-slate-800 rounded-xl">
              {[
                { id: '', label: 'All' },
                { id: 'sale', label: 'Buy' },
                { id: 'rent', label: 'Rent' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFilterChange('status', item.id)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filters.status === item.id
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* City Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">City Location</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="luxury-input py-2 text-sm"
            >
              <option value="">All Morocco</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Casablanca">Casablanca</option>
              <option value="Tangier">Tangier</option>
              <option value="Agadir">Agadir</option>
              <option value="Rabat">Rabat</option>
            </select>
          </div>

          {/* Property Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Category</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="luxury-input py-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="apartment">Apartments</option>
              <option value="villa">Villas</option>
              <option value="house">Houses</option>
              <option value="land">Lands</option>
            </select>
          </div>

          {/* Price Range Fields */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">
              Budget Range ({filters.status === 'rent' ? 'DH/mo' : 'DH'})
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                className="luxury-input px-2 py-1.5 text-xs text-center"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                className="luxury-input px-2 py-1.5 text-xs text-center"
              />
            </div>
          </div>

          {/* Bedrooms Tally Counters */}
          {filters.type !== 'land' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Bedrooms</label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl">
                  {['', '1', '2', '3', '4+'].map((bed) => (
                    <button
                      key={bed}
                      type="button"
                      onClick={() => handleFilterChange('bedrooms', bed === '4+' ? '4' : bed)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        (filters.bedrooms === bed || (bed === '4+' && filters.bedrooms === '4'))
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-950/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {bed === '' ? 'Any' : bed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms Counter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Bathrooms</label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl">
                  {['', '1', '2', '3+'].map((bath) => (
                    <button
                      key={bath}
                      type="button"
                      onClick={() => handleFilterChange('bathrooms', bath === '3+' ? '3' : bath)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        (filters.bathrooms === bath || (bath === '3+' && filters.bathrooms === '3'))
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-950/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {bath === '' ? 'Any' : bath}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </aside>

        {/* ============================================================== */}
        {/* B. DYNAMIC REAL ESTATE RESULTS VIEW GRID                       */}
        {/* ============================================================== */}
        <main className="flex-grow">
          {loading ? (
            <SkeletonList count={6} />
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              <AnimatePresence>
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 md:py-20 px-4 md:px-6 glass-panel rounded-2xl max-w-lg mx-auto"
            >
              <Compass className="w-12 h-12 md:w-14 md:h-14 text-slate-600 mx-auto mb-3 md:mb-4 animate-spin-slow" />
              <h3 className="text-lg md:text-xl font-bold text-slate-200 mb-2">No Matching Listings Found</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                We couldn't locate any premium real estate matching your exact search parameters. Try expanding your budget caps or clearing custom bedroom filters!
              </p>
              <button
                onClick={handleClearFilters}
                className="btn-primary py-2 px-6 text-xs"
              >
                Clear Search Parameters
              </button>
            </motion.div>
          )}
        </main>

      </div>

      {/* ============================================================== */}
      {/* C. MOBILE RESPONSIVE SLIDE-OVER FILTERS DRAWER                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] sm:w-80 bg-slate-900 border-l border-slate-800 p-4 md:p-6 z-50 overflow-y-auto flex flex-col gap-4 md:gap-6 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 md:pb-4">
                <h2 className="font-bold text-white text-md">Filters</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-slate-400 hover:text-orange-500"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Keywords */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Keywords</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search titles, cities..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    className="luxury-input pl-10 pr-4 py-2.5 text-sm"
                  />
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Listing Status</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-850 p-1 border border-slate-800 rounded-xl">
                  {[
                    { id: '', label: 'All' },
                    { id: 'sale', label: 'Buy' },
                    { id: 'rent', label: 'Rent' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleFilterChange('status', item.id)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filters.status === item.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">City Location</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="luxury-input py-2 text-sm"
                >
                  <option value="">All Morocco</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Tangier">Tangier</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Rabat">Rabat</option>
                </select>
              </div>

              {/* Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Category</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="luxury-input py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="apartment">Apartments</option>
                  <option value="villa">Villas</option>
                  <option value="house">Houses</option>
                  <option value="land">Lands</option>
                </select>
              </div>

              {/* Price Limits */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Price Limits</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="luxury-input px-2 py-2 text-xs text-center"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="luxury-input px-2 py-2 text-xs text-center"
                  />
                </div>
              </div>

              {/* Beds and Baths for Mobile */}
              {filters.type !== 'land' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Bedrooms</label>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-850 p-1 border border-slate-800 rounded-xl">
                      {['', '1', '2', '3', '4+'].map((bed) => (
                        <button
                          key={bed}
                          type="button"
                          onClick={() => handleFilterChange('bedrooms', bed === '4+' ? '4' : bed)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            (filters.bedrooms === bed || (bed === '4+' && filters.bedrooms === '4'))
                              ? 'bg-orange-500 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {bed === '' ? 'Any' : bed}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Bathrooms</label>
                    <div className="grid grid-cols-4 gap-1.5 bg-slate-850 p-1 border border-slate-800 rounded-xl">
                      {['', '1', '2', '3+'].map((bath) => (
                        <button
                          key={bath}
                          type="button"
                          onClick={() => handleFilterChange('bathrooms', bath === '3+' ? '3' : bath)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            (filters.bathrooms === bath || (bath === '3+' && filters.bathrooms === '3'))
                              ? 'bg-orange-500 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {bath === '' ? 'Any' : bath}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-primary w-full py-3 mt-4"
              >
                Apply Filters
              </button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Search;
