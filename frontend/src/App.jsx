import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

import { AnimatePresence, motion } from 'framer-motion';

const App = () => {
  const location = useLocation();

  // Hide header and footer in dedicated auth screens for maximum focus
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white relative">
      
      {/* Floating Glass Navbar */}
      {!isAuthPage && <Navbar />}

      {/* Main Pages Content Stage */}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><Search /></PageWrapper>} />
            <Route path="/properties/:id" element={<PageWrapper><PropertyDetails /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
            
            {/* Catch-all Redirect */}
            <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Standard Footer */}
      {!isAuthPage && <Footer />}

    </div>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

export default App;
