import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_LEADERBOARD } from '../utils/mockData';
import './HomePage.css';

export default function HomePage() {
  const [displayName, setDisplayName] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    if (displayName.trim()) {
      localStorage.setItem('tt_displayName', displayName.trim());
      localStorage.setItem('tt_balance', localStorage.getItem('tt_balance') || '1000');
      navigate('/markets');
    }
  };

  return (
    <div className="home-page">
      <div className="home-bg-effects">
        <div className="bg-grid" />
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
      </div>

      <div className="home-content">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
              <circle cx="32" cy="32" r="20" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
              <line x1="32" y1="12" x2="32" y2="32" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="32" y1="32" x2="44" y2="38" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="32" cy="32" r="3" fill="#3b82f6" />
              <path d="M20 40 L28 34 L36 38 L44 28" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </div>
          <h1 className="logo-title">TIME TRADER</h1>
          <p className="logo-subtitle">Travel back in time. Trade the markets. Build your fortune.</p>
        </div>

        <form className="name-form" onSubmit={handleStart}>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Enter display name..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <span className="input-counter">{displayName.length}/20</span>
          </div>
          <button type="submit" className="start-btn" disabled={!displayName.trim()}>
            <span>Start Trading</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        <div className="home-stats">
          <div className="stat-pill">
            <span className="stat-dot green" />
            <span>2,847 traders online</span>
          </div>
          <div className="stat-pill">
            <span className="stat-dot gold" />
            <span>$12.4M total traded</span>
          </div>
        </div>

        <button className="leaderboard-toggle" onClick={() => setShowLeaderboard(!showLeaderboard)}>
          {showLeaderboard ? 'Hide' : 'View'} Leaderboard 🏆
        </button>

        {showLeaderboard && (
          <div className="leaderboard-panel">
            <h3>🏆 Global Leaderboard</h3>
            <div className="leaderboard-table">
              <div className="lb-header">
                <span>#</span>
                <span>Trader</span>
                <span>Balance</span>
                <span>Win Rate</span>
              </div>
              {MOCK_LEADERBOARD.map((player) => (
                <div key={player.rank} className={`lb-row ${player.rank <= 3 ? 'top-3' : ''}`}>
                  <span className="lb-rank">
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                  </span>
                  <span className="lb-name">{player.name}</span>
                  <span className="lb-balance">{player.balance.toLocaleString()} T</span>
                  <span className={`lb-winrate ${player.winRate >= 55 ? 'positive' : 'negative'}`}>
                    {player.winRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
