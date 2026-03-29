import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MarketSelectPage from './pages/MarketSelectPage';
import TradingPage from './pages/TradingPage';
import SummaryPage from './pages/SummaryPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/markets" element={<MarketSelectPage />} />
        <Route path="/trade/:marketId" element={<TradingPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
