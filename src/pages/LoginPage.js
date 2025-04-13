import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaTwitter, FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './PageStyles.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [alertMessage, setAlertMessage] = useState(null);
  
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    if (error) {
      setAlertMessage(error);
      clearError();
    }
  }, [isAuthenticated, error, navigate, clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);
    
    // Validate form
    if (!formData.email.trim() || !formData.password) {
      setAlertMessage('Please enter both email and password');
      return;
    }
    
    // Login
    await login({
      email: formData.email,
      password: formData.password
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Log in to access your games, reviews, and more</p>
        </div>

        {alertMessage && (
          <div className="alert-message">
            {alertMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaUser className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-button">
            Log In
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button type="button" className="social-btn google">
              <FaGoogle /> Sign in with Google
            </button>
            <button type="button" className="social-btn facebook">
              <FaFacebook /> Sign in with Facebook
            </button>
            <button type="button" className="social-btn twitter">
              <FaTwitter /> Sign in with Twitter
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;