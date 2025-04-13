import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

// Create context
export const AuthContext = createContext(initialState);

// Action types
const SET_LOADING = 'SET_LOADING';
const USER_LOADED = 'USER_LOADED';
const AUTH_ERROR = 'AUTH_ERROR';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
const REGISTER_FAIL = 'REGISTER_FAIL';
const LOGOUT = 'LOGOUT';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: true
      };
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case REGISTER_FAIL:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
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

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios instance with auth token
  useEffect(() => {
    const setAuthToken = token => {
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
      } else {
        delete axios.defaults.headers.common['x-auth-token'];
      }
    };
    
    if (state.token) {
      setAuthToken(state.token);
      loadUser();
    }
    
    // Cleanup function
    return () => {
      setAuthToken(null);
    };
  }, [state.token]);

  // Load user
  const loadUser = async () => {
    dispatch({ type: SET_LOADING });
    
    try {
      const res = await axios.get('/api/auth/user');
      
      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response && err.response.data.message 
          ? err.response.data.message 
          : 'Server error'
      });
    }
  };

  // Register user
  const register = async formData => {
    dispatch({ type: SET_LOADING });
    
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });
      
      loadUser();
    } catch (err) {
      console.error('Register error:', err.response?.data);
      
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response && err.response.data.message 
          ? err.response.data.message 
          : 'Registration failed'
      });
    }
  };

  // Login user
  const login = async formData => {
    dispatch({ type: SET_LOADING });
    
    try {
      const res = await axios.post('/api/auth/login', formData);
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });
      
      loadUser();
    } catch (err) {
      console.error('Login error:', err.response?.data);
      
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response && err.response.data.message 
          ? err.response.data.message 
          : 'Login failed'
      });
    }
  };

  // Logout
  const logout = () => dispatch({ type: LOGOUT });

  // Clear errors
  const clearError = () => dispatch({ type: CLEAR_ERROR });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        clearError,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};