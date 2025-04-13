const express = require('express');
const router = express.Router();
const TierList = require('../models/TierList');
const auth = require('../middleware/auth');

// @route   GET /api/tierlists
// @desc    Get public tier lists or user's tier lists
// @access  Public/Private
router.get('/', async (req, res) => {
  try {
    let filter = { isPublic: true };
    
    // If authenticated and requesting my tier lists
    if (req.query.my === 'true' && req.headers['x-auth-token']) {
      try {
        const decoded = jwt.verify(req.headers['x-auth-token'], process.env.JWT_SECRET);
        filter = { user: decoded.userId };
      } catch (err) {
        // Invalid token - just return public lists
        console.log('Invalid token when fetching tier lists');
      }
    }
    
    const tierLists = await TierList.find(filter)
      .sort({ updatedAt: -1 })
      .populate('user', 'username')
      .limit(12);
    
    res.json(tierLists);
  } catch (error) {
    console.error('Get tier lists error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tierlists/:id
// @desc    Get a tier list by ID
// @access  Public/Private (depending on list privacy)
router.get('/:id', async (req, res) => {
  try {
    const tierList = await TierList.findById(req.params.id)
      .populate('user', 'username');
    
    if (!tierList) {
      return res.status(404).json({ message: 'Tier list not found' });
    }
    
    // Check if tier list is private and belongs to the requesting user
    if (!tierList.isPublic) {
      // If no token, deny access
      if (!req.headers['x-auth-token']) {
        return res.status(401).json({ message: 'Not authorized to view this tier list' });
      }
      
      try {
        const decoded = jwt.verify(req.headers['x-auth-token'], process.env.JWT_SECRET);
        if (tierList.user.toString() !== decoded.userId) {
          return res.status(401).json({ message: 'Not authorized to view this tier list' });
        }
      } catch (err) {
        return res.status(401).json({ message: 'Not authorized to view this tier list' });
      }
    }
    
    res.json(tierList);
  } catch (error) {
    console.error('Get tier list error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tierlists
// @desc    Create a new tier list
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tiers, isPublic } = req.body;
    
    // Create new tier list
    const newTierList = new TierList({
      title,
      description,
      user: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true,
      tiers: tiers || [
        { name: 'S', color: '#ff7675', games: [] },
        { name: 'A', color: '#fdcb6e', games: [] },
        { name: 'B', color: '#74b9ff', games: [] },
        { name: 'C', color: '#55efc4', games: [] },
        { name: 'D', color: '#a29bfe', games: [] },
        { name: 'F', color: '#636e72', games: [] }
      ]
    });
    
    const tierList = await newTierList.save();
    
    res.json(tierList);
  } catch (error) {
    console.error('Create tier list error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tierlists/:id
// @desc    Update a tier list
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tiers, isPublic } = req.body;
    
    // Find tier list
    let tierList = await TierList.findById(req.params.id);
    
    if (!tierList) {
      return res.status(404).json({ message: 'Tier list not found' });
    }
    
    // Check if tier list belongs to user
    if (tierList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this tier list' });
    }
    
    // Update tier list fields
    tierList.title = title || tierList.title;
    tierList.description = description !== undefined ? description : tierList.description;
    tierList.tiers = tiers || tierList.tiers;
    tierList.isPublic = isPublic !== undefined ? isPublic : tierList.isPublic;
    
    await tierList.save();
    
    res.json(tierList);
  } catch (error) {
    console.error('Update tier list error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tierlists/:id
// @desc    Delete a tier list
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find tier list
    const tierList = await TierList.findById(req.params.id);
    
    if (!tierList) {
      return res.status(404).json({ message: 'Tier list not found' });
    }
    
    // Check if tier list belongs to user
    if (tierList.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this tier list' });
    }
    
    await tierList.remove();
    
    res.json({ message: 'Tier list removed' });
  } catch (error) {
    console.error('Delete tier list error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tierlists/:id/like
// @desc    Like a tier list
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    // Find tier list
    const tierList = await TierList.findById(req.params.id);
    
    if (!tierList) {
      return res.status(404).json({ message: 'Tier list not found' });
    }
    
    // Increment likes
    tierList.likes += 1;
    await tierList.save();
    
    res.json({ likes: tierList.likes });
  } catch (error) {
    console.error('Like tier list error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;