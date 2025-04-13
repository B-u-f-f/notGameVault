import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SteamApiService from '../services/steamApi';
import './PageStyles.css';

const GameDetailPage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [activePeriod, setActivePeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      try {
        // Fetch game details
        const gameDetails = await SteamApiService.getGameDetails(gameId);
        if (gameDetails) {
          setGame(gameDetails);
        } else {
          setError("Could not find game details");
        }

        // Fetch player count history
        const playerHistory = await SteamApiService.getPlayerCountHistory(gameId, activePeriod);
        if (playerHistory) {
          setPlayerData(playerHistory);
        }

        // Fetch price history
        const priceData = await SteamApiService.getPriceHistory(gameId);
        if (priceData) {
          setPriceHistory(priceData);
        }
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError("Failed to load game data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId, activePeriod]);

  const handleChangePeriod = (period) => {
    setActivePeriod(period);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading game details...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="error-container">
        <h2>Game Not Found</h2>
        <p>{error || "Sorry, we couldn't find the game you're looking for."}</p>
      </div>
    );
  }

  return (
    <div className="game-detail-page">
      {/* Hero Banner */}
      <div className="game-detail-hero" style={{ backgroundImage: `url(${game.background})` }}>
        <div className="game-detail-hero-content">
          <h1 className="game-detail-title">{game.title}</h1>
          <div className="game-detail-meta">
            <span className="game-detail-year">{game.releaseDate || game.year}</span>
            <span className="divider">•</span>
            <span className="game-detail-platforms">{game.platforms.join(', ')}</span>
            <span className="divider">•</span>
            <div className="game-detail-rating">
              <span className="star">★</span> {game.rating}/5
            </div>
            {game.currentPlayers && (
              <>
                <span className="divider">•</span>
                <div className="current-players">
                  <span className="player-count">{game.currentPlayers.toLocaleString()}</span> playing now
                </div>
              </>
            )}
          </div>
          <p className="game-detail-description">{game.description}</p>
          <div className="game-detail-actions">
            {game.trailerUrl && (
              <a href={game.trailerUrl} target="_blank" rel="noopener noreferrer" className="primary-button">
                Watch Trailer
              </a>
            )}
            {game.steamUrl && (
              <a href={game.steamUrl} target="_blank" rel="noopener noreferrer" className="secondary-button">
                View on Steam
              </a>
            )}
            <button className="secondary-button">
              Add to Collection
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Info */}
      <div className="game-detail-content">
        <div className="game-detail-main">
          <section className="game-detail-section">
            <h2>About</h2>
            <p className="game-detail-long-description">{game.longDescription}</p>
          </section>
          
          {playerData && playerData.length > 0 && (
            <section className="game-detail-section">
              <h2>Player Count History</h2>
              <div className="chart-controls">
                <button 
                  className={`period-btn ${activePeriod === '24h' ? 'active' : ''}`}
                  onClick={() => handleChangePeriod('24h')}
                >
                  24 Hours
                </button>
                <button 
                  className={`period-btn ${activePeriod === '7d' ? 'active' : ''}`}
                  onClick={() => handleChangePeriod('7d')}
                >
                  7 Days
                </button>
                <button 
                  className={`period-btn ${activePeriod === '30d' ? 'active' : ''}`}
                  onClick={() => handleChangePeriod('30d')}
                >
                  30 Days
                </button>
                <button 
                  className={`period-btn ${activePeriod === 'all' ? 'active' : ''}`}
                  onClick={() => handleChangePeriod('all')}
                >
                  All Time
                </button>
              </div>
              <div className="player-chart">
                {/* Chart would be rendered here in a real implementation with Chart.js or similar */}
                <div className="chart-placeholder">
                  Player count chart visualization - {activePeriod} period
                </div>
              </div>
            </section>
          )}
          
          {priceHistory && priceHistory.length > 0 && (
            <section className="game-detail-section">
              <h2>Price History</h2>
              <div className="price-chart">
                {/* Chart would be rendered here in a real implementation with Chart.js or similar */}
                <div className="chart-placeholder">
                  Price history chart visualization
                </div>
                <div className="price-stats">
                  <div className="price-stat">
                    <span className="stat-label">Current Price:</span>
                    <span className="current-price">{game.price || 'Free to Play'}</span>
                  </div>
                  <div className="price-stat">
                    <span className="stat-label">Lowest Price:</span>
                    <span className="lowest-price">{game.lowestPrice || 'N/A'}</span>
                  </div>
                  <div className="price-stat">
                    <span className="stat-label">Highest Price:</span>
                    <span className="highest-price">{game.highestPrice || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {game.screenshots && game.screenshots.length > 0 && (
            <section className="game-detail-section">
              <h2>Screenshots</h2>
              <div className="screenshots-gallery">
                {game.screenshots.map((screenshot, index) => (
                  <img 
                    key={index}
                    src={screenshot}
                    alt={`${game.title} screenshot ${index + 1}`}
                    className="screenshot-image"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
        
        <div className="game-detail-sidebar">
          <div className="game-info-card">
            <img src={game.cover} alt={game.title} className="game-cover" />
            
            <div className="game-info-details">
              <div className="info-item">
                <span className="info-label">Developer</span>
                <span className="info-value">{game.developer}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Publisher</span>
                <span className="info-value">{game.publisher}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Release Date</span>
                <span className="info-value">{game.releaseDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Genres</span>
                <div className="genre-tags">
                  {game.genres.map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                </div>
              </div>
              {game.tags && game.tags.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Tags</span>
                  <div className="genre-tags">
                    {game.tags.slice(0, 6).map(tag => (
                      <span key={tag} className="genre-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage; 