import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ExternalDashboard.css';

const ExternalDashboard = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketSentiment, setMarketSentiment] = useState(null);
  const [financialHealth, setFinancialHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');
  
  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = () => {
    setIsLoading(true);
    
    // Mock data - in a real app, this would be an API call
    setTimeout(() => {
      // Generate portfolio data
      const mockPortfolioData = {
        totalValue: 1245000,
        cashBalance: 78500,
        invested: 1166500,
        assetAllocation: [
          { name: 'Stocks', value: 62 },
          { name: 'Bonds', value: 23 },
          { name: 'Alternatives', value: 10 },
          { name: 'Cash', value: 5 }
        ],
        performance: {
          ytd: 8.7,
          oneYear: 14.2,
          threeYear: 36.8,
          fiveYear: 52.1
        },
        historicalPerformance: {
          '1m': generatePerformanceData(30, 0.8, 0.6),
          '3m': generatePerformanceData(90, 2.5, 2.1),
          '6m': generatePerformanceData(180, 5.2, 4.8),
          '1y': generatePerformanceData(365, 14.2, 12.8),
          '3y': generatePerformanceData(1095, 36.8, 32.5)
        },
        netWorth: {
          financial: 1245000,
          realEstate: 850000,
          other: 125000,
          debt: -320000
        }
      };
      
      // Generate market sentiment data
      const mockMarketSentiment = {
        overall: 62, // Scale of 0-100, from bearish to bullish
        sectorSentiment: [
          { name: 'Technology', sentiment: 75, change: 5 },
          { name: 'Healthcare', sentiment: 68, change: 2 },
          { name: 'Financials', sentiment: 52, change: -3 },
          { name: 'Energy', sentiment: 45, change: -8 },
          { name: 'Consumer', sentiment: 60, change: 1 },
          { name: 'Utilities', sentiment: 55, change: 0 }
        ],
        volatilityIndex: 18.5,
        fearGreedIndex: 65,
        newsHeadlines: [
          { title: 'Fed signals potential pause in rate hikes', sentiment: 'positive', source: 'Financial Times' },
          { title: 'Tech earnings exceed expectations', sentiment: 'positive', source: 'WSJ' },
          { title: 'Inflation falls to 3.2%, lowest in 18 months', sentiment: 'positive', source: 'Bloomberg' },
          { title: 'Oil prices rise amid Middle East tensions', sentiment: 'neutral', source: 'Reuters' }
        ]
      };
      
      // Generate financial health data
      const mockFinancialHealth = {
        score: 82, // Scale of 0-100
        lastMonth: 79,
        components: [
          { name: 'Savings Rate', score: 85, weight: 25 },
          { name: 'Debt Management', score: 70, weight: 20 },
          { name: 'Investment Allocation', score: 90, weight: 25 },
          { name: 'Risk Management', score: 75, weight: 15 },
          { name: 'Goal Progress', score: 88, weight: 15 }
        ],
        recommendations: [
          { type: 'savings', title: 'Increase emergency fund', priority: 'medium' },
          { type: 'debt', title: 'Refinance mortgage at lower rate', priority: 'high' },
          { type: 'investment', title: 'Rebalance retirement accounts', priority: 'low' }
        ],
        monthlyScores: [
          { month: 'May', score: 76 },
          { month: 'Jun', score: 78 },
          { month: 'Jul', score: 77 },
          { month: 'Aug', score: 79 },
          { month: 'Sep', score: 81 },
          { month: 'Oct', score: 82 }
        ]
      };
      
      setPortfolioData(mockPortfolioData);
      setMarketSentiment(mockMarketSentiment);
      setFinancialHealth(mockFinancialHealth);
      setIsLoading(false);
    }, 1200);
  };
  
  // Helper function to generate performance data
  function generatePerformanceData(days, portfolioReturn, benchmarkReturn) {
    const data = [];
    let portfolioValue = 100;
    let benchmarkValue = 100;
    
    for (let i = 0; i <= days; i++) {
      // Add some randomness to the daily change
      const portfolioDailyChange = (portfolioReturn / days) + (Math.random() - 0.5) * 0.3;
      const benchmarkDailyChange = (benchmarkReturn / days) + (Math.random() - 0.5) * 0.25;
      
      portfolioValue += portfolioValue * (portfolioDailyChange / 100);
      benchmarkValue += benchmarkValue * (benchmarkDailyChange / 100);
      
      // Only add data points for specific intervals to avoid too many points
      if (i === 0 || i === days || i % Math.max(1, Math.floor(days / 20)) === 0) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        
        data.push({
          date: date.toISOString().split('T')[0],
          portfolio: parseFloat(portfolioValue.toFixed(2)),
          benchmark: parseFloat(benchmarkValue.toFixed(2))
        });
      }
    }
    
    return data;
  }
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container external">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>My Dashboard</h1>
        <p className="subtitle">Your financial overview and market insights</p>
      </motion.div>
      
      <motion.div 
        className="dashboard-overview"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="overview-card net-worth" variants={itemVariants}>
          <h3>Total Net Worth</h3>
          <div className="value-amount">${(portfolioData.netWorth.financial + portfolioData.netWorth.realEstate + portfolioData.netWorth.other + portfolioData.netWorth.debt).toLocaleString()}</div>
          <div className="chart-container mini">
            <ResponsiveContainer width="100%" height={50}>
              <BarChart
                data={[
                  { name: 'Financial', value: portfolioData.netWorth.financial },
                  { name: 'Real Estate', value: portfolioData.netWorth.realEstate },
                  { name: 'Other', value: portfolioData.netWorth.other },
                  { name: 'Debt', value: Math.abs(portfolioData.netWorth.debt) }
                ]}
                layout="vertical"
                barCategoryGap={1}
              >
                <Bar dataKey="value" fill="#8884d8">
                  {[
                    { name: 'Financial', value: portfolioData.netWorth.financial },
                    { name: 'Real Estate', value: portfolioData.netWorth.realEstate },
                    { name: 'Other', value: portfolioData.netWorth.other },
                    { name: 'Debt', value: Math.abs(portfolioData.netWorth.debt) }
                  ].map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 3 ? '#f44336' : COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div className="overview-card portfolio-value" variants={itemVariants}>
          <h3>Portfolio Value</h3>
          <div className="value-amount">${portfolioData.totalValue.toLocaleString()}</div>
          <div className="performance-stats">
            <div className="perf-stat">
              <span className="stat-label">YTD</span>
              <span className="stat-value positive">+{portfolioData.performance.ytd}%</span>
            </div>
            <div className="perf-stat">
              <span className="stat-label">1Y</span>
              <span className="stat-value positive">+{portfolioData.performance.oneYear}%</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div className="overview-card market-sentiment" variants={itemVariants}>
          <h3>Market Sentiment</h3>
          <div className="sentiment-meter">
            <div className="meter-bar">
              <div 
                className="meter-fill" 
                style={{ width: `${marketSentiment.overall}%` }}
              ></div>
            </div>
            <div className="meter-labels">
              <span>Bearish</span>
              <span>Neutral</span>
              <span>Bullish</span>
            </div>
          </div>
          <div className="sentiment-value">{marketSentiment.overall}/100</div>
        </motion.div>
        
        <motion.div className="overview-card health-score" variants={itemVariants}>
          <h3>Financial Health</h3>
          <div className="score-circle">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#f0f0f0" strokeWidth="5" />
              <circle 
                cx="30" 
                cy="30" 
                r="25" 
                fill="none" 
                stroke="#4caf50" 
                strokeWidth="5"
                strokeDasharray={`${financialHealth.score * 1.57} 157`}
                transform="rotate(-90 30 30)"
              />
            </svg>
            <div className="score-value">{financialHealth.score}</div>
          </div>
          <div className="score-trend positive">+{financialHealth.score - financialHealth.lastMonth} <span>from last month</span></div>
        </motion.div>
      </motion.div>
      
      <div className="dashboard-grid">
        <motion.div 
          className="card performance-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="card-header">
            <h2>Portfolio Performance</h2>
            <div className="time-range-selector">
              <button 
                className={`range-btn ${timeRange === '1m' ? 'active' : ''}`} 
                onClick={() => handleTimeRangeChange('1m')}
              >
                1M
              </button>
              <button 
                className={`range-btn ${timeRange === '3m' ? 'active' : ''}`} 
                onClick={() => handleTimeRangeChange('3m')}
              >
                3M
              </button>
              <button 
                className={`range-btn ${timeRange === '6m' ? 'active' : ''}`} 
                onClick={() => handleTimeRangeChange('6m')}
              >
                6M
              </button>
              <button 
                className={`range-btn ${timeRange === '1y' ? 'active' : ''}`} 
                onClick={() => handleTimeRangeChange('1y')}
              >
                1Y
              </button>
              <button 
                className={`range-btn ${timeRange === '3y' ? 'active' : ''}`} 
                onClick={() => handleTimeRangeChange('3y')}
              >
                3Y
              </button>
            </div>
          </div>
          
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioData.historicalPerformance[timeRange]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tickFormatter={(value) => `${value}`} />
                <Tooltip formatter={(value) => [`${value}`, '']} />
                <Legend />
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6a11cb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6a11cb" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8042" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff8042" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  name="Your Portfolio"
                  stroke="#6a11cb"
                  fillOpacity={1}
                  fill="url(#colorPortfolio)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  name="Benchmark"
                  stroke="#ff8042"
                  fillOpacity={1}
                  fill="url(#colorBenchmark)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Your Return</span>
                <span className="metric-value positive">+{(portfolioData.historicalPerformance[timeRange][portfolioData.historicalPerformance[timeRange].length - 1].portfolio - 100).toFixed(2)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Benchmark</span>
                <span className="metric-value positive">+{(portfolioData.historicalPerformance[timeRange][portfolioData.historicalPerformance[timeRange].length - 1].benchmark - 100).toFixed(2)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Difference</span>
                <span className="metric-value positive">+{((portfolioData.historicalPerformance[timeRange][portfolioData.historicalPerformance[timeRange].length - 1].portfolio - 100) - (portfolioData.historicalPerformance[timeRange][portfolioData.historicalPerformance[timeRange].length - 1].benchmark - 100)).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card allocation-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <div className="card-header">
            <h2>Asset Allocation</h2>
          </div>
          
          <div className="card-content allocation-content">
            <div className="allocation-chart">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={portfolioData.assetAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {portfolioData.assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="allocation-details">
              <h3>Portfolio Breakdown</h3>
              <div className="allocation-list">
                {portfolioData.assetAllocation.map((asset, index) => (
                  <div key={index} className="allocation-item">
                    <div className="item-header">
                      <div className="item-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="item-name">{asset.name}</span>
                      <span className="item-value">{asset.value}%</span>
                    </div>
                    <div className="item-bar">
                      <div 
                        className="item-fill" 
                        style={{ 
                          width: `${asset.value}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="allocation-actions">
                <button className="action-btn">
                  <i className="fas fa-sync-alt"></i>
                  Rebalance Portfolio
                </button>
                <button className="action-btn">
                  <i className="fas fa-sliders-h"></i>
                  Adjust Targets
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card sentiment-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <h2>Market Heatmap</h2>
          </div>
          
          <div className="card-content">
            <div className="sector-sentiment">
              <h3>Sector Sentiment</h3>
              <div className="sector-grid">
                {marketSentiment.sectorSentiment.map((sector, index) => (
                  <div key={index} className="sector-item">
                    <div className="sector-header">
                      <span className="sector-name">{sector.name}</span>
                      <span className={`sector-change ${sector.change >= 0 ? 'positive' : 'negative'}`}>
                        {sector.change >= 0 ? '+' : ''}{sector.change}
                      </span>
                    </div>
                    <div className="sentiment-bar">
                      <div 
                        className="sentiment-fill" 
                        style={{ 
                          width: `${sector.sentiment}%`,
                          backgroundColor: sector.sentiment > 66 
                            ? '#4caf50' 
                            : sector.sentiment > 33 
                              ? '#ffeb3b' 
                              : '#f44336'
                        }}
                      ></div>
                    </div>
                    <div className="sentiment-labels">
                      <span className="sentiment-value">{sector.sentiment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="market-indicators">
              <div className="indicator">
                <h3>Volatility Index</h3>
                <div className="indicator-value">{marketSentiment.volatilityIndex}</div>
                <div className="indicator-label">Moderate volatility</div>
              </div>
              
              <div className="indicator">
                <h3>Fear & Greed Index</h3>
                <div className="fear-greed-meter">
                  <div className="fear-greed-bar">
                    <div 
                      className="fear-greed-fill" 
                      style={{ width: `${marketSentiment.fearGreedIndex}%` }}
                    ></div>
                  </div>
                  <div className="fear-greed-labels">
                    <span>Extreme Fear</span>
                    <span>Fear</span>
                    <span>Neutral</span>
                    <span>Greed</span>
                    <span>Extreme Greed</span>
                  </div>
                </div>
                <div className="indicator-label">
                  {marketSentiment.fearGreedIndex < 25 
                    ? 'Extreme Fear' 
                    : marketSentiment.fearGreedIndex < 45
                      ? 'Fear'
                      : marketSentiment.fearGreedIndex < 55
                        ? 'Neutral'
                        : marketSentiment.fearGreedIndex < 75
                          ? 'Greed'
                          : 'Extreme Greed'
                  }
                </div>
              </div>
            </div>
            
            <div className="market-news">
              <h3>Latest Market News</h3>
              <ul className="news-list">
                {marketSentiment.newsHeadlines.map((news, index) => (
                  <li key={index} className={`news-item ${news.sentiment}`}>
                    <div className="news-sentiment-icon">
                      <i className={`fas ${
                        news.sentiment === 'positive' ? 'fa-arrow-up' :
                        news.sentiment === 'negative' ? 'fa-arrow-down' : 'fa-minus'
                      }`}></i>
                    </div>
                    <div className="news-content">
                      <div className="news-title">{news.title}</div>
                      <div className="news-source">{news.source}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card health-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h2>Financial Health Score</h2>
          </div>
          
          <div className="card-content">
            <div className="health-chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={financialHealth.monthlyScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" name="Health Score" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="health-components">
              <h3>Score Components</h3>
              <div className="components-list">
                {financialHealth.components.map((component, index) => (
                  <div key={index} className="component-item">
                    <div className="component-header">
                      <span className="component-name">{component.name}</span>
                      <span className="component-score">{component.score}/100</span>
                    </div>
                    <div className="component-bar">
                      <div 
                        className="component-fill" 
                        style={{ 
                          width: `${component.score}%`,
                          backgroundColor: component.score > 80 
                            ? '#4caf50' 
                            : component.score > 60 
                              ? '#ffeb3b' 
                              : '#f44336'
                        }}
                      ></div>
                    </div>
                    <div className="component-weight">
                      <span>Weight: {component.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="health-recommendations">
              <h3>Recommended Actions</h3>
              <ul className="recommendations-list">
                {financialHealth.recommendations.map((rec, index) => (
                  <li key={index} className={`recommendation-item ${rec.priority}`}>
                    <div className="recommendation-icon">
                      <i className={`fas ${
                        rec.type === 'savings' ? 'fa-piggy-bank' :
                        rec.type === 'debt' ? 'fa-credit-card' :
                        rec.type === 'investment' ? 'fa-chart-line' : 'fa-check'
                      }`}></i>
                    </div>
                    <div className="recommendation-content">
                      <div className="recommendation-title">{rec.title}</div>
                      <div className="priority-badge">{rec.priority}</div>
                    </div>
                    <div className="recommendation-action">
                      <button className="action-btn small">
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExternalDashboard;