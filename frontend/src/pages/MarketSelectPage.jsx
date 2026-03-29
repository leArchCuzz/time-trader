import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MARKETS, getRandomTradingDate, fetchRealNews } from '../utils/mockData';
import './MarketSelectPage.css';

export default function MarketSelectPage() {
  const navigate = useNavigate();
  const [tradingDate, setTradingDate] = useState(null);
  const [showNews, setShowNews] = useState(false);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsData, setNewsData] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [headlines, setHeadlines] = useState(null);
  const displayName = localStorage.getItem('tt_displayName') || 'Trader';
  const balance = parseInt(localStorage.getItem('tt_balance') || '1000');

  useEffect(() => {
    const date = getRandomTradingDate();
    setTradingDate(date);
    localStorage.setItem('tt_tradingDate', date.toISOString());
    localStorage.setItem('tt_startBalance', balance.toString());
  }, []);

  const handleSelectMarket = (marketId) => {
    navigate(`/trade/${marketId}`);
  };

  const categories = [...new Set(MARKETS.map(m => m.category))];

  if (!tradingDate) return null;

  const dateDisplay = tradingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeDisplay = tradingDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="market-page">
      <header className="market-header">
        <div className="header-left">
          <div className="time-badge">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#3b82f6" strokeWidth="1.5"/>
              <line x1="9" y1="4" x2="9" y2="9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="13" y2="11" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="time-label">TIME TRADER</span>
          </div>
        </div>
        <div className="header-right">
          <div className="balance-badge">
            <span className="balance-icon">🪙</span>
            <span className="balance-amount">{balance.toLocaleString()}</span>
            <span className="balance-label">tokens</span>
          </div>
          <div className="user-badge">
            <span className="user-avatar">👤</span>
            <span>{displayName}</span>
          </div>
        </div>
      </header>

      <div className="date-banner">
        <div className="date-portal">
          <div className="portal-ring" />
          <div className="portal-ring ring-2" />
          <div className="portal-content">
            <span className="portal-label">YOU'VE TRAVELED TO</span>
            <h2 className="portal-date">{dateDisplay}</h2>
            <span className="portal-time">Market opens at {timeDisplay}</span>
          </div>
        </div>
        <div className="date-actions">
          <button className="news-btn" onClick={async () => {
            setShowNews(!showNews);
            if (!newsData && !newsLoading) {
              setNewsLoading(true);
              const data = await fetchRealNews(tradingDate);
              setNewsData(data);
              setNewsLoading(false);
            }
          }}>
            📰 {showNews ? 'Hide' : 'View'} Daily Brief
          </button>
        </div>
      </div>

      {showNews && (
        <div className="news-overlay" onClick={() => setShowNews(false)}>
          <div className="news-panel" onClick={(e) => e.stopPropagation()}>
            <div className="news-header">
              <h3>📰 Daily Brief — {dateDisplay}</h3>
              <button className="news-close" onClick={() => setShowNews(false)}>✕</button>
            </div>
            <div className="news-search">
              <input
                type="text"
                placeholder="Search archived websites (Wayback Machine)..."
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newsSearch.trim()) {
                    const dateStr = tradingDate.toISOString().split('T')[0].replace(/-/g, '');
                    window.open(`https://web.archive.org/web/${dateStr}*/${newsSearch}`, '_blank');
                  }
                }}
              />
              <button className="search-go" onClick={() => {
                if (newsSearch.trim()) {
                  const dateStr = tradingDate.toISOString().split('T')[0].replace(/-/g, '');
                  window.open(`https://web.archive.org/web/${dateStr}*/${newsSearch}`, '_blank');
                }
              }}>🔍</button>
            </div>
            <div className="news-list">
              {newsLoading ? (
                <div style={{textAlign:'center',padding:'2rem',color:'var(--text-secondary)'}}>
                  <p>Loading real headlines...</p>
                </div>
              ) : newsData?.sections?.length > 0 ? (
                newsData.sections.map((section, i) => (
                  <div key={i} className="news-section-wrap">
                    <button
                      className={`news-section-btn ${expandedSection === i ? 'open' : ''}`}
                      onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                    >
                      <span>{section.category}</span>
                      <span style={{marginLeft:'auto',fontSize:'0.75rem',color:'var(--text-muted)'}}>{section.items.length} articles</span>
                      <span style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{expandedSection === i ? '▾' : '▸'}</span>
                    </button>
                    {expandedSection === i && section.items.map((item, j) => (
                      <div key={j} className="news-item">
                        <div className="news-body">
                          <h4>{item.title}</h4>
                          {item.abstract && <p style={{fontSize:'0.8rem',color:'var(--text-secondary)',lineHeight:1.5,margin:'0.3rem 0'}}>{item.abstract}</p>}
                          <div className="news-meta">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{item.time}</span>
                            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{color:'var(--accent)',textDecoration:'none',marginLeft:'auto'}}>Read full →</a>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No articles found.</div>
              )}
            </div>
            <div className="news-footer">
              <p>📰 {newsData?.totalArticles || 0} real articles from NY Times archive</p>
            </div>
          </div>
        </div>
      )}

      <div className="market-grid-section">
        <h3 className="section-title">Select a Market to Trade</h3>
        <p className="section-sub">You have 24 hours from market open. Choose wisely.</p>

        {categories.map((cat) => (
          <div key={cat} className="market-category">
            <h4 className="cat-label">{cat}</h4>
            <div className="market-cards">
              {MARKETS.filter(m => m.category === cat).map((market) => (
                <button
                  key={market.id}
                  className="market-card"
                  onClick={() => handleSelectMarket(market.id)}
                >
                  <span className="market-icon">{market.icon}</span>
                  <div className="market-info">
                    <span className="market-name">{market.name}</span>
                    <span className="market-symbol">{market.symbol}</span>
                  </div>
                  <svg className="market-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
