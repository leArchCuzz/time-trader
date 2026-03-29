import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MARKETS, fetchRealNews } from '../utils/mockData';
import TradingViewChart from '../components/TradingViewChart';
import './TradingPage.css';

export default function TradingPage() {
  const { marketId } = useParams();
  const navigate = useNavigate();

  const market = MARKETS.find(m => m.id === marketId) || MARKETS[0];
  const tradingDate = new Date(localStorage.getItem('tt_tradingDate') || new Date().toISOString());

  const [balance, setBalance] = useState(parseInt(localStorage.getItem('tt_balance') || '1000'));
  const [position, setPosition] = useState(null);
  const [tradeSize, setTradeSize] = useState(100);
  const [showNews, setShowNews] = useState(false);
  const [trades, setTrades] = useState([]);
  const [pnl, setPnl] = useState(0);
  const [newsData, setNewsData] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [newsSearch, setNewsSearch] = useState('');

  // Simulated current price (in real version this comes from TradingView)
  const [currentPrice, setCurrentPrice] = useState(100 + Math.random() * 400);

  // Simulate price movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = prev * (Math.random() - 0.5) * 0.002;
        return parseFloat((prev + change).toFixed(2));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update unrealized PnL
  useEffect(() => {
    if (position) {
      const unrealized = position.type === 'long'
        ? (currentPrice - position.entry) * position.size
        : (position.entry - currentPrice) * position.size;
      setPnl(parseFloat(unrealized.toFixed(2)));
    }
  }, [currentPrice, position]);

  // Fetch real news
  const handleShowNews = async () => {
    setShowNews(true);
    if (!newsData && !newsLoading) {
      setNewsLoading(true);
      const data = await fetchRealNews(tradingDate);
      setNewsData(data);
      setNewsLoading(false);
    }
  };

  const handleBuy = () => {
    if (position || tradeSize > balance || tradeSize <= 0) return;
    const size = tradeSize / currentPrice;
    setPosition({ type: 'long', entry: currentPrice, size, cost: tradeSize });
    setBalance(prev => prev - tradeSize);
  };

  const handleSell = () => {
    if (position || tradeSize > balance || tradeSize <= 0) return;
    const size = tradeSize / currentPrice;
    setPosition({ type: 'short', entry: currentPrice, size, cost: tradeSize });
    setBalance(prev => prev - tradeSize);
  };

  const handleClose = () => {
    if (!position) return;
    const realized = position.type === 'long'
      ? (currentPrice - position.entry) * position.size
      : (position.entry - currentPrice) * position.size;
    const returnAmount = position.cost + realized;
    setBalance(prev => parseFloat((prev + returnAmount).toFixed(2)));
    setTrades(prev => [...prev, {
      type: position.type, entry: position.entry, exit: currentPrice,
      pnl: parseFloat(realized.toFixed(2)), size: position.cost,
    }]);
    setPosition(null);
    setPnl(0);
  };

  const handleFinishDay = () => {
    if (position) handleClose();
    const finalBalance = balance + (position ? pnl : 0);
    localStorage.setItem('tt_balance', Math.max(0, Math.round(finalBalance)).toString());
    localStorage.setItem('tt_dayPnl', JSON.stringify({ trades, startBalance: parseInt(localStorage.getItem('tt_startBalance') || '1000'), endBalance: finalBalance }));
    navigate('/summary');
  };

  const dateDisplay = tradingDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="trading-page">
      <header className="trade-header">
        <div className="th-left">
          <span className="th-market-icon">{market.icon}</span>
          <div>
            <span className="th-market-name">{market.name}</span>
            <span className="th-market-symbol">{market.symbol}</span>
          </div>
        </div>
        <div className="th-center">
          <span className="th-price" data-trend={pnl >= 0 ? 'up' : 'down'}>
            ${currentPrice.toFixed(2)}
          </span>
        </div>
        <div className="th-right">
          <div className="th-date">{dateDisplay}</div>
          <div className="th-balance">🪙 {balance.toLocaleString()} tokens</div>
        </div>
      </header>

      <div className="trade-body">
        <div className="chart-area">
          <div className="chart-toolbar">
            <div className="toolbar-info">
              <span className="tv-badge">Powered by TradingView</span>
            </div>
            <div className="chart-actions">
              <button className="news-toggle" onClick={handleShowNews}>📰 News</button>
              <button className="finish-btn" onClick={handleFinishDay}>🏁 Finish Day</button>
            </div>
          </div>
          <div className="chart-container">
            <TradingViewChart symbol={market.tvSymbol} />
          </div>
        </div>

        <div className="trade-panel">
          <div className="panel-section">
            <h4>Trade</h4>
            <div className="trade-input-group">
              <label>Size (tokens)</label>
              <input
                type="number"
                value={tradeSize}
                onChange={(e) => setTradeSize(Math.max(0, parseInt(e.target.value) || 0))}
                min="1"
                max={balance}
              />
              <div className="size-presets">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setTradeSize(Math.floor(balance * pct / 100))}>
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {!position ? (
              <div className="trade-buttons">
                <button className="buy-btn" onClick={handleBuy} disabled={tradeSize > balance || tradeSize <= 0}>
                  📈 Long
                </button>
                <button className="sell-btn" onClick={handleSell} disabled={tradeSize > balance || tradeSize <= 0}>
                  📉 Short
                </button>
              </div>
            ) : (
              <div className="position-info">
                <div className={`position-badge ${position.type}`}>
                  {position.type === 'long' ? '📈 LONG' : '📉 SHORT'}
                </div>
                <div className="position-details">
                  <div className="pos-row"><span>Entry</span><span>${position.entry.toFixed(2)}</span></div>
                  <div className="pos-row"><span>Current</span><span>${currentPrice.toFixed(2)}</span></div>
                  <div className={`pos-row pnl ${pnl >= 0 ? 'positive' : 'negative'}`}>
                    <span>P&L</span><span>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} T</span>
                  </div>
                </div>
                <button className="close-btn" onClick={handleClose}>Close Position</button>
              </div>
            )}
          </div>

          <div className="panel-section trades-history">
            <h4>Trade History</h4>
            {trades.length === 0 ? (
              <p className="no-trades">No trades yet</p>
            ) : (
              <div className="trades-list">
                {trades.map((t, i) => (
                  <div key={i} className={`trade-row ${t.pnl >= 0 ? 'win' : 'loss'}`}>
                    <span>{t.type === 'long' ? '📈' : '📉'}</span>
                    <span>${t.entry.toFixed(2)}</span>
                    <span className="trade-arrow">→</span>
                    <span>${t.exit.toFixed(2)}</span>
                    <span className={`trade-pnl ${t.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNews && (
        <div className="news-overlay" onClick={() => setShowNews(false)}>
          <div className="news-panel" onClick={(e) => e.stopPropagation()}>
            <div className="news-header">
              <h3>📰 Daily Brief — {newsData?.date || dateDisplay}</h3>
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
                <div className="news-loading">
                  <div className="spinner"></div>
                  <p>Fetching real headlines from {tradingDate.toLocaleDateString()}...</p>
                </div>
              ) : newsData?.sections?.length > 0 ? (
                newsData.sections.map((section, i) => (
                  <div key={i} className="news-section">
                    <button
                      className={`news-section-header ${expandedSection === i ? 'expanded' : ''}`}
                      onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                    >
                      <span className="news-section-cat">{section.category}</span>
                      <span className="news-section-count">{section.items.length} articles</span>
                      <span className="news-section-arrow">{expandedSection === i ? '▾' : '▸'}</span>
                    </button>
                    {expandedSection === i && (
                      <div className="news-section-items">
                        {section.items.map((item, j) => (
                          <div key={j} className="news-item">
                            <h4>{item.title}</h4>
                            {item.abstract && <p className="news-abstract">{item.abstract}</p>}
                            {item.lead && item.lead !== item.abstract && (
                              <p className="news-lead">{item.lead}</p>
                            )}
                            <div className="news-meta">
                              <span>{item.source}</span>
                              <span>•</span>
                              <span>{item.time}</span>
                              {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Read full →</a>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="news-empty">
                  <p>{newsData?.error ? 'Failed to load news. Try the search bar above.' : 'No articles found for this date.'}</p>
                </div>
              )}
            </div>
            <div className="news-footer">
              <p>📰 {newsData?.totalArticles || 0} real articles from NY Times archive • Search bar uses Wayback Machine</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
