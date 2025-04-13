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
import TierListDetailPage from './pages/TierListDetailPage';
import TierListEditorPage from './pages/TierListEditorPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { TierListsProvider } from './context/TierListsContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <TierListsProvider>
          <Router>
            <div className="app">
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tiers" element={<TierListsPage />} />
                <Route path="/tiers/:id" element={<TierListDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/game/:gameId" element={<GameDetailPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } />
                <Route path="/tiers/create" element={
                  <PrivateRoute>
                    <TierListEditorPage />
                  </PrivateRoute>
                } />
                <Route path="/tiers/edit/:id" element={
                  <PrivateRoute>
                    <TierListEditorPage />
                  </PrivateRoute>
                } />
              </Routes>
              <Footer />
            </div>
          </Router>
        </TierListsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;