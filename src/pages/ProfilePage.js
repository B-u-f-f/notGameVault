import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaHeart, FaList, FaEdit, FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTierLists } from '../context/TierListsContext';
import GameCard from '../components/GameCard';
import './PageStyles.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites', 'tierlists'
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { userTierLists, getUserTierLists, loading: tierListsLoading } = useTierLists();

  useEffect(() => {
    // Load user tier lists if not already loaded
    if (userTierLists.length === 0 && !tierListsLoading) {
      getUserTierLists();
    }
  }, [getUserTierLists, userTierLists.length, tierListsLoading]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser className="avatar-icon" />
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-joined">
            Joined: {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <FaHeart /> Favorites
        </button>
        <button
          className={`profile-tab ${activeTab === 'tierlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('tierlists')}
        >
          <FaList /> My Tier Lists
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'favorites' ? (
          <div className="favorites-section">
            <h2>My Favorite Games</h2>
            
            {favoritesLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading favorites...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="empty-state">
                <h3>No Favorites Yet</h3>
                <p>You haven't added any games to your favorites yet.</p>
                <Link to="/" className="action-btn">
                  Explore Games
                </Link>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map(game => (
                  <GameCard
                    key={game.gameId}
                    game={{
                      id: game.gameId,
                      title: game.title,
                      cover: game.cover,
                      year: game.year,
                      rating: game.rating
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="tierlists-section">
            <div className="tierlists-header">
              <h2>My Tier Lists</h2>
              <Link to="/tiers/create" className="create-tierlist-btn">
                <FaPlus /> Create New Tier List
              </Link>
            </div>
            
            {tierListsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading tier lists...</p>
              </div>
            ) : userTierLists.length === 0 ? (
              <div className="empty-state">
                <h3>No Tier Lists Yet</h3>
                <p>You haven't created any tier lists yet.</p>
                <Link to="/tiers/create" className="action-btn">
                  Create Your First Tier List
                </Link>
              </div>
            ) : (
              <div className="user-tierlists-grid">
                {userTierLists.map(tierList => (
                  <div key={tierList._id} className="user-tierlist-card">
                    <div className="user-tierlist-info">
                      <h3>{tierList.title}</h3>
                      <div className="user-tierlist-meta">
                        <span className="visibility">
                          {tierList.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span className="separator">•</span>
                        <span className="likes">{tierList.likes} likes</span>
                        <span className="separator">•</span>
                        <span className="updated">
                          Updated {formatDate(tierList.updatedAt)}
                        </span>
                      </div>
                      {tierList.description && (
                        <p className="user-tierlist-description">
                          {tierList.description.length > 100
                            ? `${tierList.description.substring(0, 100)}...`
                            : tierList.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="user-tierlist-preview">
                      {tierList.tiers[0] && tierList.tiers[0].games.length > 0 ? (
                        <div className="tier-preview">
                          <div className="preview-tier" style={{ backgroundColor: tierList.tiers[0].color }}>
                            {tierList.tiers[0].name}
                          </div>
                          <div className="preview-games">
                            {tierList.tiers[0].games.slice(0, 3).map((game, idx) => (
                              <img 
                                key={idx} 
                                src={game.cover} 
                                alt={game.title} 
                                className="preview-game-img" 
                              />
                            ))}
                            {tierList.tiers[0].games.length > 3 && (
                              <div className="more-games">
                                +{tierList.tiers[0].games.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="empty-preview">No games added yet</div>
                      )}
                    </div>
                    
                    <div className="user-tierlist-actions">
                      <Link to={`/tiers/${tierList._id}`} className="view-btn">
                        View
                      </Link>
                      <Link to={`/tiers/edit/${tierList._id}`} className="edit-btn">
                        <FaEdit /> Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;