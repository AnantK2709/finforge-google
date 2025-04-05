import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PortfolioRiskManagement.css';

const PortfolioRiskManagement = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');
  const [selectedSector, setSelectedSector] = useState('all');
  
  useEffect(() => {
    // Fetch portfolio data
    fetchPortfolioData();
  }, []);
  
  const fetchPortfolioData = () => {
    setIsLoading(true);
    
    // Mock data - in a real app, this would be an API call
    setTimeout(() => {
      const mockData = {
        portfolioValue: 287650000,
        clientCount: 187,
        riskMetrics: {
          portfolioBeta: 0.92,
          volatility: 12.4,
          sharpeRatio: 1.38,
          drawdown: -8.6,
          var95: -2.1,
          stressTest: -14.5
        },
        sectorAllocation: [
          { name: 'Technology', value: 28.5, beta: 1.15, returns: 15.6, volatility: 18.2 },
          { name: 'Financial', value: 18.3, beta: 1.05, returns: 12.4, volatility: 14.8 },
          { name: 'Healthcare', value: 14.7, beta: 0.85, returns: 10.8, volatility: 12.6 },
          { name: 'Consumer Staples', value: 9.4, beta: 0.72, returns: 8.2, volatility: 9.5 },
          { name: 'Energy', value: 6.8, beta: 1.12, returns: 11.6, volatility: 16.8 },
          { name: 'Real Estate', value: 8.2, beta: 0.78, returns: 9.5, volatility: 11.2 },
          { name: 'Utilities', value: 5.6, beta: 0.65, returns: 7.8, volatility: 8.4 },
          { name: 'Other', value: 8.5, beta: 0.88, returns: 10.2, volatility: 13.1 }
        ],
        historicalPerformance: {
          '1m': generatePerformanceData(30, 0.5, 1.5),
          '3m': generatePerformanceData(90, 1.2, 3.5),
          '6m': generatePerformanceData(180, 3.8, 5.5),
          '1y': generatePerformanceData(365, 8.4, 12.8),
          '3y': generatePerformanceData(1095, 32.5, 40.2)
        },
        riskHeatmap: generateRiskHeatmap(),
        correlationMatrix: generateCorrelationMatrix()
      };
      
      setPortfolioData(mockData);
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
      const portfolioDailyChange = (portfolioReturn / days) + (Math.random() - 0.5) * 0.4;
      const benchmarkDailyChange = (benchmarkReturn / days) + (Math.random() - 0.5) * 0.3;
      
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
  
  // Helper function to generate a risk heatmap
  function generateRiskHeatmap() {
    const sectors = ['Technology', 'Financial', 'Healthcare', 'Consumer', 'Energy', 'Real Estate', 'Utilities'];
    const riskFactors = ['Market', 'Interest Rate', 'Credit', 'Liquidity', 'Inflation'];
    
    const heatmap = [];
    
    riskFactors.forEach(factor => {
      const sectorData = { factor };
      
      sectors.forEach(sector => {
        // Generate a risk score between 1 and 10
        sectorData[sector] = Math.floor(Math.random() * 10) + 1;
      });
      
      heatmap.push(sectorData);
    });
    
    return heatmap;
  }
  
  // Helper function to generate a correlation matrix
  function generateCorrelationMatrix() {
    const assets = ['US Stocks', 'Int\'l Stocks', 'US Bonds', 'Int\'l Bonds', 'Real Estate', 'Commodities', 'Cash'];
    
    const matrix = [];
    
    assets.forEach((asset1, i) => {
      const row = { asset: asset1 };
      
      assets.forEach((asset2, j) => {
        // If it's the same asset, correlation is 1
        if (i === j) {
          row[asset2] = 1;
        } else if (matrix.some(r => r.asset === asset2 && asset1 in r)) {
          // If we've already calculated this correlation, use the same value
          row[asset2] = matrix.find(r => r.asset === asset2)[asset1];
        } else {
          // Generate a random correlation between -1 and 1
          // Assets of similar types should be more correlated
          let baseCor;
          if (asset1.includes('Stocks') && asset2.includes('Stocks')) {
            baseCor = 0.7;
          } else if (asset1.includes('Bonds') && asset2.includes('Bonds')) {
            baseCor = 0.8;
          } else if ((asset1.includes('Stocks') && asset2.includes('Bonds')) || 
                     (asset1.includes('Bonds') && asset2.includes('Stocks'))) {
            baseCor = -0.2;
          } else {
            baseCor = 0.1;
          }
          
          // Add some randomness
          row[asset2] = Math.max(-1, Math.min(1, baseCor + (Math.random() - 0.5) * 0.4));
          row[asset2] = parseFloat(row[asset2].toFixed(2));
        }
      });
      
      matrix.push(row);
    });
    
    return matrix;
  }
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
  };
  
  const filterSectorData = (data) => {
    if (selectedSector === 'all') return data;
    return data.filter(item => item.name === selectedSector);
  };
  
  // Color scheme for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
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
        <p>Loading portfolio and risk data...</p>
      </div>
    );
  }
  
  return (
    <div className="portfolio-risk-container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Portfolio & Risk Management</h1>
        <p className="subtitle">Track, analyze, and optimize risk across client portfolios</p>
      </motion.div>
      
      <motion.div 
        className="portfolio-summary"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="summary-card" variants={itemVariants}>
          <h3>Total AUM</h3>
          <div className="summary-value">${(portfolioData.portfolioValue / 1000000).toFixed(2)}M</div>
          <div className="summary-trend positive">+3.2% <span>from last month</span></div>
        </motion.div>
        
        <motion.div className="summary-card" variants={itemVariants}>
          <h3>Clients</h3>
          <div className="summary-value">{portfolioData.clientCount}</div>
          <div className="summary-trend positive">+3 <span>new this quarter</span></div>
        </motion.div>
        
        <motion.div className="summary-card" variants={itemVariants}>
          <h3>Portfolio Beta</h3>
          <div className="summary-value">{portfolioData.riskMetrics.portfolioBeta}</div>
          <div className="summary-context">vs S&P 500 (1.0)</div>
        </motion.div>
        
        <motion.div className="summary-card" variants={itemVariants}>
          <h3>Volatility</h3>
          <div className="summary-value">{portfolioData.riskMetrics.volatility}%</div>
          <div className="summary-trend negative">+1.2% <span>from last quarter</span></div>
        </motion.div>
        
        <motion.div className="summary-card" variants={itemVariants}>
          <h3>Sharpe Ratio</h3>
          <div className="summary-value">{portfolioData.riskMetrics.sharpeRatio}</div>
          <div className="summary-trend positive">+0.21 <span>from last quarter</span></div>
        </motion.div>
        
        <motion.div className="summary-card" variants={itemVariants}>
          <h3>Max Drawdown</h3>
          <div className="summary-value">{portfolioData.riskMetrics.drawdown}%</div>
          <div className="summary-context">Past 12 months</div>
        </motion.div>
      </motion.div>
      
      <div className="portfolio-grid">
        <motion.div 
          className="card performance-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="card-header">
            <h2>Historical Performance</h2>
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
              <LineChart data={portfolioData.historicalPerformance[timeRange]}>
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
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  name="Portfolio"
                  stroke="#6a11cb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="Benchmark"
                  stroke="#ff8042"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Portfolio Return</span>
                <span className="metric-value positive">+{(portfolioData.historicalPerformance[timeRange][portfolioData.historicalPerformance[timeRange].length - 1].portfolio - 100).toFixed(2)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Benchmark Return</span>
                <span className="metric-value positive">+{(portfolioData.historicalPerformance[timeRange][portfolioData.historicalPerformance[timeRange].length - 1].benchmark - 100).toFixed(2)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Alpha</span>
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
            <h2>Sector Allocation</h2>
            <div className="sector-selector">
              <select 
                value={selectedSector}
                onChange={(e) => handleSectorChange(e.target.value)}
              >
                <option value="all">All Sectors</option>
                {portfolioData.sectorAllocation.map((sector) => (
                  <option key={sector.name} value={sector.name}>{sector.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="card-content allocation-grid">
            <div className="allocation-chart">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={filterSectorData(portfolioData.sectorAllocation)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {portfolioData.sectorAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="sector-metrics">
              <h3>Sector Risk Metrics</h3>
              <div className="sector-metrics-table">
                <table>
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Weight</th>
                      <th>Beta</th>
                      <th>Return</th>
                      <th>Volatility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterSectorData(portfolioData.sectorAllocation).map((sector) => (
                      <tr key={sector.name}>
                        <td>{sector.name}</td>
                        <td>{sector.value}%</td>
                        <td>{sector.beta}</td>
                        <td className="positive">{sector.returns}%</td>
                        <td>{sector.volatility}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card risk-heatmap-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <h2>Risk Factor Heatmap</h2>
          </div>
          
          <div className="card-content">
            <div className="heatmap-grid">
              <div className="heatmap-row heatmap-header">
                <div className="heatmap-cell header"></div>
                {portfolioData.riskHeatmap[0] && Object.keys(portfolioData.riskHeatmap[0])
                  .filter(key => key !== 'factor')
                  .map((sector) => (
                    <div key={sector} className="heatmap-cell header sector-header">{sector}</div>
                  ))
                }
              </div>
              
              {portfolioData.riskHeatmap.map((row, rowIndex) => (
                <div key={rowIndex} className="heatmap-row">
                  <div className="heatmap-cell factor-cell">{row.factor}</div>
                  {Object.keys(row)
                    .filter(key => key !== 'factor')
                    .map((sector, cellIndex) => {
                      const riskScore = row[sector];
                      const intensity = Math.min(1, riskScore / 10);
                      
                      return (
                        <div 
                          key={cellIndex} 
                          className="heatmap-cell" 
                          style={{ 
                            backgroundColor: `rgba(244, 67, 54, ${intensity})`,
                            color: intensity > 0.5 ? 'white' : 'black'
                          }}
                        >
                          {riskScore}
                        </div>
                      );
                    })
                  }
                </div>
              ))}
            </div>
            
            <div className="heatmap-legend">
              <div className="legend-title">Risk Intensity</div>
              <div className="legend-scale">
                <div className="legend-color" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}></div>
                <div className="legend-color" style={{ backgroundColor: 'rgba(244, 67, 54, 0.3)' }}></div>
                <div className="legend-color" style={{ backgroundColor: 'rgba(244, 67, 54, 0.5)' }}></div>
                <div className="legend-color" style={{ backgroundColor: 'rgba(244, 67, 54, 0.7)' }}></div>
                <div className="legend-color" style={{ backgroundColor: 'rgba(244, 67, 54, 0.9)' }}></div>
              </div>
              <div className="legend-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card correlation-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h2>Asset Correlation Matrix</h2>
          </div>
          
          <div className="card-content">
            <div className="correlation-matrix">
              <div className="matrix-row matrix-header">
                <div className="matrix-cell header"></div>
                {portfolioData.correlationMatrix[0] && Object.keys(portfolioData.correlationMatrix[0])
                  .filter(key => key !== 'asset')
                  .map((asset) => (
                    <div key={asset} className="matrix-cell header asset-header">{asset}</div>
                  ))
                }
              </div>
              
              {portfolioData.correlationMatrix.map((row, rowIndex) => (
                <div key={rowIndex} className="matrix-row">
                  <div className="matrix-cell asset-cell">{row.asset}</div>
                  {Object.keys(row)
                    .filter(key => key !== 'asset')
                    .map((asset, cellIndex) => {
                      const correlation = row[asset];
                      let backgroundColor;
                      
                      if (correlation === 1) {
                        backgroundColor = '#e0e0e0';
                      } else if (correlation > 0) {
                        backgroundColor = `rgba(0, 200, 83, ${Math.abs(correlation)})`;
                      } else {
                        backgroundColor = `rgba(244, 67, 54, ${Math.abs(correlation)})`;
                      }
                      
                      return (
                        <div 
                          key={cellIndex} 
                          className="matrix-cell" 
                          style={{ 
                            backgroundColor,
                            color: Math.abs(correlation) > 0.5 ? 'white' : 'black'
                          }}
                        >
                          {correlation}
                        </div>
                      );
                    })
                  }
                </div>
              ))}
            </div>
            
            <div className="correlation-legend">
              <div className="legend-title">Correlation</div>
              <div className="correlation-scale">
                <div className="scale-color negative" style={{ backgroundColor: 'rgba(244, 67, 54, 0.9)' }}></div>
                <div className="scale-color negative" style={{ backgroundColor: 'rgba(244, 67, 54, 0.6)' }}></div>
                <div className="scale-color negative" style={{ backgroundColor: 'rgba(244, 67, 54, 0.3)' }}></div>
                <div className="scale-color neutral" style={{ backgroundColor: '#e0e0e0' }}></div>
                <div className="scale-color positive" style={{ backgroundColor: 'rgba(0, 200, 83, 0.3)' }}></div>
                <div className="scale-color positive" style={{ backgroundColor: 'rgba(0, 200, 83, 0.6)' }}></div>
                <div className="scale-color positive" style={{ backgroundColor: 'rgba(0, 200, 83, 0.9)' }}></div>
              </div>
              <div className="scale-labels">
                <span>-1.0</span>
                <span>0</span>
                <span>+1.0</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card stress-test-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h2>Stress Test Scenarios</h2>
          </div>
          
          <div className="card-content">
            <div className="stress-test-scenarios">
              <div className="scenario">
                <div className="scenario-header">
                  <h3>Market Crash</h3>
                  <span className="impact-value negative">-{Math.abs(portfolioData.riskMetrics.stressTest)}%</span>
                </div>
                <p className="scenario-description">Estimated portfolio impact during a severe market downturn (2008 crisis scenario)</p>
                <div className="impact-bar">
                  <div 
                    className="impact-fill" 
                    style={{ 
                      width: `${Math.min(100, Math.abs(portfolioData.riskMetrics.stressTest) * 2)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="scenario">
                <div className="scenario-header">
                  <h3>Interest Rate Shock</h3>
                  <span className="impact-value negative">-9.3%</span>
                </div>
                <p className="scenario-description">Estimated portfolio impact during a 200 basis point rise in interest rates</p>
                <div className="impact-bar">
                  <div 
                    className="impact-fill" 
                    style={{ width: '18.6%' }}
                  ></div>
                </div>
              </div>
              
              <div className="scenario">
                <div className="scenario-header">
                  <h3>Inflation Surge</h3>
                  <span className="impact-value negative">-7.8%</span>
                </div>
                <p className="scenario-description">Estimated portfolio impact during a sudden spike in inflation (5% increase)</p>
                <div className="impact-bar">
                  <div 
                    className="impact-fill" 
                    style={{ width: '15.6%' }}
                  ></div>
                </div>
              </div>
              
              <div className="scenario">
                <div className="scenario-header">
                  <h3>Currency Crisis</h3>
                  <span className="impact-value negative">-6.2%</span>
                </div>
                <p className="scenario-description">Estimated portfolio impact during a severe USD devaluation</p>
                <div className="impact-bar">
                  <div 
                    className="impact-fill" 
                    style={{ width: '12.4%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="stress-test-summary">
              <div className="summary-metric">
                <h3>VaR (95%)</h3>
                <span className="metric-value">{portfolioData.riskMetrics.var95}%</span>
                <p className="metric-description">Daily value at risk with 95% confidence interval</p>
              </div>
              
              <div className="summary-metric">
                <h3>Expected Shortfall</h3>
                <span className="metric-value">-3.4%</span>
                <p className="metric-description">Average loss beyond VaR threshold</p>
              </div>
              
              <div className="summary-actions">
                <button className="action-btn">
                  <i className="fas fa-download"></i>
                  Export Risk Report
                </button>
                <button className="action-btn primary">
                  <i className="fas fa-flask"></i>
                  Run Custom Scenario
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioRiskManagement;