import React from 'react';
import { motion } from 'framer-motion';
import './RebalancingRecommendations.css';

const RebalancingRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="no-recommendations">
        <i className="fas fa-check-circle"></i>
        <p>No rebalancing recommendations at this time.</p>
      </div>
    );
  }
  
  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return (
    <div className="rebalancing-recommendations">
      {sortedRecommendations.map((recommendation, index) => (
        <motion.div 
          key={recommendation.id} 
          className={`recommendation-card ${recommendation.priority}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="recommendation-header">
            <div className="recommendation-info">
              <h3>{recommendation.action}</h3>
              <span className="recommendation-date">
                <i className="far fa-calendar"></i>
                {recommendation.date}
              </span>
            </div>
            <div className={`priority-badge ${recommendation.priority}`}>
              {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
            </div>
          </div>
          
          <div className="recommendation-details">
            <div className="amount-pill">
              <span className="amount-label">Amount:</span>
              <span className="amount-value">${recommendation.amount.toLocaleString()}</span>
            </div>
            <p className="recommendation-reason">{recommendation.reason}</p>
          </div>
          
          <div className="recommendation-actions">
            <button className="action-btn primary">Execute</button>
            <button className="action-btn secondary">Schedule</button>
            <button className="action-btn tertiary">Ignore</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RebalancingRecommendations;