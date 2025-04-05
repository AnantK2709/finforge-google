import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

// Components
import PortfolioSummaryCard from '../../components/internal/PortfolioSummaryCard';
import CashShortfallAlert from '../../components/internal/CashShortfallAlert';
import RiskHeatmapCard from '../../components/internal/RiskHeatmapCard';
import ClientActivityCard from '../../components/internal/ClientActivityCard';

const InternalDashboard = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [cashAlerts, setCashAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating data fetch - in a real app, this would be API calls
    const fetchData = async () => {
      setIsLoading(true);
      
      // Mock data for demonstration
      setTimeout(() => {
        setPortfolioData({
          totalAssets: 982465000,
          totalClients: 187,
          avgClientAssets: 5253823,
          sectorAllocation: [
            { name: 'Technology', value: 32 },
            { name: 'Finance', value: 28 },
            { name: 'Healthcare', value: 15 },
            { name: 'Energy', value: 10 },
            { name: 'Consumer', value: 15 }
          ],
          monthlyPerformance: [
            { month: 'Jan', return: 2.3 },
            { month: 'Feb', return: 1.8 },
            { month: 'Mar', return: -0.7 },
            { month: 'Apr', return: 3.2 },
            { month: 'May', return: 2.9 },
            { month: 'Jun', return: 1.2 },
            { month: 'Jul', return: -0.3 },
            { month: 'Aug', return: 2.7 },
            { month: 'Sep', return: 3.1 },
            { month: 'Oct', return: 1.9 },
            { month: 'Nov', return: 0.8 },
            { month: 'Dec', return: 2.1 }
          ],
          riskDistribution: [
            { level: 'Very Low', clients: 23 },
            { level: 'Low', clients: 42 },
            { level: 'Moderate', clients: 68 },
            { level: 'High', clients: 37 },
            { level: 'Very High', clients: 17 }
          ]
        });
        
        setCashAlerts([
          { 
            id: 1, 
            clientName: 'Roberts Family Trust', 
            clientId: 'C10582', 
            daysUntilShortfall: 12, 
            amount: 75000, 
            probability: 87, 
            recommendation: 'Reallocate funds from long-term investment accounts'
          },
          { 
            id: 2, 
            clientName: 'Westbrook Holdings', 
            clientId: 'C10832', 
            daysUntilShortfall: 18, 
            amount: 145000, 
            probability: 76, 
            recommendation: 'Draw from credit line'
          },
          { 
            id: 3, 
            clientName: 'Chen Family Office', 
            clientId: 'C10347', 
            daysUntilShortfall: 24, 
            amount: 52000, 
            probability: 65, 
            recommendation: 'Liquidate short-term treasury positions'
          }
        ]);
        
        setIsLoading(false);
      }, 1200);
    };
    
    fetchData();
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Advisor Dashboard</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleString()}</p>
      </motion.div>
      
      <motion.div 
        className="dashboard-stats"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <h3>Total Assets</h3>
          <div className="stat-value">${(portfolioData.totalAssets / 1000000).toFixed(2)}M</div>
          <div className="stat-change positive">+2.8% <span>this month</span></div>
        </motion.div>
        
        <motion.div className="stat-card" variants={itemVariants}>
          <h3>Total Clients</h3>
          <div className="stat-value">{portfolioData.totalClients}</div>
          <div className="stat-change positive">+5 <span>new this month</span></div>
        </motion.div>
        
        <motion.div className="stat-card" variants={itemVariants}>
          <h3>Avg. Client Assets</h3>
          <div className="stat-value">${(portfolioData.avgClientAssets / 1000000).toFixed(2)}M</div>
          <div className="stat-change positive">+1.2% <span>this month</span></div>
        </motion.div>
        
        <motion.div className="stat-card" variants={itemVariants}>
          <h3>Cash Shortfall Alerts</h3>
          <div className="stat-value">{cashAlerts.length}</div>
          <div className="stat-change neutral">-1 <span>from last week</span></div>
        </motion.div>
      </motion.div>
      
      <div className="dashboard-grid">
        <motion.div 
          className="card chart-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="card-header">
            <h2 className="card-title">Monthly Performance</h2>
            <div className="card-actions">
              <select className="time-range-select">
                <option>Last 12 Months</option>
                <option>YTD</option>
                <option>Last 3 Years</option>
              </select>
            </div>
          </div>
          
          <div className="card-content">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={portfolioData.monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Return']} />
                <Area 
                  type="monotone" 
                  dataKey="return" 
                  stroke="#6a11cb" 
                  fill="url(#colorReturn)" 
                  activeDot={{ r: 8 }} 
                />
                <defs>
                  <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6a11cb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6a11cb" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div 
          className="card chart-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <div className="card-header">
            <h2 className="card-title">Sector Allocation</h2>
          </div>
          
          <div className="card-content">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={portfolioData.sectorAllocation}
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
        </motion.div>
        
        <motion.div 
          className="card chart-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <h2 className="card-title">Risk Distribution</h2>
          </div>
          
          <div className="card-content">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={portfolioData.riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} clients`, 'Count']} />
                <Bar dataKey="clients" fill="#8884d8">
                  {portfolioData.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      index === 0 ? '#00C49F' : 
                      index === 1 ? '#82ca9d' : 
                      index === 2 ? '#FFBB28' : 
                      index === 3 ? '#FF8042' : 
                      '#FF4842'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div 
          className="card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h2 className="card-title">Cash Shortfall Alerts</h2>
            <div className="card-actions">
              <button className="btn btn-outline">View All</button>
            </div>
          </div>
          
          <div className="card-content">
            {cashAlerts.map((alert) => (
              <CashShortfallAlert key={alert.id} alert={alert} />
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          className="card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h2 className="card-title">Client Risk Heatmap</h2>
            <div className="card-actions">
              <select className="time-range-select">
                <option>Response to Market Volatility</option>
                <option>Risk Tolerance</option>
                <option>Behavioral Patterns</option>
              </select>
            </div>
          </div>
          
          <div className="card-content">
            <RiskHeatmapCard />
          </div>
        </motion.div>
        
        <motion.div 
          className="card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <h2 className="card-title">Recent Client Activity</h2>
            <div className="card-actions">
              <button className="btn btn-outline">View All</button>
            </div>
          </div>
          
          <div className="card-content">
            <ClientActivityCard />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InternalDashboard;