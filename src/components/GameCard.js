import React, { useState } from 'react';
import './GameCard.css';

const GameCard = ({ game }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Default game data if not provided
  const gameData = {
    id: game?.id || 'game-1',
    title: game?.title || 'Game Title',
    cover: game?.cover || 'https://via.placeholder.com/400x600?text=Game',
    year: game?.year || '2023',
    platforms: game?.platforms || ['PC', 'PS5'],
    rating: game?.rating || (Math.random() * 2 + 3).toFixed(1), // Random between 3.0 and 5.0
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    const rating = parseFloat(gameData.rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    
    return stars;
  };

  return (
    <div 
      className="game-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="game-card-inner">
        <a href={`/game/${gameData.id}`} className="game-card-link">
          <div className="game-card-image-container">
            <img 
              src={gameData.cover} 
              alt={gameData.title} 
              className="game-card-image"
            />
            <div className="game-card-badge">{gameData.year}</div>
            
            <div className={`game-card-overlay ${isHovered ? 'visible' : ''}`}>
              <div className="game-card-platforms">
                {gameData.platforms.slice(0, 3).map((platform, index) => (
                  <span key={index} className="platform-tag">{platform}</span>
                ))}
              </div>
              
              <button className="view-details-btn">View Details</button>
            </div>
          </div>
          
          <div className="game-card-content">
            <h3 className="game-card-title">{gameData.title}</h3>
            
            <div className="game-card-rating">
              <div className="stars-container">
                {renderStars()}
              </div>
              <span className="rating-value">{gameData.rating}</span>
            </div>
          </div>
        </a>
        
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg className="heart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GameCard; 