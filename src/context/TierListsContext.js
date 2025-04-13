// src/context/TierListsContext.js
import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  tierLists: [],
  userTierLists: [],
  currentTierList: null,
  loading: true,
  error: null
};

// Create context
export const TierListsContext = createContext(initialState);

// Action types
const GET_TIER_LISTS = 'GET_TIER_LISTS';
const GET_USER_TIER_LISTS = 'GET_USER_TIER_LISTS';
const GET_TIER_LIST = 'GET_TIER_LIST';
const CREATE_TIER_LIST = 'CREATE_TIER_LIST';
const UPDATE_TIER_LIST = 'UPDATE_TIER_LIST';
const DELETE_TIER_LIST = 'DELETE_TIER_LIST';
const LIKE_TIER_LIST = 'LIKE_TIER_LIST';
const TIER_LISTS_ERROR = 'TIER_LISTS_ERROR';
const SET_LOADING = 'SET_LOADING';
const CLEAR_ERROR = 'CLEAR_ERROR';
const CLEAR_CURRENT = 'CLEAR_CURRENT';

// Reducer
const tierListsReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: true
      };
    case GET_TIER_LISTS:
      return {
        ...state,
        tierLists: action.payload,
        loading: false,
        error: null
      };
    case GET_USER_TIER_LISTS:
      return {
        ...state,
        userTierLists: action.payload,
        loading: false,
        error: null
      };
    case GET_TIER_LIST:
      return {
        ...state,
        currentTierList: action.payload,
        loading: false,
        error: null
      };
    case CREATE_TIER_LIST:
      return {
        ...state,
        userTierLists: [...state.userTierLists, action.payload],
        currentTierList: action.payload,
        loading: false,
        error: null
      };
    case UPDATE_TIER_LIST:
      return {
        ...state,
        userTierLists: state.userTierLists.map(tierList =>
          tierList._id === action.payload._id ? action.payload : tierList
        ),
        currentTierList: action.payload,
        loading: false,
        error: null
      };
    case DELETE_TIER_LIST:
      return {
        ...state,
        userTierLists: state.userTierLists.filter(
          tierList => tierList._id !== action.payload
        ),
        loading: false,
        error: null
      };
    case LIKE_TIER_LIST:
      return {
        ...state,
        tierLists: state.tierLists.map(tierList =>
          tierList._id === action.payload.id 
            ? { ...tierList, likes: action.payload.likes }
            : tierList
        ),
        loading: false,
        error: null
      };
    case TIER_LISTS_ERROR:
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
    case CLEAR_CURRENT:
      return {
        ...state,
        currentTierList: null
      };
    default:
      return state;
  }
};

// Create provider component
export const TierListsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tierListsReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load public tier lists on mount
  useEffect(() => {
    getPublicTierLists();

    // Load user tier lists if authenticated
    if (isAuthenticated) {
      getUserTierLists();
    }
  }, [isAuthenticated]);

  // Get public tier lists
  const getPublicTierLists = async () => {
    dispatch({ type: SET_LOADING });

    try {
      const res = await axios.get('/api/tierlists');

      dispatch({
        type: GET_TIER_LISTS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: TIER_LISTS_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error loading tier lists'
      });
    }
  };

  // Get user's tier lists
  const getUserTierLists = async () => {
    dispatch({ type: SET_LOADING });

    try {
      const res = await axios.get('/api/tierlists?my=true');

      dispatch({
        type: GET_USER_TIER_LISTS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: TIER_LISTS_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error loading your tier lists'
      });
    }
  };

  // Get single tier list
  const getTierList = async id => {
    dispatch({ type: SET_LOADING });

    try {
      const res = await axios.get(`/api/tierlists/${id}`);

      dispatch({
        type: GET_TIER_LIST,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: TIER_LISTS_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error loading tier list'
      });
      return null;
    }
  };

  // Create new tier list
  const createTierList = async tierListData => {
    dispatch({ type: SET_LOADING });

    try {
      const res = await axios.post('/api/tierlists', tierListData);

      dispatch({
        type: CREATE_TIER_LIST,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: TIER_LISTS_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error creating tier list'
      });
      return null;
    }
  };

  // Update tier list
  const updateTierList = async (id, tierListData) => {
    dispatch({ type: SET_LOADING });

    try {
      const res = await axios.put(`/api/tierlists/${id}`, tierListData);

      dispatch({
        type: UPDATE_TIER_LIST,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: TIER_LISTS_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error updating tier list'
      });
      return null;
    }
  };

  // Delete tier list
  const deleteTierList = async id => {
    dispatch({ type: SET_LOADING });

    try {
      await axios.delete(`/api/tierlists/${id}`);

      dispatch({
        type: DELETE_TIER_LIST,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: TIER_LISTS_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error deleting tier list'
      });
    }
  };

  // Like tier list
  const likeTierList = async id => {
    try {
      const res = await axios.post(`/api/tierlists/${id}/like`);

      dispatch({
        type: LIKE_TIER_LIST,
        payload: { id, likes: res.data.likes }
      });
    } catch (err) {
      dispatch({
        type: TIER_LISTS_ERROR,
        payload: err.response && err.response.data.message
          ? err.response.data.message
          : 'Error liking tier list'
      });
    }
  };

  // Clear current tier list
  const clearCurrent = () => dispatch({ type: CLEAR_CURRENT });

  // Clear error
  const clearError = () => dispatch({ type: CLEAR_ERROR });

  return (
    <TierListsContext.Provider
      value={{
        tierLists: state.tierLists,
        userTierLists: state.userTierLists,
        currentTierList: state.currentTierList,
        loading: state.loading,
        error: state.error,
        getPublicTierLists,
        getUserTierLists,
        getTierList,
        createTierList,
        updateTierList,
        deleteTierList,
        likeTierList,
        clearCurrent,
        clearError
      }}
    >
      {children}
    </TierListsContext.Provider>
  );
};

// Hook to use tier lists context
export const useTierLists = () => {
  const context = React.useContext(TierListsContext);
  if (context === undefined) {
    throw new Error('useTierLists must be used within a TierListsProvider');
  }
  return context;
};