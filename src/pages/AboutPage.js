import React from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css';
import { FaGamepad, FaListAlt, FaStar, FaUsers, FaChartLine } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About GameVault</h1>
          <p>Your ultimate platform for discovering, tracking, and reviewing video games</p>
        </div>
      </section>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          At GameVault, we're passionate gamers on a mission to create the most comprehensive, 
          user-friendly gaming platform. We believe in the power of community, honest reviews, 
          and helping players find their next favorite game.
        </p>
      </section>

      <section className="about-features">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaGamepad className="feature-icon" />
            <h3>Game Discovery</h3>
            <p>Browse thousands of games across all platforms, genres, and release dates</p>
          </div>
          
          <div className="feature-card">
            <FaListAlt className="feature-icon" />
            <h3>Collection Tracking</h3>
            <p>Keep track of your library, wishlist, and currently playing games</p>
          </div>
          
          <div className="feature-card">
            <FaStar className="feature-icon" />
            <h3>User Reviews</h3>
            <p>Share your opinions and read trusted reviews from our community</p>
          </div>
          
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Community</h3>
            <p>Connect with other gamers, share tier lists, and discuss your favorite titles</p>
          </div>
          
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Personalized Recommendations</h3>
            <p>Discover new games based on your preferences and playing history</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          GameVault started as a passion project by a small team of gaming enthusiasts in 2023. 
          Frustrated with the limitations of existing gaming platforms, we set out to build something 
          better - a one-stop destination for everything gaming-related. What began as a simple 
          game tracking tool has evolved into a comprehensive platform serving thousands of gamers worldwide.
        </p>
      </section>

      <section className="about-cta">
        <h2>Join Our Community</h2>
        <p>Ready to enhance your gaming experience?</p>
        <div className="cta-buttons">
          <Link to="/signup" className="btn-primary">Create an Account</Link>
          <Link to="/games" className="btn-secondary">Explore Games</Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 