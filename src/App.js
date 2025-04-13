import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GameCarousel from './components/GameCarousel';
import Footer from './components/Footer';
import HomePage from './pages/HomePage.js';
import TierListsPage from './pages/TierListsPage.js';
import AboutPage from './pages/AboutPage.js';
import LoginPage from './pages/LoginPage.js';
import SignupPage from './pages/SignupPage.js';
import GameDetailPage from './pages/GameDetailPage.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tiers" element={<TierListsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/game/:gameId" element={<GameDetailPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 