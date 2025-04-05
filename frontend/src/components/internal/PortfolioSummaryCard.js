import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './PortfolioSummaryCard.css';

const PortfolioSummaryCard = ({ clientData }) => {
  // Check if data is available
  if (!clientData) {
    return (
      <div className="portfolio-summary-card loading">
        <div className="loading-spinner"></div>
        <p>Loading portfolio data...</p>
      </div>
    );
  }
  
  // Format asset allocation data for pie chart
  const assetAllocationData = clientData.assetAllocation.map(asset => ({
    name: asset.category,
    value: asset.percentage
  }));
  
  // Calculate performance metrics
  const totalPortfolioValue = clientData.portfolioValue;
  const ytdPerformance = clientData.performance.ytd;
  const isYtdPositive = ytdPerformance >= 0;
  
  // Calculate risk metrics
  const riskScore = clientData.riskMetrics.score; // Assuming scale of 1-10
  const volatility = clientData.riskMetrics.volatility;
  const sharpeRatio = clientData.riskMetrics.sharpeRatio;
  
  // Color scheme for asset allocation
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <motion.div 
      className="portfolio-summary-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-header">
        <h2 className="client-name">{clientData.name}</h2>
        <div className="card-actions">
          <button className="view-details-btn">
            <i className="fas fa-chart-pie"></i>
            View Details
          </button>
        </div>
      </div>
      
      <div className="portfolio-value-section">
        <div className="portfolio-value">
          <span className="value-label">Total Portfolio Value</span>
          <span className="value-amount">${totalPortfolioValue.toLocaleString()}</span>
        </div>
        <div className="performance-metrics">
          <div className="performance-item">
            <span className="performance-label">YTD Return</span>
            <span className={`performance-value ${isYtdPositive ? 'positive' : 'negative'}`}>
              {isYtdPositive ? '+' : ''}{ytdPerformance}%
            </span>
          </div>
          <div className="performance-item">
            <span className="performance-label">1Y Return</span>
            <span className={`performance-value ${clientData.performance.oneYear >= 0 ? 'positive' : 'negative'}`}>
              {clientData.performance.oneYear >= 0 ? '+' : ''}{clientData.performance.oneYear}%
            </span>
          </div>
          <div className="performance-item">
            <span className="performance-label">3Y Return</span>
            <span className={`performance-value ${clientData.performance.threeYear >= 0 ? 'positive' : 'negative'}`}>
              {clientData.performance.threeYear >= 0 ? '+' : ''}{clientData.performance.threeYear}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="portfolio-sections">
        <div className="allocation-section">
          <h3>Asset Allocation</h3>
          <div className="allocation-chart">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={assetAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="risk-section">
          <h3>Risk Profile</h3>
          <div className="risk-metrics">
            <div className="risk-metric-item">
              <span className="metric-label">Risk Score</span>
              <div className="risk-score-bar">
                <div 
                  className="risk-score-fill" 
                  style={{ width: `${(riskScore / 10) * 100}%` }}
                ></div>
                <span className="risk-score-value">{riskScore}/10</span>
              </div>
              <span className="risk-category">
                {riskScore <= 3 ? 'Conservative' : 
                 riskScore <= 6 ? 'Moderate' : 'Aggressive'}
              </span>
            </div>
            
            <div className="metric-row">
              <div className="risk-metric-item small">
                <span className="metric-label">Volatility</span>
                <span className="metric-value">{volatility}%</span>
              </div>
              
              <div className="risk-metric-item small">
                <span className="metric-label">Sharpe Ratio</span>
                <span className="metric-value">{sharpeRatio}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="action-items">
        <h3>Recommended Actions</h3>
        <ul className="action-list">
          {clientData.recommendedActions.map((action, index) => (
            <li key={index} className={`action-item ${action.priority}`}>
              <div className="action-icon">
                <i className={`fas ${
                  action.type === 'rebalance' ? 'fa-balance-scale' :
                  action.type === 'review' ? 'fa-search' :
                  action.type === 'tax' ? 'fa-file-invoice-dollar' : 'fa-exclamation-circle'
                }`}></i>
              </div>
              <div className="action-content">
                <span className="action-title">{action.title}</span>
                <span className="action-description">{action.description}</span>
              </div>
              <div className="action-priority">
                <span className={`priority-badge ${action.priority}`}>{action.priority}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="card-footer">
        <div className="last-updated">
          <i className="far fa-clock"></i>
          <span>Last Updated: {new Date(clientData.lastUpdate).toLocaleDateString()}</span>
        </div>
        <div className="portfolio-actions">
          <button className="action-btn">Contact Client</button>
          <button className="action-btn">Schedule Review</button>
        </div>
      </div>
    </motion.div>
  );
};

export default PortfolioSummaryCard;