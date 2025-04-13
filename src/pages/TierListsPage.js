import React from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css';

const TierListsPage = () => {
  // Sample tier list data
  const tierLists = [
    {
      id: 1,
      title: "RPG Games of All Time",
      author: "GameMaster",
      sTier: ["The Witcher 3", "Skyrim", "Elden Ring"],
      aTier: ["Fallout 4", "Dragon Age", "Mass Effect 2"]
    },
    {
      id: 2,
      title: "FPS Shooters Ranked",
      author: "FragChamp",
      sTier: ["DOOM Eternal", "Half-Life 2", "Halo 3"],
      aTier: ["Call of Duty: MW2", "Apex Legends", "CS:GO"]
    },
    {
      id: 3,
      title: "Best Indie Games 2023",
      author: "IndieDevLover",
      sTier: ["Hollow Knight", "Stardew Valley", "Hades"],
      aTier: ["Cult of the Lamb", "Dead Cells", "Slay the Spire"]
    },
    {
      id: 4,
      title: "Open World Games Ranking",
      author: "ExplorerGuy",
      sTier: ["Red Dead Redemption 2", "Breath of the Wild", "GTA V"],
      aTier: ["Cyberpunk 2077", "Horizon Zero Dawn", "Ghost of Tsushima"]
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Game Tier Lists</h1>
        <p className="page-description">
          Browse through player-made tier lists ranking the best and worst games across various categories, 
          or create your own to share with the community.
        </p>
      </div>

      <div className="tier-list-grid">
        {tierLists.map(list => (
          <div key={list.id} className="tier-list-card">
            <h2>{list.title}</h2>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '1rem' }}>
              By {list.author}
            </p>
            
            <div className="tier-preview">
              <div className="tier-row">
                <div className="tier-label s-tier">S</div>
                <div className="tier-games">
                  {list.sTier.map((game, index) => (
                    <span key={index} className="mini-game">{game}</span>
                  ))}
                </div>
              </div>
              
              <div className="tier-row">
                <div className="tier-label a-tier">A</div>
                <div className="tier-games">
                  {list.aTier.map((game, index) => (
                    <span key={index} className="mini-game">{game}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <button className="view-btn">View Full Tier List</button>
          </div>
        ))}
      </div>

      <div className="create-tier-list">
        <h2>Create Your Own Tier List</h2>
        <p>Rank your favorite games and share your opinions with the community.</p>
        <button className="create-btn">Create Tier List</button>
      </div>
    </div>
  );
};

export default TierListsPage; 