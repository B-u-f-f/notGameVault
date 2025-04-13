import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <a href="/" className="logo">
          <div className="logo-icon">G</div>
          GameVault
        </a>
        
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <a href="/" className="nav-link active">Home</a>
          <a href="/tiers" className="nav-link">Tier Lists</a>
          <a href="/about" className="nav-link">About</a>
        </div>
        
        <div className="nav-actions">
          <div className="search-bar">
            <input type="text" placeholder="Search games..." />
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div className="auth-buttons">
            <a href="/login" className="btn btn-text">Login</a>
            <a href="/signup" className="btn btn-primary">Sign Up</a>
          </div>
          
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 