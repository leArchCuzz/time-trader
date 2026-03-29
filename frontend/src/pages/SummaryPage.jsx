import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './SummaryPage.css';

export default function SummaryPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const balance = parseInt(localStorage.getItem('tt_balance') || '1000');
    const displayName = localStorage.getItem('tt_displayName') || 'Trader';
    const dayPnl = JSON.parse(localStorage.getItem('tt_dayPnl') || '{}');
    const tradingDate = new Date(localStorage.getItem('tt_tradingDate') || new Date().toISOString());

    const trades = dayPnl.trades || [];
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl < 0).length;
    const pctChange = dayPnl.startBalance ? ((balance - dayPnl.startBalance) / dayPnl.startBalance * 100) : 0;
    const multiplier = dayPnl.startBalance ? (balance / dayPnl.startBalance) : 1;

    setData({
      balance,
      displayName,
      trades,
      totalPnl,
      wins,
      losses,
      pctChange,
      multiplier,
      tradingDate: tradingDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
    });

    // Check for bust
    if (balance <= 0) {
      localStorage.removeItem('tt_displayName');
      localStorage.setItem('tt_balance', '1000');
    }
  }, []);

  const handleNextDay = () => {
    navigate('/markets');
  };

  const handleHome = () => {
    navigate('/');
  };

  if (!data) return null;

  const isBust = data.balance <= 0;
  const isProfit = data.totalPnl >= 0;

  return (
    <div className="summary-page">
      <div className="summary-bg">
        <div className={`summary-glow ${isProfit ? 'green' : 'red'}`} />
      </div>

      <div className="summary-content">
        <div className="summary-card">
          <div className="summary-header">
            <span className="summary-emoji">{isProfit ? '🎉' : '😤'}</span>
            <h2>{isProfit ? 'Nice Trading!' : 'Tough Day'}</h2>
            <p className="summary-date">{data.tradingDate}</p>
          </div>

          <div className="summary-stats">
            <div className={`stat-big ${isProfit ? 'positive' : 'negative'}`}>
              <span className="stat-big-label">Day P&L</span>
              <span className="stat-big-value">
                {data.totalPnl >= 0 ? '+' : ''}{data.totalPnl.toFixed(2)} T
              </span>
            </div>

            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-label">Multiplier</span>
                <span className={`stat-value ${data.multiplier >= 1 ? 'positive' : 'negative'}`}>
                  {data.multiplier.toFixed(2)}x
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">% Change</span>
                <span className={`stat-value ${data.pctChange >= 0 ? 'positive' : 'negative'}`}>
                  {data.pctChange >= 0 ? '+' : ''}{data.pctChange.toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Trades</span>
                <span className="stat-value">{data.trades.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Win / Loss</span>
                <span className="stat-value">
                  <span className="positive">{data.wins}</span>
                  {' / '}
                  <span className="negative">{data.losses}</span>
                </span>
              </div>
            </div>

            <div className="balance-display">
              <span className="balance-label">Updated Balance</span>
              <span className="balance-value">🪙 {data.balance.toLocaleString()} tokens</span>
            </div>
          </div>

          {data.trades.length > 0 && (
            <div className="trades-recap">
              <h4>Trade Recap</h4>
              {data.trades.map((t, i) => (
                <div key={i} className={`recap-row ${t.pnl >= 0 ? 'win' : 'loss'}`}>
                  <span>{t.type === 'long' ? '📈' : '📉'}</span>
                  <span>${t.entry.toFixed(2)} → ${t.exit.toFixed(2)}</span>
                  <span className={t.pnl >= 0 ? 'positive' : 'negative'}>
                    {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)} T
                  </span>
                </div>
              ))}
            </div>
          )}

          {isBust ? (
            <div className="bust-section">
              <h3>💀 Account Busted!</h3>
              <p>You've lost all your tokens. Time for a fresh start with a new identity.</p>
              <button className="next-btn bust" onClick={handleHome}>
                Choose New Name → Start Fresh (1,000 T)
              </button>
            </div>
          ) : (
            <div className="summary-actions">
              <button className="next-btn" onClick={handleNextDay}>
                🎲 Next Random Day
              </button>
              <button className="home-btn" onClick={handleHome}>
                🏠 Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
