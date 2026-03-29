// Generate realistic OHLCV candle data starting from a given timestamp
export function generateCandles(startTime, count = 1440, intervalMs = 60000) {
  const candles = [];
  let price = 100 + Math.random() * 400; // Random starting price between 100-500
  let time = startTime;

  for (let i = 0; i < count; i++) {
    const volatility = 0.002 + Math.random() * 0.003;
    const drift = (Math.random() - 0.5) * 0.001;
    
    const open = price;
    const change1 = price * (drift + volatility * (Math.random() - 0.5));
    const change2 = price * (drift + volatility * (Math.random() - 0.5));
    const change3 = price * (drift + volatility * (Math.random() - 0.5));
    
    const high = Math.max(open, open + change1, open + change2, open + change3) + Math.abs(price * volatility * Math.random());
    const low = Math.min(open, open + change1, open + change2, open + change3) - Math.abs(price * volatility * Math.random());
    const close = open + change3;
    const volume = Math.floor(1000 + Math.random() * 50000);

    candles.push({
      time: Math.floor(time / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
    time += intervalMs;
  }

  return candles;
}

// Random date generator - picks a valid trading day
export function getRandomTradingDate() {
  const start = new Date('2015-01-05');
  const end = new Date('2025-12-31');
  
  let date;
  do {
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    date = new Date(randomTime);
  } while (date.getDay() === 0 || date.getDay() === 6); // Skip weekends

  // Set to market open (9:30 AM ET = 14:30 UTC for US markets)
  date.setUTCHours(14, 30, 0, 0);
  
  return date;
}

// Available markets
export const MARKETS = [
  { id: 'spy', name: 'S&P 500', symbol: 'SPY', category: 'Indices', icon: '📈' },
  { id: 'qqq', name: 'NASDAQ 100', symbol: 'QQQ', category: 'Indices', icon: '📊' },
  { id: 'dia', name: 'Dow Jones', symbol: 'DIA', category: 'Indices', icon: '🏛️' },
  { id: 'eurusd', name: 'EUR/USD', symbol: 'EUR/USD', category: 'Forex', icon: '💱' },
  { id: 'gbpusd', name: 'GBP/USD', symbol: 'GBP/USD', category: 'Forex', icon: '💷' },
  { id: 'usdjpy', name: 'USD/JPY', symbol: 'USD/JPY', category: 'Forex', icon: '💴' },
  { id: 'audusd', name: 'AUD/USD', symbol: 'AUD/USD', category: 'Forex', icon: '🦘' },
  { id: 'btcusd', name: 'Bitcoin', symbol: 'BTC/USD', category: 'Crypto', icon: '₿' },
  { id: 'ethusd', name: 'Ethereum', symbol: 'ETH/USD', category: 'Crypto', icon: '⟠' },
  { id: 'xauusd', name: 'Gold', symbol: 'XAU/USD', category: 'Commodities', icon: '🥇' },
  { id: 'cl', name: 'Crude Oil', symbol: 'CL', category: 'Commodities', icon: '🛢️' },
];

// Mock news headlines
export function generateHeadlines(date) {
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  return {
    date: dateStr,
    headlines: [
      { category: '🌍 World', title: 'Global markets react to central bank policy decisions', source: 'Reuters', time: '08:30 AM' },
      { category: '💰 Markets', title: 'Futures point to mixed open as investors weigh economic data', source: 'Bloomberg', time: '07:15 AM' },
      { category: '🏛️ Politics', title: 'Congressional leaders announce bipartisan infrastructure talks', source: 'AP News', time: '09:00 AM' },
      { category: '🏢 Business', title: 'Tech sector earnings beat expectations amid AI investment surge', source: 'CNBC', time: '06:45 AM' },
      { category: '📊 Economy', title: 'Jobs report shows steady growth, unemployment holds steady', source: 'WSJ', time: '08:00 AM' },
      { category: '🌏 Asia', title: 'Asian markets close higher on trade optimism', source: 'Nikkei', time: '04:00 AM' },
      { category: '🇪🇺 Europe', title: 'European stocks advance as ECB signals policy shift', source: 'FT', time: '05:30 AM' },
      { category: '⚡ Breaking', title: 'Major merger announced in healthcare sector', source: 'MarketWatch', time: '10:15 AM' },
    ],
  };
}

// Mock leaderboard
export const MOCK_LEADERBOARD = [
  { rank: 1, name: 'WallStreetWiz', balance: 847320, trades: 234, winRate: 72 },
  { rank: 2, name: 'CandleQueen', balance: 523100, trades: 189, winRate: 68 },
  { rank: 3, name: 'PipMaster', balance: 312450, trades: 312, winRate: 61 },
  { rank: 4, name: 'BullRunBenny', balance: 98700, trades: 156, winRate: 58 },
  { rank: 5, name: 'ChartNinja', balance: 45200, trades: 89, winRate: 55 },
  { rank: 6, name: 'DayTraderDan', balance: 23100, trades: 201, winRate: 49 },
  { rank: 7, name: 'AlphaSeeker', balance: 12800, trades: 67, winRate: 52 },
  { rank: 8, name: 'TrendRider', balance: 8900, trades: 145, winRate: 47 },
  { rank: 9, name: 'ScalpKing', balance: 5400, trades: 423, winRate: 51 },
  { rank: 10, name: 'GreenCandle', balance: 2100, trades: 34, winRate: 44 },
];
