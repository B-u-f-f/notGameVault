import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaTrophy, FaHeart, FaPen, FaTrash, FaLock, FaGlobe } from 'react-icons/fa';
import { useTierLists } from '../context/TierListsContext';
import { useAuth } from '../context/AuthContext';
import './PageStyles.css';

const TierListDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTierList, currentTierList, deleteTierList, likeTierList, loading, error } = useTierLists();
  const { isAuthenticated, user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const loadTierList = async () => {
      await getTierList(id);
    };
    
    loadTierList();
  }, [id, getTierList]);

  const handleLike = () => {
    if (isAuthenticated) {
      likeTierList(id);
    } else {
      // Prompt to login
      if (window.confirm('You need to be logged in to like tier lists. Would you like to login now?')) {
        navigate('/login');
      }
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteTierList(id);
      navigate('/tiers');
    } else {
      setConfirmDelete(true);
      // Reset confirmation after 5 seconds
      setTimeout(() => setConfirmDelete(false), 5000);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tier list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/tiers" className="btn-primary">Back to Tier Lists</Link>
      </div>
    );
  }

  if (!currentTierList) {
    return (
      <div className="error-container">
        <h2>Tier List Not Found</h2>
        <p>Sorry, the requested tier list doesn't exist or has been removed.</p>
        <Link to="/tiers" className="btn-primary">Back to Tier Lists</Link>
      </div>
    );
  }
  
  // Check if user is the owner of the tier list
  const isOwner = isAuthenticated && user && currentTierList.user && user.id === currentTierList.user._id;

  return (
    <div className="tierlist-detail-page">
      <div className="tierlist-detail-header">
        <div className="tierlist-meta">
          <h1>{currentTierList.title}</h1>
          <div className="tierlist-info">
            <span className="tierlist-author">
              By {currentTierList.user ? currentTierList.user.username : 'Unknown'}
            </span>
            <span className="tierlist-privacy">
              {currentTierList.isPublic ? (
                <><FaGlobe /> Public</>
              ) : (
                <><FaLock /> Private</>
              )}
            </span>
            <span className="tierlist-likes">
              <FaTrophy /> {currentTierList.likes} likes
            </span>
          </div>
          {currentTierList.description && (
            <p className="tierlist-description">{currentTierList.description}</p>
          )}
        </div>
        
        <div className="tierlist-actions">
          {isOwner ? (
            <>
              <Link to={`/tiers/edit/${id}`} className="tierlist-edit-btn">
                <FaPen /> Edit
              </Link>
              <button 
                className={`tierlist-delete-btn ${confirmDelete ? 'confirm' : ''}`}
                onClick={handleDelete}
              >
                <FaTrash /> {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </button>
            </>
          ) : (
            <button className="tierlist-like-btn" onClick={handleLike}>
              <FaHeart /> Like
            </button>
          )}
        </div>
      </div>
      
      <div className="tierlist-content">
        {currentTierList.tiers.map((tier, index) => (
          <div 
            key={index} 
            className="tierlist-row"
            style={{ backgroundColor: 'rgba(16, 24, 38, 0.6)' }}
          >
            <div 
              className="tierlist-label"
              style={{ backgroundColor: tier.color || '#8a66ff' }}
            >
              {tier.name}
            </div>
            <div className="tierlist-games">
              {tier.games && tier.games.length > 0 ? (
                tier.games.map((game, gameIndex) => (
                  <Link
                    key={gameIndex}
                    to={`/game/${game.gameId}`}
                    className="tierlist-game-card"
                  >
                    <img
                      src={game.cover}
                      alt={game.title}
                      className="tierlist-game-image"
                    />
                    <span className="tierlist-game-title">{game.title}</span>
                  </Link>
                ))
              ) : (
                <div className="tierlist-empty-row">No games in this tier</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="tierlist-footer">
        <Link to="/tiers" className="back-btn">
          Back to Tier Lists
        </Link>
        
        {isAuthenticated && !isOwner && (
          <button className="create-btn">
            Create a similar tier list
          </button>
        )}
      </div>
    </div>
  );
};

export default TierListDetailPage;