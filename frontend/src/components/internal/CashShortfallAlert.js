import React from 'react';
import { motion } from 'framer-motion';
import './CashShortfallAlert.css';

const CashShortfallAlert = ({ alert }) => {
  // Define severity based on days until shortfall
  const getSeverity = (days) => {
    if (days <= 7) return 'high';
    if (days <= 14) return 'medium';
    return 'low';
  };
  
  const severity = getSeverity(alert.daysUntilShortfall);
  
  return (
    <motion.div 
      className={`shortfall-alert ${severity}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="alert-header">
        <div className="client-info">
          <h3>{alert.clientName}</h3>
          <span className="client-id">{alert.clientId}</span>
        </div>
        <div className={`severity-badge ${severity}`}>
          {severity === 'high' ? 'Urgent' : severity === 'medium' ? 'Warning' : 'Monitor'}
        </div>
      </div>
      
      <div className="alert-details">
        <div className="detail-item">
          <span className="detail-label">Shortfall in</span>
          <span className="detail-value">{alert.daysUntilShortfall} days</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Amount</span>
          <span className="detail-value">${alert.amount.toLocaleString()}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Probability</span>
          <span className="detail-value">{alert.probability}%</span>
        </div>
      </div>
      
      <div className="alert-recommendation">
        <i className="fas fa-lightbulb"></i>
        <span>{alert.recommendation}</span>
      </div>
      
      <div className="alert-actions">
        <button className="alert-btn primary">Take Action</button>
        <button className="alert-btn secondary">Analyze Cash Flow</button>
      </div>
    </motion.div>
  );
};

export default CashShortfallAlert;