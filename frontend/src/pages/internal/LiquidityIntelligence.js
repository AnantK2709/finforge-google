import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './LiquidityIntelligence.css';

// Import components
import CashFlowModelingTool from '../../components/internal/CashFlowModelingTool';
import LiquidityForecast from '../../components/internal/LiquidityForecast';
import RebalancingRecommendations from '../../components/internal/RebalancingRecommendations';
import CreditLineSuggestions from '../../components/internal/CreditLineSuggestions';

const LiquidityIntelligence = () => {
  const [liquidityData, setLiquidityData] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forecastData, setForecastData] = useState(null);
  const [rebalancingData, setRebalancingData] = useState(null);

  // Define clients
  const clients = [
    { id: 'C10582', name: 'Roberts Family Trust', assets: 12500000 },
    { id: 'C10832', name: 'Westbrook Holdings', assets: 18750000 },
    { id: 'C10347', name: 'Chen Family Office', assets: 9200000 },
    { id: 'C10876', name: 'Brown Holdings', assets: 15600000 },
    { id: 'C10149', name: 'Davis Capital', assets: 8350000 }
  ];

  useEffect(() => {
    // Set default active client
    if (clients.length > 0 && !activeClient) {
      setActiveClient(clients[0]);
    }
  }, [clients]);

  useEffect(() => {
    // Fetch data when active client changes
    if (activeClient) {
      fetchLiquidityData();
    }
  }, [activeClient]);

  const fetchLiquidityData = async () => {
    setIsLoading(true);
    
    try {
      // This would be replaced with real API calls in production
      // Using the backend endpoints defined in test_fast.py and main.py
      
      // Example API call to fetch forecast data
      // In a real implementation, you would call your backend endpoint
      /*
      const forecastResponse = await axios.get('/api/forecast', {
        params: {
          start_date: '2023-01-01',
          end_date: '2023-12-31',
          periods: 30,
          current_cash_balance: 1000000
        }
      });
      
      setForecastData(forecastResponse.data);
      */
      
      // Mock data for demonstration
      setTimeout(() => {
        // Generate synthetic cash flow data
        const now = new Date();
        const cashFlowData = Array.from({ length: 90 }, (_, i) => {
          const date = new Date();
          date.setDate(now.getDate() + i);
          
          // Generate some random data with a trend
          const baseValue = 100000;
          const trendFactor = Math.sin(i / 30 * Math.PI) * 50000;
          const randomFactor = (Math.random() - 0.5) * 30000;
          
          let netCashFlow = baseValue + trendFactor + randomFactor;
          
          // Add some spikes for visual interest
          if (i % 30 === 15) netCashFlow -= 120000; // Major outflow
          if (i % 45 === 5) netCashFlow += 200000; // Major inflow
          
          // Calculate running balance starting at 500,000
          const runningBalance = i === 0 ? 500000 + netCashFlow : null; // Only set for first item
          
          return {
            date: date.toISOString().split('T')[0],
            netCashFlow: Math.round(netCashFlow),
            runningBalance: runningBalance,
            isProjected: i > 30,
            threshold: 200000
          };
        });

        // Create forecasted balance by accumulating net cash flow
        let balance = 500000;
        cashFlowData.forEach(day => {
          balance += day.netCashFlow;
          day.runningBalance = Math.round(balance);
        });
        
        // Generate rebalancing recommendations
        const recommendations = [
          {
            id: 1,
            date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            action: 'Transfer from Long-term to Operating',
            amount: 150000,
            reason: 'Projected cash shortfall in 7 days',
            priority: 'high'
          },
          {
            id: 2,
            date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            action: 'Transfer from Operating to Investment',
            amount: 300000,
            reason: 'Excess liquidity detected',
            priority: 'medium'
          },
          {
            id: 3,
            date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            action: 'Prepare for quarterly tax payment',
            amount: 85000,
            reason: 'Scheduled tax obligation',
            priority: 'medium'
          },
          {
            id: 4,
            date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            action: 'Consider short-term credit line',
            amount: 100000,
            reason: 'Bridge seasonal cash flow gap',
            priority: 'low'
          }
        ];
        
        setLiquidityData(cashFlowData);
        setRebalancingData(recommendations);
        setIsLoading(false);
      }, 1200);
      
    } catch (error) {
      console.error('Error fetching liquidity data:', error);
      setIsLoading(false);
    }
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setActiveClient(selectedClient);
  };
  
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
        <p>Loading liquidity data...</p>
      </div>
    );
  }

  return (
    <div className="liquidity-container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Liquidity Intelligence</h1>
        <p className="subtitle">Cash flow forecasting and optimization tools</p>
      </motion.div>
      
      <div className="client-selector">
        <label>Select Client:</label>
        <select 
          value={activeClient?.id || ''}
          onChange={(e) => handleClientChange(e.target.value)}
        >
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.id})
            </option>
          ))}
        </select>
        
        {activeClient && (
          <div className="client-info-pill">
            <span className="client-name">{activeClient.name}</span>
            <span className="client-assets">${(activeClient.assets / 1000000).toFixed(2)}M AUM</span>
          </div>
        )}
      </div>
      
      <motion.div 
        className="liquidity-dashboard"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="card" variants={itemVariants}>
          <div className="card-header">
            <h2 className="card-title">90-Day Cash Flow Projection</h2>
            <div className="card-actions">
              <button className="btn btn-outline">Export</button>
              <button className="btn btn-outline">Share</button>
            </div>
          </div>
          
          <div className="card-content chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={liquidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  tick={{ fontSize: 12 }}
                  interval={14}
                />
                <YAxis 
                  tickFormatter={(value) => `$${Math.abs(value / 1000)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Net Cash Flow']}
                  labelFormatter={(date) => `Date: ${date}`}
                />
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="netCashFlow"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorInflow)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div className="liquidity-grid" variants={containerVariants}>
          <motion.div className="card" variants={itemVariants}>
            <div className="card-header">
              <h2 className="card-title">Cash Flow Modeling Tool</h2>
              <div className="card-actions">
                <button className="btn btn-primary">Run Simulation</button>
              </div>
            </div>
            
            <div className="card-content">
              <CashFlowModelingTool client={activeClient} />
            </div>
          </motion.div>
          
          <motion.div className="card" variants={itemVariants}>
            <div className="card-header">
              <h2 className="card-title">Fund Rebalancing Recommendations</h2>
              <div className="card-actions">
                <button className="btn btn-outline">View All</button>
              </div>
            </div>
            
            <div className="card-content">
              <RebalancingRecommendations recommendations={rebalancingData} />
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div className="liquidity-grid" variants={containerVariants}>
          <motion.div className="card" variants={itemVariants}>
            <div className="card-header">
              <h2 className="card-title">Monthly Liquidity Forecast</h2>
              <div className="card-actions">
                <select className="time-range-select">
                  <option>Next 3 Months</option>
                  <option>Next 6 Months</option>
                  <option>Next 12 Months</option>
                </select>
              </div>
            </div>
            
            <div className="card-content">
              <LiquidityForecast data={liquidityData} />
            </div>
          </motion.div>
          
          <motion.div className="card" variants={itemVariants}>
            <div className="card-header">
              <h2 className="card-title">Credit Line Suggestions</h2>
            </div>
            
            <div className="card-content">
              <CreditLineSuggestions client={activeClient} liquidityData={liquidityData} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LiquidityIntelligence;