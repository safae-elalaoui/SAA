import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
        
        {/* Brand Information */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center font-bold text-white text-md">
              E
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Immo<span className="text-orange-500 font-extrabold">direct</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The premier marketplace for high-end residential apartments, penthouses, villas, and commercial land investments in Morocco. Realizing your dream estate with absolute security and convenience.
          </p>
          <div className="flex items-center gap-3.5 mt-2 text-slate-400">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors p-2 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-700">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors p-2 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-700">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors p-2 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-700">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-400">
            <li>
              <Link to="/search" className="hover:text-white transition-colors">Browse Listings</Link>
            </li>
            <li>
              <Link to="/search?status=sale" className="hover:text-white transition-colors">Properties for Sale</Link>
            </li>
            <li>
              <Link to="/search?status=rent" className="hover:text-white transition-colors">Properties for Rent</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">My Listings Dashboard</Link>
            </li>
          </ul>
        </div>

        {/* Property Categories */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-400">
            <li>
              <Link to="/search?type=apartment" className="hover:text-white transition-colors">Luxury Apartments</Link>
            </li>
            <li>
              <Link to="/search?type=villa" className="hover:text-white transition-colors">High-End Villas</Link>
            </li>
            <li>
              <Link to="/search?type=house" className="hover:text-white transition-colors">Modern Houses</Link>
            </li>
            <li>
              <Link to="/search?type=land" className="hover:text-white transition-colors">Development Lands</Link>
            </li>
          </ul>
        </div>

        {/* Office Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Our Offices</h4>
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>Mohammedia</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span>0638677255</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span>Safae10maroc25@gmail.com</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 Immodirect SA. All rights reserved. Designed for premium luxury brokerage.</p>
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
          <span>Fully certified real estate licensing board.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
