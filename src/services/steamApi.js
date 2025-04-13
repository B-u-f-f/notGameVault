// Define API base URL to automatically detect server port
// In production, this should be your server's domain
const getApiBaseUrl = () => {
  // Use the absolute URL to the server
  return 'http://localhost:4560/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('Using API base URL:', API_BASE_URL);


// Fetch with timeout and retry helper
const fetchWithRetry = async (url, options = {}, timeout = 5000, retries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      console.log(`Retry attempt ${attempt}/${retries} for ${url}`);
      // Add exponential backoff delay for retries
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
    
    try {
      const controller = new AbortController();
      const { signal } = controller;
      
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { ...options, signal });
      clearTimeout(timeoutId);
      
      // On success, return the response
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1}/${retries + 1} failed for ${url}:`, error.message);
    }
  }
  
  // If we exhausted all retries, throw the last error
  throw lastError;
};

// Helper function to safely parse JSON
const safeJsonParse = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw new Error('Invalid JSON response from server');
  }
};

/**
 * Service to fetch game data from Steam API (proxied through backend)
 */
const SteamApiService = {
  /**
   * Fetch a featured game
   * @returns {Promise} Promise object with featured game data
   */
  getFeaturedGame: async () => {
    try {
      console.log('Fetching featured game');
      const response = await fetchWithRetry(`${API_BASE_URL}/featured-game`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error('Error fetching featured game:', error.message);
      throw error;
    }
  },

  /**
   * Fetch trending games
   * @returns {Promise} Promise object with trending games data
   */
  getTrendingGames: async () => {
    try {
      console.log('Fetching trending games');
      const response = await fetchWithRetry(`${API_BASE_URL}/trending-games`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error('Error fetching trending games:', error.message);
      throw error;
    }
  },

  /**
   * Fetch top rated games
   * @returns {Promise} Promise object with top rated games data
   */
  getTopRatedGames: async () => {
    try {
      console.log('Fetching top rated games');
      const response = await fetchWithRetry(`${API_BASE_URL}/top-rated-games`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error('Error fetching top rated games:', error.message);
      throw error;
    }
  },

  /**
   * Fetch new releases
   * @returns {Promise} Promise object with new releases data
   */
  getNewReleases: async () => {
    try {
      console.log('Fetching new releases');
      const response = await fetchWithRetry(`${API_BASE_URL}/new-releases`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error('Error fetching new releases:', error.message);
      throw error;
    }
  },

  /**
   * Fetch game details by app ID
   * @param {string} gameId - The Steam app ID
   * @returns {Promise} Promise object with game details
   */
  getGameDetails: async (gameId) => {
    try {
      console.log(`Fetching game details for ID: ${gameId}`);
      const response = await fetchWithRetry(`${API_BASE_URL}/game/${gameId}`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error(`Error fetching game details for ${gameId}:`, error.message);
      throw error;
    }
  },

  /**
   * Fetch player count history for a game
   * @param {string} gameId - The Steam app ID
   * @param {string} period - Time period ('24h', '7d', '30d', 'all')
   * @returns {Promise} Promise object with player count history data
   */
  getPlayerCountHistory: async (gameId, period = '7d') => {
    try {
      console.log(`Fetching player count history for game ${gameId}, period: ${period}`);
      const response = await fetchWithRetry(`${API_BASE_URL}/player-count/${gameId}?period=${period}`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error(`Error fetching player count history for ${gameId}:`, error.message);
      throw error;
    }
  },

  /**
   * Fetch price history for a game
   * @param {string} gameId - The Steam app ID
   * @returns {Promise} Promise object with price history data
   */
  getPriceHistory: async (gameId) => {
    try {
      console.log(`Fetching price history for game ${gameId}`);
      const response = await fetchWithRetry(`${API_BASE_URL}/price-history/${gameId}`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error(`Error fetching price history for ${gameId}:`, error.message);
      throw error;
    }
  },

  /**
   * Search for games
   * @param {string} query - Search query
   * @returns {Promise} Promise object with search results
   */
  searchGames: async (query) => {
    try {
      console.log(`Searching for games with query: "${query}"`);
      const response = await fetchWithRetry(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || 'Network response was not ok';
        console.error('Server error response:', errorData);
        throw new Error(errorMsg);
      }
      
      return await safeJsonParse(response);
    } catch (error) {
      console.error(`Error searching for games with query "${query}":`, error.message);
      throw error;
    }
  }
};

export default SteamApiService;