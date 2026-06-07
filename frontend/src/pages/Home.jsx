import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building, Home as HouseIcon, Trees, Tent, Compass, ArrowRight, Star, Shield, Landmark } from 'lucide-react';
import propertyService from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import { SkeletonList } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  
  const [featuredList, setFeaturedList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search parameters states
  const [searchStatus, setSearchStatus] = useState('sale'); // 'sale' or 'rent'
  const [searchType, setSearchType] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchPrice, setSearchPrice] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await propertyService.getProperties();
        // Load top 3 listings
        setFeaturedList(data.slice(0, 3));
      } catch (err) {
        showToast('Could not fetch active listings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchStatus) params.append('status', searchStatus);
    if (searchType) params.append('type', searchType);
    if (searchCity) params.append('city', searchCity);
    if (searchPrice) {
      if (searchPrice === '1') {
        params.append('max_price', '15000');
      } else if (searchPrice === '2') {
        params.append('min_price', '15000');
        params.append('max_price', '50000');
      } else if (searchPrice === '3') {
        params.append('min_price', '500000');
        params.append('max_price', '3000000');
      } else if (searchPrice === '4') {
        params.append('min_price', '3000000');
        params.append('max_price', '10000000');
      } else if (searchPrice === '5') {
        params.append('min_price', '10000000');
      }
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (type) => {
    navigate(`/search?type=${type}`);
  };

  // Entrance animations constants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen">
      
      {/* 1. Hero and Multi-Criteria Search Section */}
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
        {/* Background Image with Lighter Overlay to show image better */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950" />
        </div>

        {/* Hero Title & Subtext */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center bg-slate-950/70 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl mb-8"
          >
            <span className="px-3 md:px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
              Exclusive Luxury Real Estate
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-4 md:mb-6">
              Find Your Sanctuary of <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Refined Luxury Living
              </span>
            </h1>
            <p className="text-slate-200 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed">
              Immodirect curates pristine villas, premium city apartments, and exclusive commercial land opportunities across Morocco. Experience premium brokerage services tailored to your lifestyle.
            </p>
          </motion.div>

          {/* Floating Search Console */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-4xl mx-auto bg-slate-950/70 border border-white/5 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 shadow-2xl"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-5">
              
              {/* Toggles for Rent / Buy */}
              <div className="flex gap-2 self-start border-b border-slate-900 pb-3 w-full">
                <button
                  type="button"
                  onClick={() => setSearchStatus('sale')}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                    searchStatus === 'sale'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-950/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setSearchStatus('rent')}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                    searchStatus === 'rent'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-950/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rent
                </button>
              </div>

              {/* Multi-Criteria Input Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. City Dropdown */}
                <div className="flex flex-col text-left gap-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">City</label>
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="luxury-input py-2.5 text-sm"
                  >
                    <option value="">All Morocco</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Tangier">Tangier</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Rabat">Rabat</option>
                  </select>
                </div>

                {/* 2. Property Type */}
                <div className="flex flex-col text-left gap-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Property Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="luxury-input py-2.5 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                {/* 3. Budget Range */}
                <div className="flex flex-col text-left gap-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Budget</label>
                  <select
                    value={searchPrice}
                    onChange={(e) => setSearchPrice(e.target.value)}
                    className="luxury-input py-2.5 text-sm"
                  >
                    <option value="">Any Budget</option>
                    {searchStatus === 'rent' ? (
                      <>
                        <option value="1">Under 15,000 DH/mo</option>
                        <option value="2">Over 15,000 DH/mo</option>
                      </>
                    ) : (
                      <>
                        <option value="3">500,000 - 3,000,000 DH</option>
                        <option value="4">3,000,000 - 10,000,000 DH</option>
                        <option value="5">Over 10,000,000 DH</option>
                      </>
                    )}
                  </select>
                </div>

                {/* 4. Action Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Matches</span>
                  </button>
                </div>

              </div>

            </form>
          </motion.div>
        </div>
      </div>

      {/* 2. Visual Categories Navigation */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-16 md:py-20 relative z-25">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest pl-1 block mb-2 md:mb-3">Browse Collection</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Explore By Property Types</h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { id: 'apartment', label: 'Apartments', desc: 'Penthouse & Flats', icon: Building },
            { id: 'villa', label: 'Villas', desc: 'Luxury Estates', icon: Landmark },
            { id: 'house', label: 'Houses', desc: 'Modern Dwellings', icon: HouseIcon },
            { id: 'land', label: 'Lands', desc: 'Development Plots', icon: Trees }
          ].map((cat) => (
            <motion.button
              key={cat.id}
              variants={itemVariants}
              onClick={() => handleCategoryClick(cat.id)}
              className="glass-panel glass-panel-hover p-4 md:p-6 rounded-2xl flex flex-col items-center text-center gap-3 md:gap-4 group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-900/60 border border-slate-800 text-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-lg">
                <cat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-md group-hover:text-orange-400 transition-colors">{cat.label}</h3>
                <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* 3. Featured Property listings Grid */}
      <div className="bg-slate-950/60 border-y border-slate-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
            <div>
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest block mb-2 md:mb-3">Refined Curations</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Our Featured Listings</h2>
            </div>
            <Link
              to="/search"
              className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-400 hover:gap-2.5 transition-all"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : featuredList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredList.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 glass-panel rounded-2xl">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No properties available at the moment. Add your first listing!</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Luxury Statistics Bar */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-8 bg-slate-950 border border-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 relative z-10 border-b md:border-b-0 md:border-r border-slate-900 pb-6 md:pb-0 md:pr-8">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">120M+ DH</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Closed Transactions</span>
            <p className="text-xs text-slate-400 mt-2">Delivering peak valuations and reliable legal execution across all real estate trades.</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 relative z-10 border-b md:border-b-0 md:border-r border-slate-900 pb-6 md:pb-0 md:px-8">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">1,200+</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Happy Clients</span>
            <p className="text-xs text-slate-400 mt-2">Highly satisfied buyers, renters, developers, and brokers trust our secure platform.</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 relative z-10 md:pl-8">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">48+</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Certified Partners</span>
            <p className="text-xs text-slate-400 mt-2">Elite local brokers, investment consultants, and verified private sellers.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
