const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/favorites
// @desc    Get user favorites
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favorites');
    res.json(user.favorites);
  } catch (error) {
    console.error('Get favorites error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/favorites
// @desc    Add a game to favorites
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { gameId, title, cover, year, rating } = req.body;
    
    // Check if game is already in favorites
    const user = await User.findById(req.user.id);
    const existingFavorite = user.favorites.find(fav => fav.gameId === gameId);
    
    if (existingFavorite) {
      return res.status(400).json({ message: 'Game already in favorites' });
    }
    
    // Add to favorites
    user.favorites.push({ gameId, title, cover, year, rating });
    await user.save();
    
    res.json(user.favorites);
  } catch (error) {
    console.error('Add favorite error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/favorites/:gameId
// @desc    Remove a game from favorites
// @access  Private
router.delete('/:gameId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Remove game from favorites
    user.favorites = user.favorites.filter(fav => fav.gameId !== req.params.gameId);
    await user.save();
    
    res.json(user.favorites);
  } catch (error) {
    console.error('Remove favorite error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;