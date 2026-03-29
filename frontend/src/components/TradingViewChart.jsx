import { useEffect, useRef } from 'react';

export default function TradingViewChart({ symbol, dateRange }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: '1',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#111827',
      gridColor: 'rgba(42, 53, 72, 0.5)',
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      withdateranges: true,
      details: false,
      hotlist: false,
      show_popup_button: false,
      support_host: 'https://www.tradingview.com',
      enabled_features: ['header_indicators', 'header_chart_type'],
      disabled_features: ['header_symbol_search', 'symbol_search_hot_key', 'header_compare'],
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
