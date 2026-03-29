import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { MARKETS, generateCandles, generateHeadlines } from '../utils/mockData';
import './TradingPage.css';

export default function TradingPage() {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const playIntervalRef = useRef(null);

  const market = MARKETS.find(m => m.id === marketId) || MARKETS[0];
  const tradingDate = new Date(localStorage.getItem('tt_tradingDate') || new Date().toISOString());

  const [allCandles, setAllCandles] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(60); // Start with 1 hour of data
  const [speed, setSpeed] = useState(0); // 0 = paused
  const [balance, setBalance] = useState(parseInt(localStorage.getItem('tt_balance') || '1000'));
  const [position, setPosition] = useState(null); // { type: 'long'|'short', entry, size }
  const [tradeSize, setTradeSize] = useState(100);
  const [showNews, setShowNews] = useState(false);
  const [trades, setTrades] = useState([]);
  const [pnl, setPnl] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(60);
  const [newsSearch, setNewsSearch] = useState('');

  const headlines = generateHeadlines(tradingDate);
  const TOTAL_MINUTES = 1440; // 24 hours
  const speeds = [0, 1, 2, 5, 10, 20, 50];

  // Generate all candles on mount
  useEffect(() => {
    const candles = generateCandles(tradingDate.getTime(), TOTAL_MINUTES);
    setAllCandles(candles);
  }, []);

  // Create chart
  useEffect(() => {
    if (!chartContainerRef.current || allCandles.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#111827' },
        textColor: '#94a3b8',
        fontFamily: 'Space Grotesk, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(42, 53, 72, 0.5)' },
        horzLines: { color: 'rgba(42, 53, 72, 0.5)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(59, 130, 246, 0.4)', labelBackgroundColor: '#3b82f6' },
        horzLine: { color: 'rgba(59, 130, 246, 0.4)', labelBackgroundColor: '#3b82f6' },
      },
      timeScale: {
        borderColor: '#2a3548',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#2a3548',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const visibleCandles = allCandles.slice(0, visibleIndex);
    candleSeries.setData(visibleCandles);
    volumeSeries.setData(visibleCandles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    })));

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [allCandles]);

  // Update chart when visibleIndex changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || allCandles.length === 0) return;
    
    const visibleCandles = allCandles.slice(0, visibleIndex);
    candleSeriesRef.current.setData(visibleCandles);
    volumeSeriesRef.current.setData(visibleCandles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    })));
  }, [visibleIndex, allCandles]);

  // Playback engine
  useEffect(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    if (speed > 0 && visibleIndex < TOTAL_MINUTES) {
      const interval = 1000 / speed;
      playIntervalRef.current = setInterval(() => {
        setVisibleIndex(prev => {
          if (prev >= TOTAL_MINUTES) {
            clearInterval(playIntervalRef.current);
            return prev;
          }
          setElapsedMinutes(prev + 1);
          return prev + 1;
        });
      }, interval);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [speed, visibleIndex]);

  // Update unrealized PnL
  useEffect(() => {
    if (position && allCandles[visibleIndex - 1]) {
      const currentPrice = allCandles[visibleIndex - 1].close;
      const unrealized = position.type === 'long'
        ? (currentPrice - position.entry) * position.size
        : (position.entry - currentPrice) * position.size;
      setPnl(parseFloat(unrealized.toFixed(2)));
    }
  }, [visibleIndex, position, allCandles]);

  const currentPrice = allCandles[visibleIndex - 1]?.close || 0;

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
    const exitPrice = currentPrice;
    const realized = position.type === 'long'
      ? (exitPrice - position.entry) * position.size
      : (position.entry - exitPrice) * position.size;
    
    const returnAmount = position.cost + realized;
    setBalance(prev => parseFloat((prev + returnAmount).toFixed(2)));
    setTrades(prev => [...prev, {
      type: position.type,
      entry: position.entry,
      exit: exitPrice,
      pnl: parseFloat(realized.toFixed(2)),
      size: position.cost,
    }]);
    setPosition(null);
    setPnl(0);
  };

  const handleFinishDay = () => {
    if (position) handleClose();
    const startBalance = 1000; // or track per-session
    const finalBalance = balance + (position ? pnl : 0);
    localStorage.setItem('tt_balance', Math.max(0, Math.round(finalBalance)).toString());
    localStorage.setItem('tt_dayPnl', JSON.stringify({
      trades,
      startBalance,
      endBalance: finalBalance,
    }));
    navigate('/summary');
  };

  const timeRemaining = TOTAL_MINUTES - elapsedMinutes;
  const hoursLeft = Math.floor(timeRemaining / 60);
  const minsLeft = timeRemaining % 60;

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
          <span className="th-price" data-trend={allCandles[visibleIndex-1]?.close >= allCandles[visibleIndex-2]?.close ? 'up' : 'down'}>
            ${currentPrice.toFixed(2)}
          </span>
        </div>
        <div className="th-right">
          <div className="th-time-left">
            <span className="th-time-icon">⏱</span>
            <span>{hoursLeft}h {minsLeft}m left</span>
          </div>
          <div className="th-balance">
            🪙 {balance.toLocaleString()} tokens
          </div>
        </div>
      </header>

      <div className="trade-body">
        <div className="chart-area">
          <div className="chart-toolbar">
            <div className="speed-controls">
              {speeds.map(s => (
                <button
                  key={s}
                  className={`speed-btn ${speed === s ? 'active' : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s === 0 ? '⏸' : `${s}x`}
                </button>
              ))}
            </div>
            <div className="chart-actions">
              <button className="news-toggle" onClick={() => setShowNews(!showNews)}>
                📰 News
              </button>
              <button className="finish-btn" onClick={handleFinishDay}>
                🏁 Finish Day
              </button>
            </div>
          </div>
          <div className="chart-container" ref={chartContainerRef} />
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
                  <div className="pos-row">
                    <span>Entry</span>
                    <span>${position.entry.toFixed(2)}</span>
                  </div>
                  <div className="pos-row">
                    <span>Current</span>
                    <span>${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className={`pos-row pnl ${pnl >= 0 ? 'positive' : 'negative'}`}>
                    <span>P&L</span>
                    <span>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} T</span>
                  </div>
                </div>
                <button className="close-btn" onClick={handleClose}>
                  Close Position
                </button>
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
                    <span className="trade-type">{t.type === 'long' ? '📈' : '📉'}</span>
                    <span className="trade-entry">${t.entry.toFixed(2)}</span>
                    <span className="trade-arrow">→</span>
                    <span className="trade-exit">${t.exit.toFixed(2)}</span>
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
              <h3>📰 Daily Brief — {headlines.date}</h3>
              <button className="news-close" onClick={() => setShowNews(false)}>✕</button>
            </div>
            <div className="news-search">
              <input
                type="text"
                placeholder="Search archived websites..."
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
              />
              <button className="search-go">🔍</button>
            </div>
            <div className="news-list">
              {headlines.headlines.map((h, i) => (
                <div key={i} className="news-item">
                  <span className="news-category">{h.category}</span>
                  <div className="news-body">
                    <h4>{h.title}</h4>
                    <div className="news-meta">
                      <span>{h.source}</span>
                      <span>•</span>
                      <span>{h.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
