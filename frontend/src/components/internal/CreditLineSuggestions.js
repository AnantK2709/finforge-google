import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import './CreditLineSuggestions.css';

const CreditLineSuggestions = ({ client, liquidityData }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Calculate credit line suggestions based on assets and cash flow
  const creditSuggestions = useMemo(() => {
    if (!client || !liquidityData) return [];
    
    const assetBased = {
      id: 1,
      type: 'Asset-Based Credit Line',
      amount: Math.round(client.assets * 0.25), // 25% of assets
      rate: '4.25%',
      term: 'Revolving',
      collateral: 'Investment Portfolio',
      benefits: [
        'Lower interest rates than unsecured options',
        'Flexible draws and repayments',
        'No set maturity date'
      ],
      considerations: [
        'Market volatility may affect available credit',
        'Risk of margin call if portfolio value declines'
      ]
    };
    
    // Calculate average monthly net cash flow
    let totalNetCashFlow = 0;
    liquidityData.forEach(day => {
      totalNetCashFlow += day.netCashFlow || 0;
    });
    const avgMonthlyCashFlow = totalNetCashFlow / 3; // Assuming 90 days of data = 3 months
    
    const cashFlowBased = {
      id: 2,
      type: 'Cash Flow-Based Credit Line',
      amount: Math.round(Math.abs(avgMonthlyCashFlow) * 12), // 12 months of cash flow
      rate: '5.75%',
      term: '24 months',
      collateral: 'None (cash flow secured)',
      benefits: [
        'No portfolio collateral required',
        'Fixed terms for predictable budgeting',
        'No impact from market fluctuations'
      ],
      considerations: [
        'Higher interest rate than asset-based options',
        'Fixed repayment schedule',
        'May require financial covenants'
      ]
    };
    
    const hybridOption = {
      id: 3,
      type: 'Hybrid Credit Solution',
      amount: Math.round((client.assets * 0.15) + (Math.abs(avgMonthlyCashFlow) * 6)), // Combined approach
      rate: '4.9%',
      term: 'Revolving with 36-month term option',
      collateral: 'Partial portfolio collateral',
      benefits: [
        'Balanced approach with lower collateral requirements',
        'Flexibility to convert between revolving and term',
        'Optimized for both short-term and long-term needs'
      ],
      considerations: [
        'More complex structure',
        'Partial exposure to market volatility',
        'Requires periodic review and potential restructuring'
      ]
    };
    
    return [assetBased, cashFlowBased, hybridOption];
  }, [client, liquidityData]);
  
  const handleSelectOption = (option) => {
    setSelectedOption(option.id === selectedOption ? null : option.id);
  };
  
  if (!client || !liquidityData) {
    return (
      <div className="no-data-message">
        <i className="fas fa-credit-card"></i>
        <p>No client data available for credit line suggestions.</p>
      </div>
    );
  }
  
  return (
    <div className="credit-suggestions-container">
      <div className="credit-intro">
        <i className="fas fa-lightbulb suggestion-icon"></i>
        <div className="intro-text">
          <h3>Liquidity Enhancement Opportunities</h3>
          <p>Based on {client.name}'s portfolio and cash flow patterns, the following credit solutions could help optimize liquidity positioning.</p>
        </div>
      </div>
      
      <div className="suggestions-list">
        {creditSuggestions.map((option) => (
          <motion.div 
            key={option.id}
            className={`suggestion-card ${selectedOption === option.id ? 'expanded' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleSelectOption(option)}
          >
            <div className="suggestion-header">
              <div className="suggestion-title">
                <h4>{option.type}</h4>
                <div className="suggestion-meta">
                  <span className="rate">{option.rate}</span>
                  <span className="term">{option.term}</span>
                </div>
              </div>
              <div className="suggestion-amount">
                <span className="amount-label">Suggested Line:</span>
                <span className="amount-value">${option.amount.toLocaleString()}</span>
              </div>
            </div>
            
            {selectedOption === option.id && (
              <motion.div 
                className="suggestion-details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="details-section">
                  <div className="detail-row">
                    <span className="detail-label">Collateral:</span>
                    <span className="detail-value">{option.collateral}</span>
                  </div>
                </div>
                
                <div className="details-columns">
                  <div className="benefits-section">
                    <h5>Benefits</h5>
                    <ul className="details-list">
                      {option.benefits.map((benefit, index) => (
                        <li key={index} className="benefit-item">
                          <i className="fas fa-check"></i>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="considerations-section">
                    <h5>Considerations</h5>
                    <ul className="details-list">
                      {option.considerations.map((consideration, index) => (
                        <li key={index} className="consideration-item">
                          <i className="fas fa-exclamation-circle"></i>
                          <span>{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="suggestion-actions">
                  <button className="btn btn-primary">Generate Proposal</button>
                  <button className="btn btn-outline">Customize Terms</button>
                </div>
              </motion.div>
            )}
            
            <div className="expand-indicator">
              <i className={`fas fa-chevron-${selectedOption === option.id ? 'up' : 'down'}`}></i>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="suggestions-footer">
        <button className="btn btn-secondary">
          <i className="fas fa-file-alt"></i>
          Generate Comparison Report
        </button>
        <button className="btn btn-primary">
          <i className="fas fa-users"></i>
          Schedule Client Discussion
        </button>
      </div>
    </div>
  );
};

export default CreditLineSuggestions;