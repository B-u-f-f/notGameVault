// src/context/FavoritesContext.js
import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  favorites: [],
  loading: true,
  error: null
};

// Create context
export const FavoritesContext = createContext(initialState);

// Action types
const GET_FAVORITES = 'GET_FAVORITES';
const ADD_FAVORITE = 'ADD_FAVORITE';
const REMOVE_FAVORITE = 'REMOVE_FAVORITE';
const FAVORITES_ERROR = 'FAVORITES_ERROR';
const SET_LOADING = 'SET_LOADING';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: true
      };
    case GET_FAVORITES:
      return {
        ...state,
        favorites: action.payload,
        loading: false,
        error: null
      };
    case ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
        loading: false,
        error: null
      };
    case REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(
          favorite => favorite.gameId !== action.payload
        ),
        loading: false
      };
    case FAVORITES_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create provider component
export const FavoritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getFavorites();
    } else {
      // If not authenticated, clear favorites
      dispatch({
        type: GET_FAVORITES,
        payload: []
      });
    }
  }, [isAuthenticated]);

  // Get all favorites
  const getFavorites = async () => {
    dispatch({ type: SET_LOADING });

    try {
      const res = await axios.get('/api/favorites');

      dispatch({
        type: GET_FAVORITES,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FAVORITES_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error loading favorites'
      });
    }
  };

  // Add favorite
  const addFavorite = async game => {
    dispatch({ type: SET_LOADING });

    try {
      const res = await axios.post('/api/favorites', {
        gameId: game.id,
        title: game.title,
        cover: game.cover,
        year: game.year,
        rating: game.rating
      });

      dispatch({
        type: GET_FAVORITES, // Update with full list to ensure syncing
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FAVORITES_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error adding favorite'
      });
    }
  };

  // Remove favorite
  const removeFavorite = async gameId => {
    dispatch({ type: SET_LOADING });
    
    try {
      const res = await axios.delete(`/api/favorites/${gameId}`);

      dispatch({
        type: GET_FAVORITES, // Update with full list to ensure syncing
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FAVORITES_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error removing favorite'
      });
    }
  };

  // Check if a game is in favorites
  const isFavorite = gameId => {
    return state.favorites.some(favorite => favorite.gameId === gameId);
  };

  // Clear error
  const clearError = () => dispatch({ type: CLEAR_ERROR });

  return (
    <FavoritesContext.Provider
      value={{
        favorites: state.favorites,
        loading: state.loading,
        error: state.error,
        getFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearError
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook to use favorites context
export const useFavorites = () => {
  const context = React.useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};