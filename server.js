const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4560;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const REGION = process.env.REGION || 'us';
const CURRENCY = process.env.CURRENCY || '1';  // Default is USD (1), INR is 24

// Validate Steam API key
if (!STEAM_API_KEY || STEAM_API_KEY.length !== 32) {
  console.error('Invalid or missing Steam API key. Please check your .env file.');
  process.exit(1);
}

// Setup axios with default timeout and error handling
const steamAxios = axios.create({
  timeout: 10000 // 10 seconds timeout
});

// Add a request interceptor for debugging
steamAxios.interceptors.request.use(config => {
  console.log(`Making request to: ${config.url}`);
  return config;
});

// Add a response interceptor for debugging
steamAxios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('Steam API response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Steam API no response:', {
        url: error.config.url,
        message: 'No response received'
      });
    } else {
      // Something happened in setting up the request
      console.error('Steam API request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Middleware
app.use(cors());
app.use(express.json());

// Check if build directory exists before serving static files
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Steam API base URLs
const STEAM_STORE_API = 'https://store.steampowered.com/api';
const STEAM_WEB_API = 'https://api.steampowered.com';

// Cache popular and featured games to avoid rate limiting
let gamesCache = {
  trending: [],
  topRated: [],
  newReleases: [],
  featured: null,
  horrorGames: [],
  lastUpdated: null
};

// Cache expiration time (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

// Helper function to fetch game details from Steam
async function getGameDetails(appId) {
  try {
    console.log(`Fetching game details for app ID: ${appId}`);
    const response = await steamAxios.get(`${STEAM_STORE_API}/appdetails?appids=${appId}&cc=${REGION}&currency=${CURRENCY}`);
    
    // Log full response for debugging
    console.log(`Steam API response for app ${appId}:`, {
      status: response.status,
      hasData: !!response.data,
      appIdInResponse: response.data && !!response.data[appId],
      isSuccess: response.data && response.data[appId] && response.data[appId].success
    });
    
    if (response.data && response.data[appId] && response.data[appId].success) {
      const gameData = response.data[appId].data;
      return {
        id: appId,
        title: gameData.name,
        description: gameData.short_description || '',
        longDescription: gameData.detailed_description || '',
        cover: gameData.header_image || '',
        background: gameData.background || gameData.header_image || '',
        year: new Date(gameData.release_date?.date || '').getFullYear() || 'Unknown',
        developer: gameData.developers?.join(', ') || 'Unknown',
        publisher: gameData.publishers?.join(', ') || 'Unknown',
        platforms: getPlatforms(gameData),
        genres: gameData.genres?.map(genre => genre.description) || [],
        tags: gameData.categories?.map(cat => cat.description) || [],
        rating: (gameData.metacritic?.score / 20) || 4.0, // Convert to 5-star rating
        currentPlayers: Math.floor(Math.random() * 100000), // Would need to be replaced with real data from ISteamUserStats
        releaseDate: gameData.release_date?.date || 'Unknown',
        price: formatPrice(gameData.price_overview),
        lowestPrice: formatPrice(gameData.price_overview, 0.8), // Simulated lowest price
        highestPrice: formatPrice(gameData.price_overview, 1.2), // Simulated highest price
        screenshots: gameData.screenshots?.slice(0, 3).map(ss => ss.path_full) || [],
        trailerUrl: gameData.movies?.[0]?.webm?.max || null,
        steamUrl: `https://store.steampowered.com/app/${appId}`
      };
    } else if (response.data && response.data[appId]) {
      // The game exists in the response but success is false
      console.error(`Game API response unsuccessful for ${appId}:`, 
        response.data[appId].success === false ? 'Success is false' : 'Unknown error');
      return null;
    } else {
      // The game ID doesn't exist in the response
      console.error(`Game not found in API response for ${appId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching game details for ${appId}:`, error.message);
    return null;
  }
}

// Helper function to get platforms from game data
function getPlatforms(gameData) {
  const platforms = [];
  if (gameData.platforms) {
    if (gameData.platforms.windows) platforms.push('PC');
    if (gameData.platforms.mac) platforms.push('Mac');
    if (gameData.platforms.linux) platforms.push('Linux');
  }
  return platforms.length > 0 ? platforms : ['PC'];
}

// Helper function to format price data
function formatPrice(priceData, multiplier = 1) {
  if (!priceData) return 'Free to Play';
  
  const price = (priceData.initial / 100) * multiplier;
  // Using currency symbol based on region
  const currencySymbol = CURRENCY === '24' ? '₹' : '$';
  return `${currencySymbol}${price.toFixed(2)}`;
}

// Function to get top selling games - FIXED VERSION
async function getTopSellingGames(limit = 6) {
  try {
    const response = await steamAxios.get(`${STEAM_STORE_API}/featuredcategories?cc=${REGION}&currency=${CURRENCY}`);
    if (response.data && response.data.top_sellers && response.data.top_sellers.items) {
      // Use less restrictive filtering - just check for Steam Deck
      let games = response.data.top_sellers.items
        .filter(item => !item.name?.includes("Steam Deck"))
        .slice(0, limit);
      
      console.log(`Found ${games.length} top selling games before fetching details`);
      
      // If no games after filtering, use all items as fallback
      if (games.length === 0 && response.data.top_sellers.items.length > 0) {
        console.log('Using all top_sellers items as fallback');
        games = response.data.top_sellers.items.slice(0, limit);
      }
      
      // Get detailed info for each game
      const detailedGames = await Promise.all(
        games.map(async game => {
          try {
            const gameDetails = await getGameDetails(game.id);
            return gameDetails || null;
          } catch (error) {
            console.error(`Error getting details for game ${game.id}:`, error.message);
            return null;
          }
        })
      );
      
      const filteredGames = detailedGames.filter(game => game !== null);
      
      // Return empty array if no games were found
      if (filteredGames.length === 0) {
        console.log('No top selling games found in API results');
        
        // Create mock data as last resort
        return createMockGames(limit, 'Top Seller');
      }
      
      return filteredGames;
    }
    
    console.log('Failed to fetch top selling games: Invalid API response structure');
    return createMockGames(limit, 'Top Seller');
  } catch (error) {
    console.error('Error fetching top selling games:', error.message);
    return createMockGames(limit, 'Top Seller');
  }
}

// Function to get new releases - FIXED VERSION
async function getNewReleases(limit = 6) {
  try {
    const response = await steamAxios.get(`${STEAM_STORE_API}/featuredcategories?cc=${REGION}&currency=${CURRENCY}`);
    if (response.data && response.data.new_releases && response.data.new_releases.items) {
      // Use less restrictive filtering - just check for Steam Deck
      let games = response.data.new_releases.items
        .filter(item => !item.name?.includes("Steam Deck"))
        .slice(0, limit);
      
      console.log(`Found ${games.length} new releases before fetching details`);
      
      // If no games after filtering, use all items as fallback
      if (games.length === 0 && response.data.new_releases.items.length > 0) {
        console.log('Using all new_releases items as fallback');
        games = response.data.new_releases.items.slice(0, limit);
      }
      
      // Get detailed info for each game
      const detailedGames = await Promise.all(
        games.map(async game => {
          try {
            const gameDetails = await getGameDetails(game.id);
            return gameDetails || null;
          } catch (error) {
            console.error(`Error getting details for game ${game.id}:`, error.message);
            return null;
          }
        })
      );
      
      const filteredGames = detailedGames.filter(game => game !== null);
      
      // Return mock games if no games were found
      if (filteredGames.length === 0) {
        console.log('No new releases found in API results');
        return createMockGames(limit, 'New Release');
      }
      
      return filteredGames;
    }
    
    console.log('Failed to fetch new releases: Invalid API response structure');
    return createMockGames(limit, 'New Release');
  } catch (error) {
    console.error('Error fetching new releases:', error.message);
    return createMockGames(limit, 'New Release');
  }
}

// Function to get featured game - FIXED VERSION
async function getFeaturedGame() {
  try {
    console.log('Fetching featured game from Steam API');
    const response = await steamAxios.get(`${STEAM_STORE_API}/featured?cc=${REGION}&currency=${CURRENCY}`);
    
    // Log response for debugging
    console.log('Featured API response:', {
      status: response.status,
      hasFeaturedWin: response.data && !!response.data.featured_win,
      featuredWinLength: response.data && response.data.featured_win ? response.data.featured_win.length : 0
    });
    
    if (response.data && response.data.featured_win && response.data.featured_win.length > 0) {
      // Less restrictive filtering - just exclude Steam Deck
      const featuredGames = response.data.featured_win
        .filter(item => !item.name?.includes("Steam Deck"));
      
      console.log(`Found ${featuredGames.length} valid featured games`);
      
      if (featuredGames.length === 0) {
        console.log('No valid featured games found after filtering, using first item as fallback');
        // Fallback to first item if filtering excludes everything
        if (response.data.featured_win.length > 0) {
          const firstItem = response.data.featured_win[0];
          console.log(`Using first item as fallback: ${firstItem.name || 'Unknown'} (${firstItem.id})`);
          const gameDetails = await getGameDetails(firstItem.id);
          if (gameDetails) return gameDetails;
        }
        return createMockGame('Featured');
      }
      
      // Pick a random featured game
      const randomIndex = Math.floor(Math.random() * featuredGames.length);
      const featuredGame = featuredGames[randomIndex];
      
      console.log(`Selected featured game: ${featuredGame.name || 'Unknown'} (${featuredGame.id})`);
      
      // Get detailed info
      const gameDetails = await getGameDetails(featuredGame.id);
      if (gameDetails) return gameDetails;
      
      return createMockGame('Featured');
    } else {
      console.error('Invalid API response structure for featured games');
      return createMockGame('Featured');
    }
  } catch (error) {
    console.error('Error fetching featured game:', error.message);
    return createMockGame('Featured');
  }
}

// Function to get horror games - FIXED VERSION
async function getHorrorGames(limit = 6) {
  try {
    const categories = [
      'topsellers', 'new_releases', 'specials', 'top_rated', 'popular_upcoming'
    ];
    
    let horrorGames = [];
    
    // Search for horror games across different categories
    await Promise.all(categories.map(async (category) => {
      try {
        const response = await steamAxios.get(`${STEAM_STORE_API}/featuredcategories?cc=${REGION}&currency=${CURRENCY}`);
        
        if (response.data && response.data[category] && response.data[category].items) {
          const categoryGames = response.data[category].items
            .filter(item => !item.name?.includes("Steam Deck"));
          
          // Get details for each game
          const detailedGames = await Promise.all(
            categoryGames.slice(0, 3).map(async game => {
              try {
                const gameDetails = await getGameDetails(game.id);
                // Check if it's a horror game based on genres and tags
                if (gameDetails) {
                  const genres = gameDetails.genres || [];
                  const tags = gameDetails.tags || [];
                  
                  const horrorKeywords = ['horror', 'survival horror', 'psychological horror', 'dark', 'zombie'];
                  
                  const isHorror = genres.some(genre => 
                    horrorKeywords.some(keyword => genre.toLowerCase().includes(keyword))
                  ) || tags.some(tag => 
                    horrorKeywords.some(keyword => tag.toLowerCase().includes(keyword))
                  );
                  
                  return isHorror ? gameDetails : null;
                }
                return null;
              } catch (error) {
                console.error(`Error getting details for game ${game.id}:`, error.message);
                return null;
              }
            })
          );
          
          const filteredHorrorGames = detailedGames.filter(game => game !== null);
          horrorGames = [...horrorGames, ...filteredHorrorGames];
        }
      } catch (error) {
        console.error(`Error fetching ${category} category:`, error.message);
      }
    }));
    
    // Return mock horror games if no horror games were found
    if (horrorGames.length === 0) {
      console.log('No horror games found in API results');
      return createMockGames(limit, 'Horror');
    }
    
    // Ensure we only return the requested number of games
    return horrorGames.slice(0, limit);
  } catch (error) {
    console.error('Error fetching horror games:', error.message);
    return createMockGames(limit, 'Horror');
  }
}

// Function to create mock game data as fallback
function createMockGame(category) {
  const id = Math.floor(Math.random() * 900000) + 100000;
  return {
    id: id.toString(),
    title: `${category} Game ${id}`,
    description: 'This is a placeholder game when Steam API data is unavailable.',
    longDescription: 'This is a detailed placeholder description for when Steam API data could not be retrieved successfully.',
    cover: 'https://via.placeholder.com/460x215/0a1128/ffffff?text=Game+Placeholder',
    background: 'https://via.placeholder.com/1920x620/0a1128/ffffff?text=Game+Background+Placeholder',
    year: new Date().getFullYear(),
    developer: 'Placeholder Studios',
    publisher: 'GameVault Publishing',
    platforms: ['PC', 'Mac', 'Linux'],
    genres: ['Action', 'Adventure', 'RPG'],
    tags: ['Singleplayer', 'Story Rich', 'Open World'],
    rating: 4.5,
    currentPlayers: Math.floor(Math.random() * 50000),
    releaseDate: new Date().toISOString().split('T')[0],
    price: '$29.99',
    lowestPrice: '$19.99',
    highestPrice: '$39.99',
    screenshots: [
      'https://via.placeholder.com/1280x720/0a1128/ffffff?text=Screenshot+1',
      'https://via.placeholder.com/1280x720/0a1128/ffffff?text=Screenshot+2',
      'https://via.placeholder.com/1280x720/0a1128/ffffff?text=Screenshot+3'
    ],
    trailerUrl: null,
    steamUrl: `https://store.steampowered.com/app/${id}`
  };
}

// Function to create multiple mock games
function createMockGames(count, category) {
  const games = [];
  for (let i = 0; i < count; i++) {
    games.push(createMockGame(`${category} ${i+1}`));
  }
  return games;
}

// Function to refresh cache if needed - FIXED VERSION
async function refreshCacheIfNeeded() {
  const currentTime = Date.now();
  
  // Check if we need to refresh the cache
  if (!gamesCache.lastUpdated || currentTime - gamesCache.lastUpdated > CACHE_EXPIRATION) {
    console.log('Refreshing game lists cache...');
    try {
      // Fetch all game lists in parallel
      const [featured, trending, topRated, newReleases, horrorGames] = await Promise.all([
        getFeaturedGame().catch(err => {
          console.error('Error fetching featured game:', err.message);
          return createMockGame('Featured');
        }),
        getTopSellingGames().catch(err => {
          console.error('Error fetching trending games:', err.message);
          return createMockGames(6, 'Top Seller');
        }),
        // For top rated, we'll get trending games and sort them
        getTopSellingGames().then(games => {
          return games ? [...games].sort((a, b) => b.rating - a.rating) : createMockGames(6, 'Top Rated');
        }).catch(err => {
          console.error('Error fetching top rated games:', err.message);
          return createMockGames(6, 'Top Rated');
        }),
        getNewReleases().catch(err => {
          console.error('Error fetching new releases:', err.message);
          return createMockGames(6, 'New Release');
        }),
        getHorrorGames().catch(err => {
          console.error('Error fetching horror games:', err.message);
          return createMockGames(6, 'Horror');
        })
      ]);
      
      // Update the cache
      gamesCache.featured = featured;
      gamesCache.trending = trending;
      gamesCache.topRated = topRated;
      gamesCache.newReleases = newReleases;
      gamesCache.horrorGames = horrorGames;
      gamesCache.lastUpdated = currentTime;
      
      console.log('Cache refresh complete');
    } catch (error) {
      console.error('Failed to refresh game lists cache:', error.message);
      
      // Set fallback data to ensure we always have something to display
      gamesCache.featured = gamesCache.featured || createMockGame('Featured');
      gamesCache.trending = gamesCache.trending || createMockGames(6, 'Top Seller');
      gamesCache.topRated = gamesCache.topRated || createMockGames(6, 'Top Rated');
      gamesCache.newReleases = gamesCache.newReleases || createMockGames(6, 'New Release');
      gamesCache.horrorGames = gamesCache.horrorGames || createMockGames(6, 'Horror');
      gamesCache.lastUpdated = currentTime;
    }
  } else {
    console.log('Cache is still fresh, skipping refresh');
  }
}

// API endpoint for featured game
app.get('/api/featured-game', async (req, res) => {
  try {
    await refreshCacheIfNeeded();
    
    if (gamesCache.featured) {
      console.log('Serving featured game from cache');
      res.json(gamesCache.featured);
    } else {
      console.log('No featured game in cache, fetching directly');
      const featuredGame = await getFeaturedGame();
      if (featuredGame) {
        res.json(featuredGame);
      } else {
        const mockGame = createMockGame('Featured');
        res.json(mockGame);
      }
    }
  } catch (error) {
    console.error('Error in /api/featured-game endpoint:', error.message);
    const mockGame = createMockGame('Featured');
    res.json(mockGame);
  }
});

// API endpoint for trending games
app.get('/api/trending-games', async (req, res) => {
  try {
    await refreshCacheIfNeeded();
    
    if (gamesCache.trending && gamesCache.trending.length > 0) {
      console.log('Serving trending games from cache');
      res.json(gamesCache.trending);
    } else {
      console.log('No trending games in cache, fetching directly');
      const trendingGames = await getTopSellingGames();
      if (trendingGames && trendingGames.length > 0) {
        res.json(trendingGames);
      } else {
        const mockGames = createMockGames(6, 'Top Seller');
        res.json(mockGames);
      }
    }
  } catch (error) {
    console.error('Error in /api/trending-games endpoint:', error.message);
    const mockGames = createMockGames(6, 'Top Seller');
    res.json(mockGames);
  }
});

// API endpoint for top rated games
app.get('/api/top-rated-games', async (req, res) => {
  try {
    await refreshCacheIfNeeded();
    
    if (gamesCache.topRated && gamesCache.topRated.length > 0) {
      console.log('Serving top rated games from cache');
      res.json(gamesCache.topRated);
    } else {
      console.log('No top rated games in cache, fetching directly');
      // Sort trending games by rating to get top rated
      const trendingGames = await getTopSellingGames();
      if (trendingGames && trendingGames.length > 0) {
        const topRated = [...trendingGames].sort((a, b) => b.rating - a.rating);
        res.json(topRated);
      } else {
        const mockGames = createMockGames(6, 'Top Rated');
        res.json(mockGames);
      }
    }
  } catch (error) {
    console.error('Error in /api/top-rated-games endpoint:', error.message);
    const mockGames = createMockGames(6, 'Top Rated');
    res.json(mockGames);
  }
});

// API endpoint for new releases
app.get('/api/new-releases', async (req, res) => {
  try {
    await refreshCacheIfNeeded();
    
    if (gamesCache.newReleases && gamesCache.newReleases.length > 0) {
      console.log('Serving new releases from cache');
      res.json(gamesCache.newReleases);
    } else {
      console.log('No new releases in cache, fetching directly');
      const newReleases = await getNewReleases();
      if (newReleases && newReleases.length > 0) {
        res.json(newReleases);
      } else {
        const mockGames = createMockGames(6, 'New Release');
        res.json(mockGames);
      }
    }
  } catch (error) {
    console.error('Error in /api/new-releases endpoint:', error.message);
    const mockGames = createMockGames(6, 'New Release');
    res.json(mockGames);
  }
});

// API endpoint for game details
app.get('/api/game/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    
    if (!gameId || isNaN(parseInt(gameId.replace(/\D/g, '')))) {
      return res.status(400).json({ error: 'Invalid game ID', message: 'Game ID must be a valid Steam app ID' });
    }
    
    console.log(`Fetching details for game ID: ${gameId}`);
    const gameDetails = await getGameDetails(gameId);
    
    if (gameDetails) {
      res.json(gameDetails);
    } else {
      // Create a mock game with the requested ID
      const mockGame = createMockGame('Game Details');
      mockGame.id = gameId;
      res.json(mockGame);
    }
  } catch (error) {
    console.error(`Error in /api/game/${req.params.gameId} endpoint:`, error.message);
    const mockGame = createMockGame('Game Details');
    mockGame.id = req.params.gameId;
    res.json(mockGame);
  }
});

// API endpoint for player count history
app.get('/api/player-count/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const period = req.query.period || '7d';
  
  // Generate simulated player count data
  // In a real implementation, you would use ISteamUserStats/GetNumberOfCurrentPlayers
  // and store historical data in a database
  const playerData = [];
  const today = new Date();
  let days = 7;
  
  if (period === '24h') {
    days = 1;
  } else if (period === '30d') {
    days = 30;
  } else if (period === 'all') {
    days = 365;
  }
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate a baseline count that's specific to this game ID
    // Use the game ID as a seed for the random number generator
    const gameIdNum = parseInt(gameId.replace(/\D/g, '')) || 12345;
    const basePlayers = (gameIdNum % 200000) + 50000;
    
    const dataPoint = {
      date: date.toISOString().split('T')[0],
      count: Math.floor(basePlayers + Math.random() * 50000)
    };
    
    playerData.push(dataPoint);
  }
  
  res.json(playerData.reverse());
});

// API endpoint for price history
app.get('/api/price-history/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  
  // In a real implementation, you would store historical pricing data in a database
  // and retrieve it here. Instead, we'll generate simulated data.
  const priceData = [];
  const today = new Date();
  
  // Set base price based on game ID to ensure it's consistent for the same game
  const gameIdNum = parseInt(gameId.replace(/\D/g, '')) || 12345;
  const basePrice = ((gameIdNum % 4) + 1) * 14.99;
  
  for (let i = 0; i < 365; i += 15) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    let price = basePrice;
    
    // Simulate sales
    if (i > 30 && i < 45) {
      price = basePrice * 0.8;
    } else if (i > 180 && i < 210) {
      price = basePrice * 0.7;
    } else if (i > 270 && i < 300) {
      price = basePrice * 0.5;
    }
    
    const dataPoint = {
      date: date.toISOString().split('T')[0],
      price: price.toFixed(2)
    };
    
    priceData.push(dataPoint);
  }
  
  res.json(priceData.reverse());
});

// API endpoint for horror games
app.get('/api/horror-games', async (req, res) => {
  try {
    await refreshCacheIfNeeded();
    
    if (gamesCache.horrorGames && gamesCache.horrorGames.length > 0) {
      console.log('Serving horror games from cache');
      res.json(gamesCache.horrorGames);
    } else {
      console.log('No horror games in cache, fetching directly');
      const horrorGames = await getHorrorGames();
      if (horrorGames && horrorGames.length > 0) {
        res.json(horrorGames);
      } else {
        const mockGames = createMockGames(6, 'Horror');
        res.json(mockGames);
      }
    }
  } catch (error) {
    console.error('Error in /api/horror-games endpoint:', error.message);
    const mockGames = createMockGames(6, 'Horror');
    res.json(mockGames);
  }
});

// API endpoint for searching games
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Invalid query', message: 'Search query must not be empty' });
    }
    
    console.log(`Searching for games with query: "${query}"`);
    
    // Refresh cache to ensure we have the latest data
    await refreshCacheIfNeeded();
    
    // Collect all games from different categories
    const allGames = [
      ...(gamesCache.trending || []),
      ...(gamesCache.topRated || []),
      ...(gamesCache.newReleases || []),
      ...(gamesCache.horrorGames || [])
    ];
    
    // Remove duplicates (games that appear in multiple categories)
    const uniqueGames = Array.from(new Map(allGames.map(game => [game.id, game])).values());
    
    // Filter games that match the search query
    const searchResults = uniqueGames.filter(game => {
      const title = game.title.toLowerCase();
      const description = (game.description || '').toLowerCase();
      const developer = (game.developer || '').toLowerCase();
      const publisher = (game.publisher || '').toLowerCase();
      const genres = (game.genres || []).join(' ').toLowerCase();
      const searchTerm = query.toLowerCase();
      
      return title.includes(searchTerm) || 
             description.includes(searchTerm) || 
             developer.includes(searchTerm) || 
             publisher.includes(searchTerm) || 
             genres.includes(searchTerm);
    });
    
    if (searchResults.length > 0) {
      res.json(searchResults);
    } else {
      // If no results found in our cache, create mock search results
      const mockResults = [];
      for (let i = 0; i < 3; i++) {
        const mockGame = createMockGame('Search Result');
        mockGame.title = `${query} - Game ${i+1}`;
        mockResults.push(mockGame);
      }
      res.json(mockResults);
    }
  } catch (error) {
    console.error(`Error in /api/search endpoint:`, error.message);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to search for games',
      details: error.message
    });
  }
});

// Initialize the cache when the server starts
refreshCacheIfNeeded().catch(err => {
  console.error('Error initializing game cache:', err.message);
  
  // Initialize with default values to prevent errors
  gamesCache.featured = createMockGame('Featured');
  gamesCache.trending = createMockGames(6, 'Top Seller');
  gamesCache.topRated = createMockGames(6, 'Top Rated');
  gamesCache.newReleases = createMockGames(6, 'New Release');
  gamesCache.horrorGames = createMockGames(6, 'Horror');
  gamesCache.lastUpdated = Date.now(); // Set the current time to prevent immediate retry
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  // Only try to send the index.html file if the build directory exists
  if (fs.existsSync(buildPath)) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    // If we're in development mode and the build directory doesn't exist
    res.status(200).send('Server is running in development mode. Frontend is served separately.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/featured-game`);
});