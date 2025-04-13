import React, { useRef, useState, useEffect } from 'react';
import GameCard from './GameCard';
import './GameCarousel.css';

const GameCarousel = ({ title, games = [] }) => {
  const carouselRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  // Sample games data if none provided
  const defaultGames = [
    {
      id: 'game-1',
      title: 'Resident Evil 4',
      cover: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/31839b036f63806cba3f47b93af8ccb5.jpg',
      year: '2023',
      platforms: ['PS5', 'Xbox', 'PC'],
      rating: 4.7
    },
    {
      id: 'game-2',
      title: 'Hogwarts Legacy',
      cover: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/9efb4992c71df1e040a4602a2c9d6edb.jpg',
      year: '2023',
      platforms: ['PS5', 'Xbox', 'PC'],
      rating: 4.5
    },
    {
      id: 'game-3',
      title: 'Diablo IV',
      cover: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/28f699c908ed38ba6fa75a24d481d0f6.jpg',
      year: '2023',
      platforms: ['PS5', 'Xbox', 'PC'],
      rating: 4.3
    },
    {
      id: 'game-4',
      title: 'Final Fantasy XVI',
      cover: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/621aa3aafee4a234bd8b64c2512b2c78.jpg',
      year: '2023',
      platforms: ['PS5'],
      rating: 4.6
    },
    {
      id: 'game-5',
      title: 'Elden Ring',
      cover: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/a3590e7c10d0b317a444f1e97a8b2a29.jpg',
      year: '2022',
      platforms: ['PS5', 'Xbox', 'PC'],
      rating: 4.9
    },
    {
      id: 'game-6',
      title: 'The Witcher 3',
      cover: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/b7e20c284608e55cb158a25633967748.jpg',
      year: '2015',
      platforms: ['PS5', 'Xbox', 'PC', 'Switch'],
      rating: 4.8
    }
  ];

  const gameList = games.length > 0 ? games : defaultGames;

  const handleScroll = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    
    setShowLeftButton(scrollLeft > 10);
    setShowRightButton(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      handleScroll();
      carousel.addEventListener('scroll', handleScroll);
      
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollLeft = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: -600,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: 600,
      behavior: 'smooth'
    });
  };

  return (
    <div className="game-carousel">
      <div className="carousel-header">
        <h2 className="carousel-title">{title}</h2>
        <div className="carousel-controls">
          {showLeftButton && (
            <button 
              className="carousel-control left" 
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          {showRightButton && (
            <button 
              className="carousel-control right" 
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div 
        className="carousel-container" 
        ref={carouselRef}
      >
        {gameList.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameCarousel; 