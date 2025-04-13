import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTrophy, FaUserAlt, FaGlobe, FaPlus, FaHeart, FaSearch, FaSortAmountDown } from 'react-icons/fa';
import { useTierLists } from '../context/TierListsContext';
import { useAuth } from '../context/AuthContext';
import './PageStyles.css';

const TierListsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('community'); // 'community' or 'my'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'recent', 'oldest'
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    tierLists, 
    userTierLists, 
    getPublicTierLists, 
    getUserTierLists, 
    loading, 
    error 
  } = useTierLists();
  
  const { isAuthenticated } = useAuth();

  // Check URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const myParam = params.get('my');
    
    if (myParam === 'true' && isAuthenticated) {
      setActiveTab('my');
    } else {
      setActiveTab('community');
    }
  }, [location.search, isAuthenticated]);

  // Load tier lists
  useEffect(() => {
    // Always load public tier lists
    getPublicTierLists();
    
    // Load user tier lists if authenticated
    if (isAuthenticated) {
      getUserTierLists();
    }
  }, [getPublicTierLists, getUserTierLists, isAuthenticated]);

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === 'my' && !isAuthenticated) {
      if (window.confirm('You need to be logged in to view your tier lists. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }
    
    setActiveTab(tab);
    navigate(tab === 'my' ? '/tiers?my=true' : '/tiers');
  };

  // Filter and sort the tier lists
  const getFilteredAndSortedLists = () => {
    const lists = activeTab === 'community' ? tierLists : userTierLists;
    
    // Filter by search query if provided
    const filtered = searchQuery.trim() 
      ? lists.filter(list => 
          list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : lists;
    
    // Sort lists
    return filtered.sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likes - a.likes;
      } else if (sortBy === 'recent') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      return 0;
    });
  };

  const filteredLists = getFilteredAndSortedLists();

  // Generate preview of tiers
  const renderTierPreview = (tierList) => {
    // Show top 2 tiers or fewer if not enough
    const previewTiers = tierList.tiers.slice(0, 2);
    
    return (
      <div className="tier-preview">
        {previewTiers.map((tier, index) => (
          <div key={index} className="tier-row">
            <div 
              className="tier-label" 
              style={{ backgroundColor: tier.color || '#8a66ff' }}
            >
              {tier.name}
            </div>
            <div className="tier-games">
              {tier.games.length > 0 ? (
                tier.games.slice(0, 5).map((game, gameIndex) => (
                  <div key={gameIndex} className="mini-game">
                    <img 
                      src={game.cover} 
                      alt={game.title} 
                      className="mini-game-img" 
                    />
                  </div>
                ))
              ) : (
                <span className="empty-tier">No games in this tier</span>
              )}
              {tier.games.length > 5 && (
                <div className="more-games">+{tier.games.length - 5} more</div>
              )}
            </div>
          </div>
        ))}
        {tierList.tiers.length > 2 && (
          <div className="more-tiers">+{tierList.tiers.length - 2} more tiers</div>
        )}
      </div>
    );
  };

  return (
    <div className="tierlists-page">
      <div className="tierlists-header">
        <h1>Game Tier Lists</h1>
        <p>Create, share, and discover game rankings from the community</p>
        
        {isAuthenticated && (
          <Link to="/tiers/create" className="create-tierlist-button">
            <FaPlus /> Create New Tier List
          </Link>
        )}
      </div>
      
      <div className="tierlists-tabs">
        <button 
          className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => handleTabChange('community')}
        >
          <FaGlobe /> Community Tier Lists
        </button>
        <button 
          className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => handleTabChange('my')}
        >
          <FaUserAlt /> My Tier Lists
        </button>
      </div>
      
      <div className="tierlists-filters">
        <div className="search-filter">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search tier lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
        
        <div className="sort-filter">
          <FaSortAmountDown className="sort-icon" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Updated</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tier lists...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="empty-state">
          <h2>No Tier Lists Found</h2>
          {activeTab === 'my' ? (
            <>
              <p>You haven't created any tier lists yet.</p>
              <Link to="/tiers/create" className="create-btn">
                Create Your First Tier List
              </Link>
            </>
          ) : searchQuery ? (
            <>
              <p>No tier lists match your search criteria.</p>
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </>
          ) : (
            <p>There are no community tier lists yet. Be the first to create one!</p>
          )}
        </div>
      ) : (
        <div className="tierlists-grid">
          {filteredLists.map(tierList => (
            <div key={tierList._id} className="tierlist-card">
              <div className="tierlist-card-header">
                <h3 className="tierlist-title">{tierList.title}</h3>
                <div className="tierlist-meta">
                  <span className="tierlist-author">
                    By {tierList.user ? tierList.user.username : 'Unknown'}
                  </span>
                  <span className="tierlist-likes">
                    <FaHeart className="likes-icon" /> {tierList.likes}
                  </span>
                </div>
              </div>
              
              {renderTierPreview(tierList)}
              
              <Link to={`/tiers/${tierList._id}`} className="view-tierlist-btn">
                View Full Tier List
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TierListsPage;