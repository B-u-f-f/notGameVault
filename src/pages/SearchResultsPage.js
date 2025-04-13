import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SteamApiService from '../services/steamApi';
import './PageStyles.css';
import { FaSearch, FaFilter, FaStar, FaGamepad, FaSortAmountDown } from 'react-icons/fa';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('relevance');
  const [filterPlatform, setFilterPlatform] = useState('all');
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        if (query && query.trim().length > 0) {
          const searchResults = await SteamApiService.searchGames(query);
          setResults(searchResults || []);
          setError(null);
        } else {
          setResults([]);
          setError('Please enter a search term');
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results. Please try again later.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query]);
  
  // Sort results based on selected order
  const sortedResults = [...results].sort((a, b) => {
    switch (sortOrder) {
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'rating-desc':
        return b.rating - a.rating;
      case 'rating-asc':
        return a.rating - b.rating;
      case 'year-desc':
        return parseInt(b.year) - parseInt(a.year);
      case 'year-asc':
        return parseInt(a.year) - parseInt(b.year);
      default:
        return 0; // default is relevance, keep original order
    }
  });
  
  // Filter results based on platform
  const filteredResults = filterPlatform === 'all' 
    ? sortedResults 
    : sortedResults.filter(game => 
        game.platforms && game.platforms.includes(filterPlatform)
      );
  
  // Generate stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = parseFloat(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingNum)) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === Math.ceil(ratingNum) && !Number.isInteger(ratingNum)) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    
    return stars;
  };

  return (
    <div className="search-results-page">
      <div className="search-header">
        <div className="search-title">
          <FaSearch className="search-title-icon" />
          <h1>Search Results for "{query}"</h1>
        </div>
        
        <div className="search-meta">
          <span className="results-count">
            {loading ? 'Searching...' : `${filteredResults.length} games found`}
          </span>
        </div>
      </div>
      
      <div className="search-container">
        <div className="search-filters">
          <div className="filter-section">
            <h3><FaSortAmountDown /> Sort By</h3>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Relevance</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
              <option value="year-desc">Year (Newest First)</option>
              <option value="year-asc">Year (Oldest First)</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3><FaGamepad /> Platform</h3>
            <select 
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Platforms</option>
              <option value="PC">PC</option>
              <option value="Mac">Mac</option>
              <option value="Linux">Linux</option>
              <option value="PS5">PlayStation 5</option>
              <option value="Xbox">Xbox</option>
              <option value="Switch">Nintendo Switch</option>
            </select>
          </div>
          
          <div className="applied-filters">
            <h3><FaFilter /> Applied Filters</h3>
            <div className="filter-tags">
              <div className="filter-tag">
                <span className="filter-label">Search:</span>
                <span className="filter-value">{query}</span>
              </div>
              
              {filterPlatform !== 'all' && (
                <div className="filter-tag">
                  <span className="filter-label">Platform:</span>
                  <span className="filter-value">{filterPlatform}</span>
                </div>
              )}
              
              {sortOrder !== 'relevance' && (
                <div className="filter-tag">
                  <span className="filter-label">Sort:</span>
                  <span className="filter-value">
                    {sortOrder.replace('-', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="search-results-list">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Searching for games...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <h2>Error</h2>
              <p>{error}</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="no-results">
              <h2>No games found</h2>
              <p>We couldn't find any games matching your search criteria.</p>
              <p>Try adjusting your filters or search for something else.</p>
            </div>
          ) : (
            filteredResults.map(game => (
              <div key={game.id} className="search-result-card">
                <div className="result-image-container">
                  <img 
                    src={game.cover} 
                    alt={game.title} 
                    className="result-image"
                  />
                </div>
                
                <div className="result-details">
                  <h2 className="result-title">{game.title}</h2>
                  
                  <div className="result-meta">
                    <span className="result-year">{game.year}</span>
                    <span className="result-platforms">
                      {game.platforms?.join(', ') || 'Platform not specified'}
                    </span>
                  </div>
                  
                  <p className="result-description">{game.description}</p>
                  
                  <div className="result-footer">
                    <div className="result-rating">
                      <div className="stars-container">
                        {renderStars(game.rating)}
                      </div>
                      <span className="rating-value">{game.rating}</span>
                    </div>
                    
                    <Link to={`/game/${game.id}`} className="view-game-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;