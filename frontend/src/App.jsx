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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* Catch-all Redirect */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      {/* Standard Footer */}
      {!isAuthPage && <Footer />}

    </div>
  );
};

export default App;
