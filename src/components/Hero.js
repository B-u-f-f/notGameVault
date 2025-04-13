import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = ({ game }) => {
  // Use default data if no game is provided
  const gameData = game || {
    id: 'default-game',
    title: 'Featured Game',
    description: 'Loading featured game...',
    background: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    cover: 'https://via.placeholder.com/400x600?text=Game',
    rating: '4.5',
    playerCount: '0',
    platforms: ['PC'],
    releaseDate: 'TBD',
    publisher: 'TBD',
    developer: 'TBD'
  };

  return (
    <section 
      className="hero-section" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(10, 14, 23, 0.7), rgba(10, 14, 23, 0.9)), url(${gameData.background})`
      }}
    >
      <div className="hero-content">
        <div className="hero-info">
          <h1 className="hero-title">{gameData.title}</h1>
          
          <div className="hero-meta">
            {gameData.releaseDate && (
              <span className="meta-item">{gameData.releaseDate}</span>
            )}
            
            {gameData.rating && (
              <div className="meta-item rating">
                <span className="rating-value">{gameData.rating}</span>
                <span className="rating-max">/5</span>
              </div>
            )}
            
            {gameData.currentPlayers && (
              <span className="meta-item players">
                <span className="player-count">{new Intl.NumberFormat().format(gameData.currentPlayers)}</span> playing now
              </span>
            )}
          </div>
          
          <p className="hero-description">{gameData.description}</p>
          
          {gameData.platforms && gameData.platforms.length > 0 && (
            <div className="platform-tags">
              {gameData.platforms.map((platform, index) => (
                <span key={index} className="platform-tag">{platform}</span>
              ))}
            </div>
          )}
          
          <div className="hero-buttons">
            <Link to={`/game/${gameData.id}`} className="btn-primary">
              View Details
            </Link>
            
            {gameData.trailerUrl && (
              <a href={gameData.trailerUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Watch Trailer
              </a>
            )}
          </div>
        </div>
        
        <div className="hero-image">
          <img src={gameData.cover} alt={gameData.title} />
        </div>
      </div>
    </section>
  );
};

export default Hero; 