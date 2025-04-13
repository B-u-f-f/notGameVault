import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SteamApiService from '../services/steamApi';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Handle scroll effect
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

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await SteamApiService.searchGames(searchQuery);
      setSearchResults(results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setShowResults(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleResultClick = (gameId) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/game/${gameId}`);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          <div className="logo-icon">G</div>
          GameVault
        </Link>
        
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/tiers" className="nav-link">Tier Lists</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
        
        <div className="nav-actions">
          <div className="search-bar" ref={searchRef}>
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
              />
              <svg 
                className={`search-icon ${isSearching ? 'searching' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </form>
            
            {showResults && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <>
                    <div className="search-results-list">
                      {searchResults.slice(0, 5).map((game) => (
                        <div 
                          key={game.id} 
                          className="search-result-item"
                          onClick={() => handleResultClick(game.id)}
                        >
                          <img 
                            src={game.cover} 
                            alt={game.title} 
                            className="result-image"
                          />
                          <div className="result-info">
                            <h4>{game.title}</h4>
                            <p>{game.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link 
                      to={`/search?q=${encodeURIComponent(searchQuery)}`}
                      className="view-all-results"
                      onClick={() => setShowResults(false)}
                    >
                      View all results
                    </Link>
                  </>
                ) : (
                  <div className="no-results">
                    {isSearching ? 'Searching...' : 'No games found'}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-text">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
          
          <button 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
          >
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