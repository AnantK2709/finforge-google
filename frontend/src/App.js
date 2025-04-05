import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Internal Pages
import InternalDashboard from './pages/internal/Dashboard';
import ClientInsightsHub from './pages/internal/ClientInsightsHub';
import PortfolioRiskManagement from './pages/internal/PortfolioRiskManagement';
import LiquidityIntelligence from './pages/internal/LiquidityIntelligence';

// External Pages
import ExternalDashboard from './pages/external/Dashboard';
import MyPortfolioRisk from './pages/external/MyPortfolioRisk';
import SmartStrategyPlanner from './pages/external/SmartStrategyPlanner';
import MyBehavior from './pages/external/MyBehavior';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import SwitchInterface from './components/common/SwitchInterface';
import './App.css';

function App() {
  const [interfaceType, setInterfaceType] = useState('internal'); // 'internal' or 'external'

  const handleSwitchInterface = () => {
    setInterfaceType(interfaceType === 'internal' ? 'external' : 'internal');
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar interfaceType={interfaceType} />
        <div className="main-content">
          <Sidebar interfaceType={interfaceType} />
          <motion.div 
            className="page-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SwitchInterface 
              interfaceType={interfaceType} 
              onSwitch={handleSwitchInterface} 
            />
            
            <Routes>
              {/* Internal Routes */}
              {interfaceType === 'internal' && (
                <>
                  <Route path="/internal/dashboard" element={<InternalDashboard />} />
                  <Route path="/internal/client-insights" element={<ClientInsightsHub />} />
                  <Route path="/internal/portfolio-risk" element={<PortfolioRiskManagement />} />
                  <Route path="/internal/liquidity" element={<LiquidityIntelligence />} />
                  <Route path="*" element={<Navigate to="/internal/dashboard" replace />} />
                </>
              )}

              {/* External Routes */}
              {interfaceType === 'external' && (
                <>
                  <Route path="/external/dashboard" element={<ExternalDashboard />} />
                  <Route path="/external/portfolio-risk" element={<MyPortfolioRisk />} />
                  <Route path="/external/strategy-planner" element={<SmartStrategyPlanner />} />
                  <Route path="/external/behavior" element={<MyBehavior />} />
                  <Route path="*" element={<Navigate to="/external/dashboard" replace />} />
                </>
              )}
              
              {/* Default Route */}
              <Route path="/" element={
                <Navigate to={`/${interfaceType}/dashboard`} replace />
              } />
            </Routes>
          </motion.div>
        </div>
      </div>
    </Router>
  );
}

export default App;