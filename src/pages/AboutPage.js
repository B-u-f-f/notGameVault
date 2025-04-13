import React from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css';
import { FaGamepad, FaListAlt, FaStar, FaUsers, FaChartLine, FaDatabase, FaGlobe, FaShieldAlt } from 'react-icons/fa';

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
          GameVault is dedicated to building the ultimate gaming platform that connects players with games they'll love. 
          We use real-time data from Steam to provide accurate, up-to-date information on thousands of games,
          making it easier for gamers to discover new titles, track price changes, and see what's popular in the community.
        </p>
        <p>
          Our goal is simple: create a centralized hub where gamers can explore the vast world of gaming without the noise
          and clutter. Whether you're looking for the latest releases, the best deals, or in-depth analytics on game performance,
          GameVault has you covered.
        </p>
      </section>

      <section className="about-features">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaGamepad className="feature-icon" />
            <h3>Extensive Game Library</h3>
            <p>Access detailed information on thousands of games from Steam's extensive catalog</p>
          </div>
          
          <div className="feature-card">
            <FaListAlt className="feature-icon" />
            <h3>Personalized Collections</h3>
            <p>Create and organize your own game collections with custom tags and categories</p>
          </div>
          
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Price History Tracking</h3>
            <p>Monitor price changes over time and get notified of sales on your wishlist items</p>
          </div>
          
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Player Statistics</h3>
            <p>Check real-time player counts and historical engagement data for any game</p>
          </div>
          
          <div className="feature-card">
            <FaGlobe className="feature-icon" />
            <h3>Community Features</h3>
            <p>Connect with other gamers, share tier lists, and discuss your favorite titles</p>
          </div>
          
          <div className="feature-card">
            <FaDatabase className="feature-icon" />
            <h3>Comprehensive API</h3>
            <p>Real-time data integration with Steam providing the most current game information</p>
          </div>
          
          <div className="feature-card">
            <FaStar className="feature-icon" />
            <h3>Curated Recommendations</h3>
            <p>Discover new games based on your preferences, play history, and community trends</p>
          </div>
          
          <div className="feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Secure Account System</h3>
            <p>Protect your collections and preferences with our secure user account system</p>
          </div>
        </div>
      </section>

      <section className="about-tech">
        <h2>Our Technology</h2>
        <p>
          GameVault is built using modern web technologies to ensure a fast, responsive experience for all users.
          Our frontend is developed with React.js, providing a smooth, app-like experience whether you're browsing
          on desktop or mobile.
        </p>
        <p>
          On the backend, we utilize Express.js to create a robust API that communicates with Steam's services,
          retrieving and processing game data in real-time. This allows us to present you with the most accurate
          and up-to-date information about game prices, player counts, and new releases.
        </p>
        <p>
          For data visualization, we implement Chart.js to create intuitive, interactive graphs that help you
          track price histories and player engagement over time. Our responsive design ensures that GameVault
          looks and works great on any device, from desktop computers to smartphones.
        </p>
      </section>

      <section className="about-team">
        <h2>The Team</h2>
        <p>
          GameVault was created by a small team of passionate gamers and developers who shared a common frustration:
          the lack of a comprehensive, user-friendly platform for tracking and discovering games across various platforms.
        </p>
        <p>
          Our diverse team brings together expertise in web development, UI/UX design, data analysis, and of course,
          gaming. This combination of skills allows us to build a platform that not only looks great but also provides
          valuable insights and features that gamers actually want.
        </p>
        <p>
          We're constantly working to improve GameVault based on user feedback and emerging technologies, ensuring
          that it remains the best resource for gamers everywhere.
        </p>
      </section>

      <section className="about-cta">
        <h2>Join Our Community</h2>
        <p>Ready to enhance your gaming experience?</p>
        <div className="cta-buttons">
          <Link to="/signup" className="btn-primary">Create an Account</Link>
          <Link to="/" className="btn-secondary">Explore Games</Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;