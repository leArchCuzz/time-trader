// Available markets - expanded forex
export const MARKETS = [
  { id: 'spy', name: 'S&P 500', symbol: 'SPY', tvSymbol: 'AMEX:SPY', category: 'Indices', icon: '📈' },
  { id: 'qqq', name: 'NASDAQ 100', symbol: 'QQQ', tvSymbol: 'NASDAQ:QQQ', category: 'Indices', icon: '📊' },
  { id: 'dia', name: 'Dow Jones', symbol: 'DIA', tvSymbol: 'AMEX:DIA', category: 'Indices', icon: '🏛️' },
  { id: 'eurusd', name: 'EUR/USD', symbol: 'EUR/USD', tvSymbol: 'FX:EURUSD', category: 'Forex', icon: '💱' },
  { id: 'gbpusd', name: 'GBP/USD', symbol: 'GBP/USD', tvSymbol: 'FX:GBPUSD', category: 'Forex', icon: '💷' },
  { id: 'usdjpy', name: 'USD/JPY', symbol: 'USD/JPY', tvSymbol: 'FX:USDJPY', category: 'Forex', icon: '💴' },
  { id: 'audusd', name: 'AUD/USD', symbol: 'AUD/USD', tvSymbol: 'FX:AUDUSD', category: 'Forex', icon: '🦘' },
  { id: 'usdcad', name: 'USD/CAD', symbol: 'USD/CAD', tvSymbol: 'FX:USDCAD', category: 'Forex', icon: '🍁' },
  { id: 'usdchf', name: 'USD/CHF', symbol: 'USD/CHF', tvSymbol: 'FX:USDCHF', category: 'Forex', icon: '🇨🇭' },
  { id: 'nzdusd', name: 'NZD/USD', symbol: 'NZD/USD', tvSymbol: 'FX:NZDUSD', category: 'Forex', icon: '🥝' },
  { id: 'btcusd', name: 'Bitcoin', symbol: 'BTC/USD', tvSymbol: 'BINANCE:BTCUSDT', category: 'Crypto', icon: '₿' },
  { id: 'ethusd', name: 'Ethereum', symbol: 'ETH/USD', tvSymbol: 'BINANCE:ETHUSDT', category: 'Crypto', icon: '⟠' },
  { id: 'xauusd', name: 'Gold', symbol: 'XAU/USD', tvSymbol: 'TVC:GOLD', category: 'Commodities', icon: '🥇' },
  { id: 'cl', name: 'Crude Oil', symbol: 'CL', tvSymbol: 'TVC:USOIL', category: 'Commodities', icon: '🛢️' },
];

// Random date generator - picks a valid trading day
export function getRandomTradingDate() {
  const start = new Date('2015-01-05');
  const end = new Date('2025-12-31');
  
  let date;
  do {
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    date = new Date(randomTime);
  } while (date.getDay() === 0 || date.getDay() === 6);

  date.setUTCHours(14, 30, 0, 0);
  return date;
}

// NYT API key
const NYT_API_KEY = 'Il4DrKOuBLkjbcekZEY9QM6Ear0AArBarSENf7ALlmgRPSmO';

// Fetch real news from NY Times Archive API for a given date
export async function fetchRealNews(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    const res = await fetch(
      `https://api.nytimes.com/svc/archive/v1/${year}/${month}.json?api-key=${NYT_API_KEY}`
    );
    const data = await res.json();
    const docs = data.response?.docs || [];
    
    // Filter to articles from that specific date
    const dayArticles = docs.filter(a => a.pub_date?.startsWith(dateStr));
    
    // Categorize articles
    const categorized = {
      '🌍 World': [],
      '💰 Markets': [],
      '🏛️ Politics': [],
      '🏢 Business': [],
      '📊 Economy': [],
      '🌏 Asia': [],
      '🇪🇺 Europe': [],
      '⚡ Breaking': [],
    };
    
    dayArticles.forEach(a => {
      const headline = a.headline?.main || '';
      const abstract = a.abstract || '';
      const lead = a.lead_paragraph || '';
      const section = (a.section_name || '').toLowerCase();
      const url = a.web_url || '';
      const source = a.source || 'NY Times';
      const time = a.pub_date ? new Date(a.pub_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      
      const item = { title: headline, abstract, lead, source, time, url };
      
      if (section.includes('world') || section.includes('international')) {
        categorized['🌍 World'].push(item);
      } else if (section.includes('business') || section.includes('market') || section.includes('finance')) {
        categorized['💰 Markets'].push(item);
        categorized['🏢 Business'].push(item);
      } else if (section.includes('politic') || section.includes('washington')) {
        categorized['🏛️ Politics'].push(item);
      } else if (section.includes('economy') || section.includes('economic')) {
        categorized['📊 Economy'].push(item);
      } else if (section.includes('asia')) {
        categorized['🌏 Asia'].push(item);
      } else if (section.includes('europe')) {
        categorized['🇪🇺 Europe'].push(item);
      } else {
        categorized['⚡ Breaking'].push(item);
      }
    });
    
    // Take top items per category
    const headlines = Object.entries(categorized)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => ({
        category,
        items: items.slice(0, 5),
      }));
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      sections: headlines,
      totalArticles: dayArticles.length,
    };
  } catch (err) {
    console.error('News fetch error:', err);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [],
      totalArticles: 0,
      error: true,
    };
  }
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
