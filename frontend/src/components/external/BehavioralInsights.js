import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './BehavioralInsights.css';

const BehavioralInsights = ({ insights, moodData }) => {
  // Calculate behavioral patterns
  const behavioralPatterns = useMemo(() => {
    if (!moodData || moodData.length === 0) return null;
    
    // Count mood distributions
    const moodDistribution = moodData.reduce((acc, entry) => {
      const mood = entry.mood;
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    // Analyze action patterns
    const actionsByMood = moodData.reduce((acc, entry) => {
      const mood = entry.mood;
      const action = entry.actionTaken;
      
      if (!acc[mood]) {
        acc[mood] = {
          sold: 0,
          bought: 0,
          held: 0,
          pending: 0
        };
      }
      
      acc[mood][action] = (acc[mood][action] || 0) + 1;
      
      return acc;
    }, {});
    
    // Calculate correlation between market changes and mood
    const moodMarketCorrelation = moodData.reduce((acc, entry) => {
      const change = parseFloat(entry.portfolioChangePct);
      const mood = entry.mood;
      
      if (!acc[mood]) {
        acc[mood] = {
          count: 0,
          totalChange: 0,
          avgChange: 0
        };
      }
      
      acc[mood].count += 1;
      acc[mood].totalChange += change;
      acc[mood].avgChange = acc[mood].totalChange / acc[mood].count;
      
      return acc;
    }, {});
    
    return {
      moodDistribution,
      actionsByMood,
      moodMarketCorrelation
    };
  }, [moodData]);
  
  // Format data for charts
  const moodDistributionData = useMemo(() => {
    if (!behavioralPatterns) return [];
    
    return Object.entries(behavioralPatterns.moodDistribution).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count
    }));
  }, [behavioralPatterns]);
  
  // Color mapping for moods
  const moodColors = {
    'Confident': '#4caf50',
    'Neutral': '#2196f3',
    'Anxious': '#f44336'
  };
  
  // Identify behavioral biases
  const identifyBiases = () => {
    if (!behavioralPatterns) return [];
    
    const biases = [];
    
    // Loss aversion bias
    if (behavioralPatterns.actionsByMood.anxious && 
        behavioralPatterns.actionsByMood.anxious.sold > behavioralPatterns.actionsByMood.anxious.bought) {
      biases.push({
        name: 'Loss Aversion',
        description: 'You tend to sell when feeling anxious, possibly to avoid further losses. This may lead to selling at market bottoms.',
        impactLevel: 'High',
        recommendation: 'Consider implementing a 48-hour reflection period before selling during market downturns.'
      });
    }
    
    // Overconfidence bias
    if (behavioralPatterns.actionsByMood.confident && 
        behavioralPatterns.actionsByMood.confident.bought > behavioralPatterns.actionsByMood.confident.sold) {
      biases.push({
        name: 'Overconfidence',
        description: 'You tend to increase buying activity when feeling confident. This could lead to excessive risk-taking during market peaks.',
        impactLevel: 'Medium',
        recommendation: 'Maintain a consistent investment strategy regardless of emotional state. Consider dollar-cost averaging.'
      });
    }
    
    // Recency bias
    const recentEntries = moodData.slice(0, 5);
    const recentMoods = recentEntries.map(entry => entry.mood);
    const allSameMood = recentMoods.every(mood => mood === recentMoods[0]);
    
    if (allSameMood && recentEntries.length >= 3) {
      biases.push({
        name: 'Recency Bias',
        description: 'Your recent mood entries show a consistent pattern, suggesting you may be overly influenced by recent market events.',
        impactLevel: 'Medium',
        recommendation: 'Take a longer-term perspective. Review your investment performance over multiple time frames.'
      });
    }
    
    // Add some default biases if none detected
    if (biases.length === 0) {
      biases.push({
        name: 'Confirmation Bias',
        description: 'You may be seeking information that confirms your existing beliefs about the market.',
        impactLevel: 'Low',
        recommendation: 'Actively seek contrary opinions and alternative market perspectives.'
      });
      
      biases.push({
        name: 'Anchoring Bias',
        description: 'You might be overly focused on specific price points or past performance.',
        impactLevel: 'Medium',
        recommendation: 'Evaluate investments based on current fundamentals and future prospects, not past prices.'
      });
    }
    
    return biases;
  };
  
  const biases = useMemo(() => identifyBiases(), [behavioralPatterns, moodData]);
  
  if (!insights && (!moodData || moodData.length === 0)) {
    return (
      <div className="no-insights-message">
        <i className="fas fa-brain"></i>
        <p>Keep adding journal entries to receive personalized behavioral insights.</p>
      </div>
    );
  }
  
  return (
    <div className="behavioral-insights-container">
      <div className="insights-header">
        <h2>Your Behavioral Profile</h2>
        <p className="insights-description">
          Analysis based on {moodData.length} journal entries and market interactions
        </p>
      </div>
      
      <div className="insights-grid">
        <motion.div 
          className="ai-insight-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="insight-card-header">
            <i className="fas fa-robot"></i>
            <h3>AI-Generated Insight</h3>
          </div>
          <div className="insight-content">
            <p>{insights || "Based on your mood patterns, you tend to experience anxiety during market downturns, which may lead to reactive selling. Consider implementing a cooling-off period before making investment decisions during volatile markets."}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="mood-distribution-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3>Mood Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={moodDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {moodDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={moodColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="behavioral-biases"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3>Detected Behavioral Biases</h3>
        <div className="biases-list">
          {biases.map((bias, index) => (
            <motion.div 
              key={bias.name}
              className="bias-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="bias-header">
                <h4>{bias.name}</h4>
                <span className={`impact-badge ${bias.impactLevel.toLowerCase()}`}>
                  {bias.impactLevel} Impact
                </span>
              </div>
              <p className="bias-description">{bias.description}</p>
              <div className="bias-recommendation">
                <i className="fas fa-lightbulb"></i>
                <p>{bias.recommendation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="action-breakdown"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3>Actions by Emotional State</h3>
        <div className="action-grid">
          {behavioralPatterns && Object.entries(behavioralPatterns.actionsByMood).map(([mood, actions]) => (
            <div key={mood} className={`action-card mood-${mood}`}>
              <h4>{mood.charAt(0).toUpperCase() + mood.slice(1)} State</h4>
              <div className="action-stats">
                <div className="action-stat">
                  <span className="stat-label">Bought</span>
                  <span className="stat-value">{actions.bought || 0} times</span>
                </div>
                <div className="action-stat">
                  <span className="stat-label">Sold</span>
                  <span className="stat-value">{actions.sold || 0} times</span>
                </div>
                <div className="action-stat">
                  <span className="stat-label">Held</span>
                  <span className="stat-value">{actions.held || 0} times</span>
                </div>
              </div>
              <div className="market-correlation">
                <span className="correlation-label">Average Market Change</span>
                <span className={`correlation-value ${behavioralPatterns.moodMarketCorrelation[mood].avgChange >= 0 ? 'positive' : 'negative'}`}>
                  {behavioralPatterns.moodMarketCorrelation[mood].avgChange >= 0 ? '+' : ''}
                  {behavioralPatterns.moodMarketCorrelation[mood].avgChange.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      
      <div className="insights-actions">
        <button className="action-btn">
          <i className="fas fa-file-pdf"></i>
          Download Behavioral Report
        </button>
        <button className="action-btn">
          <i className="fas fa-chalkboard-teacher"></i>
          Schedule Coaching Session
        </button>
      </div>
    </div>
  );
};

export default BehavioralInsights;