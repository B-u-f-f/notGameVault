import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SteamApiService from '../services/steamApi';
import './PageStyles.css';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const GameDetailPage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [activePeriod, setActivePeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for chart canvases
  const playerChartRef = useRef(null);
  const priceChartRef = useRef(null);
  
  // Refs for chart instances
  const playerChartInstance = useRef(null);
  const priceChartInstance = useRef(null);

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

  // Effect for rendering player count chart
  useEffect(() => {
    if (playerData && playerData.length > 0 && playerChartRef.current) {
      // Destroy existing chart if it exists
      if (playerChartInstance.current) {
        playerChartInstance.current.destroy();
      }
      
      const ctx = playerChartRef.current.getContext('2d');
      
      // Prepare data for chart
      const labels = playerData.map(item => item.date);
      const data = playerData.map(item => item.count);
      
      // Create new chart
      playerChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Player Count',
            data: data,
            borderColor: '#8a66ff',
            backgroundColor: 'rgba(138, 102, 255, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#8a66ff',
            pointBorderColor: '#fff',
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(16, 24, 38, 0.9)',
              titleColor: '#fff',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(138, 102, 255, 0.5)',
              borderWidth: 1,
              displayColors: false,
              callbacks: {
                title: function(tooltipItems) {
                  return tooltipItems[0].label;
                },
                label: function(context) {
                  return `Players: ${context.raw.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#a0aec0',
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#a0aec0',
                callback: function(value) {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'K';
                  }
                  return value;
                }
              }
            }
          }
        }
      });
    }
    
    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (playerChartInstance.current) {
        playerChartInstance.current.destroy();
      }
    };
  }, [playerData]);

  // Effect for rendering price history chart
  useEffect(() => {
    if (priceHistory && priceHistory.length > 0 && priceChartRef.current) {
      // Destroy existing chart if it exists
      if (priceChartInstance.current) {
        priceChartInstance.current.destroy();
      }
      
      const ctx = priceChartRef.current.getContext('2d');
      
      // Extract currency symbol from price
      const currencySymbol = priceHistory[0].price.match(/^[^0-9]*/)[0] || '$';
      
      // Prepare data for chart
      const labels = priceHistory.map(item => item.date);
      const data = priceHistory.map(item => parseFloat(item.price.replace(/[^0-9.]/g, '')));
      
      // Create new chart
      priceChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Price',
            data: data,
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            borderWidth: 2,
            tension: 0.2,
            fill: true,
            pointBackgroundColor: '#4ade80',
            pointBorderColor: '#fff',
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(16, 24, 38, 0.9)',
              titleColor: '#fff',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(74, 222, 128, 0.5)',
              borderWidth: 1,
              displayColors: false,
              callbacks: {
                title: function(tooltipItems) {
                  return tooltipItems[0].label;
                },
                label: function(context) {
                  return `Price: ${currencySymbol}${context.raw.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#a0aec0',
                maxRotation: 45,
                minRotation: 45,
                maxTicksLimit: 8
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#a0aec0',
                callback: function(value) {
                  return currencySymbol + value.toFixed(2);
                }
              }
            }
          }
        }
      });
    }
    
    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (priceChartInstance.current) {
        priceChartInstance.current.destroy();
      }
    };
  }, [priceHistory]);

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
            <div 
              className="game-detail-long-description"
              dangerouslySetInnerHTML={{ __html: game.longDescription }}
            />
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
              <div className="chart-container">
                <canvas ref={playerChartRef} id="playerChart"></canvas>
              </div>
            </section>
          )}
          
          {priceHistory && priceHistory.length > 0 && (
            <section className="game-detail-section">
              <h2>Price History</h2>
              <div className="chart-container">
                <canvas ref={priceChartRef} id="priceChart"></canvas>
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