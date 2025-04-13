import React, { useState } from 'react';
import './PageStyles.css';
import { FaArrowUp, FaArrowDown, FaTrophy, FaPlus } from 'react-icons/fa';

const TierListPage = () => {
  const [activeTier, setActiveTier] = useState('community');
  
  // Sample tier list data - in a real app this would come from an API
  const tierLists = {
    community: [
      {
        id: 1,
        title: "Best RPGs of All Time",
        author: "GameMaster42",
        likes: 1243,
        categories: ["RPG"],
        thumbnail: "https://via.placeholder.com/150",
      },
      {
        id: 2,
        title: "Top Fighting Games 2023",
        author: "FGCLegend",
        likes: 952,
        categories: ["Fighting"],
        thumbnail: "https://via.placeholder.com/150",
      },
      {
        id: 3,
        title: "Souls-like Games Ranked",
        author: "DarkSoulsFan",
        likes: 876,
        categories: ["Action", "RPG"],
        thumbnail: "https://via.placeholder.com/150",
      },
      {
        id: 4,
        title: "Nintendo Switch Must-Plays",
        author: "NintendoPro",
        likes: 724,
        categories: ["Nintendo", "Various"],
        thumbnail: "https://via.placeholder.com/150",
      },
    ],
    personal: [
      {
        id: 5,
        title: "My Favorite JRPGs",
        author: "You",
        lastEdited: "2 days ago",
        categories: ["JRPG"],
        thumbnail: "https://via.placeholder.com/150",
      },
      {
        id: 6,
        title: "FPS Games Ranked",
        author: "You",
        lastEdited: "1 week ago",
        categories: ["FPS"],
        thumbnail: "https://via.placeholder.com/150",
      },
    ]
  };

  return (
    <div className="tierlist-container">
      <section className="tierlist-hero">
        <div className="tierlist-hero-content">
          <h1>Game Tier Lists</h1>
          <p>Create, share, and discover game rankings from the community</p>
          <button className="create-tierlist-btn">
            <FaPlus /> Create New Tier List
          </button>
        </div>
      </section>

      <section className="tierlist-tabs">
        <button 
          className={`tab-btn ${activeTier === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTier('community')}
        >
          Community Tier Lists
        </button>
        <button 
          className={`tab-btn ${activeTier === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTier('personal')}
        >
          My Tier Lists
        </button>
      </section>

      <section className="tierlist-filters">
        <div className="filter-group">
          <label>Sort by:</label>
          <select className="filter-select">
            <option>Most Popular</option>
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Category:</label>
          <select className="filter-select">
            <option>All Categories</option>
            <option>RPG</option>
            <option>FPS</option>
            <option>Strategy</option>
            <option>Fighting</option>
            <option>Platform</option>
          </select>
        </div>
      </section>

      <section className="tierlist-grid">
        {activeTier === 'community' ? (
          tierLists.community.map(list => (
            <div className="tierlist-card" key={list.id}>
              <div className="tierlist-thumbnail">
                <img src={list.thumbnail} alt={list.title} />
              </div>
              <div className="tierlist-details">
                <h3>{list.title}</h3>
                <p className="author">By {list.author}</p>
                <div className="tierlist-meta">
                  <span className="categories">
                    {list.categories.join(", ")}
                  </span>
                  <span className="likes">
                    <FaTrophy /> {list.likes}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          tierLists.personal.length > 0 ? (
            tierLists.personal.map(list => (
              <div className="tierlist-card" key={list.id}>
                <div className="tierlist-thumbnail">
                  <img src={list.thumbnail} alt={list.title} />
                </div>
                <div className="tierlist-details">
                  <h3>{list.title}</h3>
                  <p className="author">Last edited: {list.lastEdited}</p>
                  <div className="tierlist-meta">
                    <span className="categories">
                      {list.categories.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>You haven't created any tier lists yet!</p>
              <button className="btn-primary">Create Your First List</button>
            </div>
          )
        )}
      </section>

      {activeTier === 'community' && (
        <div className="pagination">
          <button className="pagination-btn"><FaArrowUp /> Previous</button>
          <div className="page-numbers">
            <span className="current-page">1</span> of <span>10</span>
          </div>
          <button className="pagination-btn">Next <FaArrowDown /></button>
        </div>
      )}
    </div>
  );
};

export default TierListPage; 