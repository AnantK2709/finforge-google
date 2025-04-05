import React from 'react';
import { motion } from 'framer-motion';
import './ClientActivityCard.css';

const ClientActivityCard = () => {
  // Mock data for client activities
  const activities = [
    {
      id: 1,
      clientName: 'Roberts Family Trust',
      clientId: 'C10582',
      activity: 'Sell Order',
      details: 'Sold $230,000 of technology stocks during market dip',
      timestamp: '2 hours ago',
      indicators: ['Panic Selling', 'Outside Risk Profile'],
      sentiment: 'negative'
    },
    {
      id: 2,
      clientName: 'Brown Holdings',
      clientId: 'C10876',
      activity: 'Account Login',
      details: 'Logged in 14 times in last 24 hours',
      timestamp: '4 hours ago',
      indicators: ['Unusual Activity', 'Anxiety Signal'],
      sentiment: 'warning'
    },
    {
      id: 3,
      clientName: 'Wilson Family Office',
      clientId: 'C10789',
      activity: 'Portfolio Review',
      details: 'Scheduled an urgent portfolio review meeting',
      timestamp: '1 day ago',
      indicators: ['Seeking Reassurance'],
      sentiment: 'warning'
    },
    {
      id: 4,
      clientName: 'Davis Capital',
      clientId: 'C10149',
      activity: 'Buy Order',
      details: 'Purchased $150,000 of value stocks during market dip',
      timestamp: '2 days ago',
      indicators: ['Strategic Buying', 'Within Risk Profile'],
      sentiment: 'positive'
    }
  ];
  
  return (
    <div className="client-activity-container">
      {activities.map((activity, index) => (
        <motion.div 
          key={activity.id}
          className={`activity-item ${activity.sentiment}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="activity-header">
            <div className="client-info">
              <h3>{activity.clientName}</h3>
              <span className="client-id">{activity.clientId}</span>
            </div>
            <div className="activity-time">
              <i className="far fa-clock"></i>
              <span>{activity.timestamp}</span>
            </div>
          </div>
          
          <div className="activity-content">
            <div className="activity-type">
              <i className={`fas ${
                activity.activity === 'Sell Order' ? 'fa-arrow-down' :
                activity.activity === 'Buy Order' ? 'fa-arrow-up' :
                activity.activity === 'Account Login' ? 'fa-sign-in-alt' :
                'fa-calendar-check'
              }`}></i>
              <span>{activity.activity}</span>
            </div>
            <p className="activity-details">{activity.details}</p>
          </div>
          
          <div className="activity-indicators">
            {activity.indicators.map((indicator, i) => (
              <div key={i} className={`indicator-badge ${activity.sentiment}`}>
                {indicator}
              </div>
            ))}
          </div>
          
          <div className="activity-actions">
            <button className="activity-btn">Contact Client</button>
            <button className="activity-btn">View History</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ClientActivityCard;