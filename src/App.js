import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TierListsPage from './pages/TierListsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import GameDetailPage from './pages/GameDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
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
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;