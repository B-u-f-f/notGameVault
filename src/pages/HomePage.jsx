import React, { useState, useEffect } from 'react';
import { fetchFeaturedGame, fetchTrendingGames, fetchTopRatedGames, fetchNewReleases, fetchActionGames, fetchRPGGames, fetchAdventureGames, fetchHorrorGames } from '../utils/api';
import HeroSection from '../components/HeroSection';
import GameCarousel from '../components/GameCarousel';
import Loading from '../components/Loading';
import '../styles/HomePage.css';

function HomePage() {
  const [featuredGame, setFeaturedGame] = useState(null);
  const [trendingGames, setTrendingGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [actionGames, setActionGames] = useState([]);
  const [rpgGames, setRPGGames] = useState([]);
  const [adventureGames, setAdventureGames] = useState([]);
  const [horrorGames, setHorrorGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGameData() {
      try {
        // Fetch all game data in parallel
        const [
          featured,
          trending,
          topRated,
          newReleaseGames,
          action,
          rpg,
          adventure,
          horror
        ] = await Promise.all([
          fetchFeaturedGame(),
          fetchTrendingGames(),
          fetchTopRatedGames(),
          fetchNewReleases(),
          fetchActionGames(),
          fetchRPGGames(),
          fetchAdventureGames(),
          fetchHorrorGames()
        ]);

        setFeaturedGame(featured);
        setTrendingGames(trending);
        setTopRatedGames(topRated);
        setNewReleases(newReleaseGames);
        setActionGames(action);
        setRPGGames(rpg);
        setAdventureGames(adventure);
        setHorrorGames(horror);
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGameData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home-page">
      {featuredGame && <HeroSection game={featuredGame} />}
      
      <div className="game-carousels">
        {trendingGames.length > 0 && (
          <GameCarousel title="Trending Now" games={trendingGames} />
        )}
        
        {topRatedGames.length > 0 && (
          <GameCarousel title="Top Rated" games={topRatedGames} />
        )}
        
        {newReleases.length > 0 && (
          <GameCarousel title="New Releases" games={newReleases} />
        )}
        
        {horrorGames.length > 0 && (
          <GameCarousel title="Horror Games" games={horrorGames} />
        )}
        
        {actionGames.length > 0 && (
          <GameCarousel title="Action Games" games={actionGames} />
        )}
        
        {rpgGames.length > 0 && (
          <GameCarousel title="RPG Games" games={rpgGames} />
        )}
        
        {adventureGames.length > 0 && (
          <GameCarousel title="Adventure Games" games={adventureGames} />
        )}
      </div>
    </div>
  );
}

export default HomePage; 