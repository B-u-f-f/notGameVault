import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaTimes, FaSearch, FaPen, FaPalette, FaSave, FaCog } from 'react-icons/fa';
import SteamApiService from '../services/steamApi';
import { useTierLists } from '../context/TierListsContext';
import './PageStyles.css';

const TierListEditorPage = () => {
  const { id } = useParams(); // For editing existing tier list
  const navigate = useNavigate();
  const { createTierList, updateTierList, getTierList, currentTierList, loading, error } = useTierLists();
  
  // Tier list state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tiers, setTiers] = useState([
    { name: 'S', color: '#ff7675', games: [] },
    { name: 'A', color: '#fdcb6e', games: [] },
    { name: 'B', color: '#74b9ff', games: [] },
    { name: 'C', color: '#55efc4', games: [] },
    { name: 'D', color: '#a29bfe', games: [] },
    { name: 'F', color: '#636e72', games: [] }
  ]);
  
  // Search and unassigned games
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [unassignedGames, setUnassignedGames] = useState([]);
  
  // Tier editing state
  const [editingTier, setEditingTier] = useState(null);
  const [showTierEditor, setShowTierEditor] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierColor, setNewTierColor] = useState('#8a66ff');
  
  // Load existing tier list if editing
  useEffect(() => {
    const loadTierList = async () => {
      if (id) {
        const tierList = await getTierList(id);
        if (tierList) {
          setTitle(tierList.title);
          setDescription(tierList.description || '');
          setIsPublic(tierList.isPublic);
          setTiers(tierList.tiers);
        }
      }
    };
    
    loadTierList();
  }, [id, getTierList]);
  
  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search for games
  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await SteamApiService.searchGames(searchQuery);
      // Filter out games that are already in tiers or unassigned
      const existingGameIds = [
        ...unassignedGames.map(game => game.gameId),
        ...tiers.flatMap(tier => tier.games.map(game => game.gameId))
      ];
      
      const filteredResults = results
        .filter(game => !existingGameIds.includes(game.id))
        .map(game => ({
          gameId: game.id,
          title: game.title,
          cover: game.cover,
          year: game.year
        }));
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add game to unassigned section
  const addGameToUnassigned = (game) => {
    setUnassignedGames(prev => [...prev, game]);
    setSearchResults(prev => prev.filter(g => g.gameId !== game.gameId));
    setSearchQuery('');
  };

  // Remove game from anywhere
  const removeGame = (gameId) => {
    // Check unassigned games
    if (unassignedGames.some(game => game.gameId === gameId)) {
      setUnassignedGames(prev => prev.filter(game => game.gameId !== gameId));
      return;
    }
    
    // Check tiers
    const updatedTiers = tiers.map(tier => ({
      ...tier,
      games: tier.games.filter(game => game.gameId !== gameId)
    }));
    
    setTiers(updatedTiers);
  };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Moving within unassigned
    if (source.droppableId === 'unassigned' && destination.droppableId === 'unassigned') {
      const newUnassigned = [...unassignedGames];
      const [movedGame] = newUnassigned.splice(source.index, 1);
      newUnassigned.splice(destination.index, 0, movedGame);
      setUnassignedGames(newUnassigned);
      return;
    }
    
    // Moving from unassigned to a tier
    if (source.droppableId === 'unassigned') {
      const newUnassigned = [...unassignedGames];
      const [movedGame] = newUnassigned.splice(source.index, 1);
      setUnassignedGames(newUnassigned);
      
      const tierIndex = tiers.findIndex(tier => `tier-${tier.name}` === destination.droppableId);
      if (tierIndex > -1) {
        const newTiers = [...tiers];
        newTiers[tierIndex].games.splice(destination.index, 0, movedGame);
        setTiers(newTiers);
      }
      return;
    }
    
    // Moving from a tier to unassigned
    if (destination.droppableId === 'unassigned') {
      const sourceTierIndex = tiers.findIndex(tier => `tier-${tier.name}` === source.droppableId);
      if (sourceTierIndex > -1) {
        const newTiers = [...tiers];
        const [movedGame] = newTiers[sourceTierIndex].games.splice(source.index, 1);
        setTiers(newTiers);
        
        setUnassignedGames([...unassignedGames, movedGame]);
      }
      return;
    }
    
    // Moving between tiers
    const sourceTierIndex = tiers.findIndex(tier => `tier-${tier.name}` === source.droppableId);
    const destinationTierIndex = tiers.findIndex(tier => `tier-${tier.name}` === destination.droppableId);
    
    if (sourceTierIndex > -1 && destinationTierIndex > -1) {
      const newTiers = [...tiers];
      const [movedGame] = newTiers[sourceTierIndex].games.splice(source.index, 1);
      newTiers[destinationTierIndex].games.splice(destination.index, 0, movedGame);
      setTiers(newTiers);
    }
  };

  // Add new tier
  const addNewTier = () => {
    setEditingTier(null);
    setNewTierName('');
    setNewTierColor('#8a66ff');
    setShowTierEditor(true);
  };

  // Edit existing tier
  const openTierEditor = (tierIndex) => {
    const tier = tiers[tierIndex];
    setEditingTier(tierIndex);
    setNewTierName(tier.name);
    setNewTierColor(tier.color);
    setShowTierEditor(true);
  };

  // Save tier changes
  const saveTierChanges = () => {
    if (!newTierName.trim()) return;
    
    if (editingTier !== null) {
      // Update existing tier
      const newTiers = [...tiers];
      newTiers[editingTier] = {
        ...newTiers[editingTier],
        name: newTierName,
        color: newTierColor
      };
      setTiers(newTiers);
    } else {
      // Add new tier
      setTiers([
        ...tiers,
        { name: newTierName, color: newTierColor, games: [] }
      ]);
    }
    
    setShowTierEditor(false);
  };

  // Delete tier
  const deleteTier = (tierIndex) => {
    if (window.confirm('Are you sure you want to delete this tier? Games in this tier will be moved to unassigned.')) {
      const tierToDelete = tiers[tierIndex];
      
      // Move games to unassigned
      setUnassignedGames([...unassignedGames, ...tierToDelete.games]);
      
      // Remove tier
      const newTiers = tiers.filter((_, index) => index !== tierIndex);
      setTiers(newTiers);
    }
  };

  // Save tier list
  const saveTierList = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your tier list');
      return;
    }
    
    const tierListData = {
      title,
      description,
      isPublic,
      tiers
    };
    
    try {
      if (id) {
        // Update existing tier list
        const updated = await updateTierList(id, tierListData);
        if (updated) {
          navigate(`/tiers/${id}`);
        }
      } else {
        // Create new tier list
        const created = await createTierList(tierListData);
        if (created) {
          navigate(`/tiers/${created._id}`);
        }
      }
    } catch (error) {
      console.error('Error saving tier list:', error);
      alert('Failed to save tier list. Please try again.');
    }
  };

  if (loading && id) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tier list...</p>
      </div>
    );
  }

  if (error && id) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate('/tiers')}>
          Back to Tier Lists
        </button>
      </div>
    );
  }

  return (
    <div className="tierlist-editor-page">
      <div className="tierlist-editor-header">
        <div className="tierlist-metadata">
          <input
            type="text"
            className="tierlist-title-input"
            placeholder="Enter Tier List Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="tierlist-description-input"
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="tierlist-privacy-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <span className="toggle-text">{isPublic ? 'Public' : 'Private'}</span>
            </label>
          </div>
        </div>
        
        <div className="tierlist-editor-actions">
          <button className="add-tier-btn" onClick={addNewTier}>
            <FaPlus /> Add Tier
          </button>
          <button className="save-tierlist-btn" onClick={saveTierList}>
            <FaSave /> Save Tier List
          </button>
        </div>
      </div>
      
      <div className="tierlist-editor-content">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="tierlist-tiers">
            {tiers.map((tier, tierIndex) => (
              <Droppable droppableId={`tier-${tier.name}`} key={`tier-${tierIndex}`}>
                {(provided) => (
                  <div className="tier-row" ref={provided.innerRef} {...provided.droppableProps}>
                    <div 
                      className="tier-label" 
                      style={{ backgroundColor: tier.color }}
                    >
                      <span>{tier.name}</span>
                      <div className="tier-actions">
                        <button 
                          className="edit-tier-btn"
                          onClick={() => openTierEditor(tierIndex)}
                        >
                          <FaPen />
                        </button>
                        <button 
                          className="delete-tier-btn"
                          onClick={() => deleteTier(tierIndex)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                    <div className="tier-games">
                      {tier.games.map((game, gameIndex) => (
                        <Draggable 
                          key={game.gameId} 
                          draggableId={game.gameId} 
                          index={gameIndex}
                        >
                          {(provided) => (
                            <div
                              className="tierlist-game-card"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <img 
                                src={game.cover} 
                                alt={game.title} 
                                className="tierlist-game-image"
                              />
                              <div className="tierlist-game-title">{game.title}</div>
                              <button 
                                className="remove-game-btn"
                                onClick={() => removeGame(game.gameId)}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
          
          <div className="tierlist-sidebar">
            <div className="game-search">
              <h3>Search Games</h3>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search for games to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="game-search-input"
                />
                <FaSearch className={`search-icon ${isSearching ? 'searching' : ''}`} />
              </div>
              
              <div className="search-results">
                {isSearching ? (
                  <div className="searching-indicator">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(game => (
                    <div 
                      key={game.gameId} 
                      className="search-result-item"
                      onClick={() => addGameToUnassigned(game)}
                    >
                      <img 
                        src={game.cover} 
                        alt={game.title} 
                        className="result-image"
                      />
                      <div className="result-info">
                        <h4>{game.title}</h4>
                        <p>{game.year}</p>
                      </div>
                      <button className="add-game-btn">
                        <FaPlus />
                      </button>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="no-results">No games found</div>
                ) : (
                  <div className="search-placeholder">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            </div>
            
            <div className="unassigned-games">
              <h3>Unassigned Games</h3>
              <Droppable droppableId="unassigned">
                {(provided) => (
                  <div 
                    className="unassigned-games-container"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {unassignedGames.length > 0 ? (
                      unassignedGames.map((game, index) => (
                        <Draggable 
                          key={game.gameId} 
                          draggableId={game.gameId} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="unassigned-game-card"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <img 
                                src={game.cover} 
                                alt={game.title} 
                                className="unassigned-game-image"
                              />
                              <div className="unassigned-game-title">{game.title}</div>
                              <button 
                                className="remove-game-btn"
                                onClick={() => removeGame(game.gameId)}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="no-unassigned-games">
                        Search for games to add, or drag games here from tiers
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>
      
      {showTierEditor && (
        <div className="tier-editor-modal">
          <div className="tier-editor-content">
            <h3>{editingTier !== null ? 'Edit Tier' : 'Add New Tier'}</h3>
            
            <div className="tier-editor-form">
              <div className="form-group">
                <label>Tier Name</label>
                <input
                  type="text"
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value)}
                  placeholder="S, A, B, etc."
                  className="tier-name-input"
                  maxLength={3}
                />
              </div>
              
              <div className="form-group">
                <label>Tier Color</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={newTierColor}
                    onChange={(e) => setNewTierColor(e.target.value)}
                    className="color-input"
                  />
                  <FaPalette className="color-icon" />
                </div>
              </div>
              
              <div className="tier-editor-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowTierEditor(false)}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={saveTierChanges}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierListEditorPage;