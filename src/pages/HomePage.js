import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import GameCarousel from '../components/GameCarousel';
import SteamApiService from '../services/steamApi';
import './PageStyles.css';

const HomePage = () => {
  const [featuredGame, setFeaturedGame] = useState(null);
  const [trendingGames, setTrendingGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  
  // Section-specific loading states
  const [loadingStates, setLoadingStates] = useState({
    featured: true,
    trending: true,
    topRated: true,
    newReleases: true
  });
  
  // Section-specific error states
  const [errorStates, setErrorStates] = useState({
    featured: null,
    trending: null,
    topRated: null,
    newReleases: null
  });

  // Update loading state helper
  const updateLoadingState = (section, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [section]: isLoading }));
  };

  // Update error state helper
  const updateErrorState = (section, error) => {
    setErrorStates(prev => ({ ...prev, [section]: error }));
  };

  useEffect(() => {
    // Fetch featured game
    const fetchFeaturedGame = async () => {
      updateLoadingState('featured', true);
      try {
        const featuredData = await SteamApiService.getFeaturedGame();
        setFeaturedGame(featuredData);
        updateErrorState('featured', null);
      } catch (err) {
        console.error("Error fetching featured game:", err.message);
        updateErrorState('featured', `Failed to load featured game: ${err.message}`);
        setFeaturedGame(null);
      } finally {
        updateLoadingState('featured', false);
      }
    };

    // Fetch trending games
    const fetchTrendingGames = async () => {
      updateLoadingState('trending', true);
      try {
        const trendingData = await SteamApiService.getTrendingGames();
        if (trendingData && trendingData.length > 0) {
          setTrendingGames(trendingData);
        } else {
          updateErrorState('trending', "No trending games available");
        }
      } catch (err) {
        console.error("Error fetching trending games:", err.message);
        updateErrorState('trending', `Failed to load trending games: ${err.message}`);
        setTrendingGames([]);
      } finally {
        updateLoadingState('trending', false);
      }
    };

    // Fetch top rated games
    const fetchTopRatedGames = async () => {
      updateLoadingState('topRated', true);
      try {
        const topRatedData = await SteamApiService.getTopRatedGames();
        if (topRatedData && topRatedData.length > 0) {
          setTopRatedGames(topRatedData);
        } else {
          updateErrorState('topRated', "No top rated games available");
        }
      } catch (err) {
        console.error("Error fetching top rated games:", err.message);
        updateErrorState('topRated', `Failed to load top rated games: ${err.message}`);
        setTopRatedGames([]);
      } finally {
        updateLoadingState('topRated', false);
      }
    };

    // Fetch new releases
    const fetchNewReleases = async () => {
      updateLoadingState('newReleases', true);
      try {
        const newReleasesData = await SteamApiService.getNewReleases();
        if (newReleasesData && newReleasesData.length > 0) {
          setNewReleases(newReleasesData);
        } else {
          updateErrorState('newReleases', "No new releases available");
        }
      } catch (err) {
        console.error("Error fetching new releases:", err.message);
        updateErrorState('newReleases', `Failed to load new releases: ${err.message}`);
        setNewReleases([]);
      } finally {
        updateLoadingState('newReleases', false);
      }
    };

    // Fetch all data in parallel
    Promise.all([
      fetchFeaturedGame().catch(err => console.error(err)),
      fetchTrendingGames().catch(err => console.error(err)),
      fetchTopRatedGames().catch(err => console.error(err)),
      fetchNewReleases().catch(err => console.error(err))
    ]);
  }, []);

  // Check if all sections are loading
  const isAllLoading = Object.values(loadingStates).every(state => state === true);
  
  // Check if all sections have errors
  const hasAllErrors = Object.values(errorStates).every(error => error !== null);

  return (
    <main className="home-page">
      {isAllLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading game data...</p>
        </div>
      ) : hasAllErrors ? (
        <div className="error-container">
          <h2>Error</h2>
          <p>Failed to load any game data. Please check your internet connection and try again.</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {loadingStates.featured ? (
            <div className="loading-section">Loading featured game...</div>
          ) : errorStates.featured ? (
            <div className="error-section">
              <h3>Featured Game Error</h3>
              <p>{errorStates.featured}</p>
            </div>
          ) : (
            <Hero game={featuredGame} />
          )}
          
          <section className="content">
            {loadingStates.trending ? (
              <div className="loading-section">Loading trending games...</div>
            ) : errorStates.trending ? (
              <div className="error-section">
                <h3>Error: Trending Games</h3>
                <p>{errorStates.trending}</p>
              </div>
            ) : (
              <GameCarousel 
                title="Trending Now" 
                games={trendingGames} 
              />
            )}
            
            {loadingStates.topRated ? (
              <div className="loading-section">Loading top rated games...</div>
            ) : errorStates.topRated ? (
              <div className="error-section">
                <h3>Error: Top Rated Games</h3>
                <p>{errorStates.topRated}</p>
              </div>
            ) : (
              <GameCarousel 
                title="Top Rated" 
                games={topRatedGames} 
              />
            )}
            
            {loadingStates.newReleases ? (
              <div className="loading-section">Loading new releases...</div>
            ) : errorStates.newReleases ? (
              <div className="error-section">
                <h3>Error: New Releases</h3>
                <p>{errorStates.newReleases}</p>
              </div>
            ) : (
              <GameCarousel 
                title="New Releases" 
                games={newReleases} 
              />
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default HomePage; 