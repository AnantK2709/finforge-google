import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './RiskHeatmapCard.css';

const RiskHeatmapCard = () => {
  // Mock data for risk heatmap
  const riskData = [
    { client: 'Smith & Family', id: 'C10223', volatilityResponse: 8, riskTolerance: 6, behavioralPattern: 7 },
    { client: 'Johnson Trust', id: 'C10542', volatilityResponse: 2, riskTolerance: 3, behavioralPattern: 2 },
    { client: 'Williams Investments', id: 'C10305', volatilityResponse: 5, riskTolerance: 4, behavioralPattern: 5 },
    { client: 'Brown Holdings', id: 'C10876', volatilityResponse: 9, riskTolerance: 8, behavioralPattern: 9 },
    { client: 'Davis Capital', id: 'C10149', volatilityResponse: 3, riskTolerance: 2, behavioralPattern: 4 },
    { client: 'Miller Foundation', id: 'C10621', volatilityResponse: 7, riskTolerance: 7, behavioralPattern: 6 },
    { client: 'Wilson Family Office', id: 'C10789', volatilityResponse: 4, riskTolerance: 5, behavioralPattern: 3 },
    { client: 'Moore Enterprises', id: 'C10412', volatilityResponse: 6, riskTolerance: 7, behavioralPattern: 8 }
  ];

  const [highlightedClient, setHighlightedClient] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('volatilityResponse');

  // Function to get color based on risk score (1-10)
  const getRiskColor = (score) => {
    if (score <= 3) return '#00C49F'; // Low risk
    if (score <= 7) return '#FFBB28'; // Medium risk
    return '#FF8042'; // High risk
  };

  // Function to get the opacity based on risk score (1-10)
  const getRiskOpacity = (score) => {
    return 0.4 + (score / 10) * 0.6; // Min opacity 0.4, max 1.0
  };

  return (
    <div className="risk-heatmap-container">
      <div className="heatmap-controls">
        <div className="metric-selector">
          <button 
            className={`metric-btn ${selectedMetric === 'volatilityResponse' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('volatilityResponse')}
          >
            Volatility Response
          </button>
          <button 
            className={`metric-btn ${selectedMetric === 'riskTolerance' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('riskTolerance')}
          >
            Risk Tolerance
          </button>
          <button 
            className={`metric-btn ${selectedMetric === 'behavioralPattern' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('behavioralPattern')}
          >
            Behavioral Pattern
          </button>
        </div>
        <div className="risk-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#00C49F' }}></div>
            <span>Low Risk (1-3)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFBB28' }}></div>
            <span>Medium Risk (4-7)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF8042' }}></div>
            <span>High Risk (8-10)</span>
          </div>
        </div>
      </div>

      <div className="heatmap-grid">
        {riskData.map((client) => {
          const riskScore = client[selectedMetric];
          const color = getRiskColor(riskScore);
          const opacity = getRiskOpacity(riskScore);
          
          return (
            <motion.div 
              key={client.id}
              className={`heatmap-cell ${highlightedClient === client.id ? 'highlighted' : ''}`}
              style={{ 
                backgroundColor: color,
                opacity: opacity
              }}
              whileHover={{ scale: 1.05, opacity: 1 }}
              onClick={() => setHighlightedClient(client.id === highlightedClient ? null : client.id)}
            >
              <div className="cell-content">
                <div className="client-name">{client.client}</div>
                <div className="client-id">{client.id}</div>
                <div className="risk-score">{riskScore}/10</div>
              </div>
              
              {highlightedClient === client.id && (
                <div className="risk-details">
                  <div className="detail-item">
                    <span>Volatility Response:</span>
                    <span className="score">{client.volatilityResponse}/10</span>
                  </div>
                  <div className="detail-item">
                    <span>Risk Tolerance:</span>
                    <span className="score">{client.riskTolerance}/10</span>
                  </div>
                  <div className="detail-item">
                    <span>Behavioral Pattern:</span>
                    <span className="score">{client.behavioralPattern}/10</span>
                  </div>
                  <button className="analyze-btn">View Full Profile</button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskHeatmapCard;