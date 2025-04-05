import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './CashFlowModelingTool.css';

const CashFlowModelingTool = ({ client }) => {
  const [modelingParams, setModelingParams] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    periods: 30,
    initialBalance: 500000,
    threshold: 200000
  });
  
  const [modelingResults, setModelingResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unexpectedEvents, setUnexpectedEvents] = useState([
    { type: 'inflow', probability: 0.2, amount: 100000, description: 'Additional Investment' },
    { type: 'outflow', probability: 0.3, amount: 150000, description: 'Unexpected Expense' }
  ]);
  
  useEffect(() => {
    if (client) {
      // Reset the form when client changes
      setModelingParams({
        ...modelingParams,
        initialBalance: Math.round(client.assets * 0.05) // 5% of assets as initial cash balance
      });
    }
  }, [client]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModelingParams({
      ...modelingParams,
      [name]: name === 'periods' || name === 'initialBalance' || name === 'threshold' 
        ? Number(value) 
        : value
    });
  };
  
  const handleUnexpectedEventChange = (index, field, value) => {
    const updatedEvents = [...unexpectedEvents];
    updatedEvents[index][field] = field === 'probability' || field === 'amount' 
      ? Number(value) 
      : value;
    setUnexpectedEvents(updatedEvents);
  };
  
  const addUnexpectedEvent = () => {
    setUnexpectedEvents([
      ...unexpectedEvents,
      { type: 'outflow', probability: 0.2, amount: 50000, description: 'New Event' }
    ]);
  };
  
  const removeUnexpectedEvent = (index) => {
    setUnexpectedEvents(unexpectedEvents.filter((_, i) => i !== index));
  };
  
  const runCashFlowModel = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Integrate with your backend API endpoint from test_fast.py
      // This would be your actual API call in production
      /*
      const response = await axios.get('/api/cash-flow-modeling', {
        params: {
          start_date: modelingParams.startDate,
          end_date: modelingParams.endDate,
          periods: modelingParams.periods,
          initial_balance: modelingParams.initialBalance,
          threshold: modelingParams.threshold
        }
      });
      
      setModelingResults(response.data);
      */
      
      // For now, let's simulate the response
      setTimeout(() => {
        // Generate synthetic modeling results
        const now = new Date();
        const results = Array.from({ length: modelingParams.periods }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          
          // Generate cash flow with normal distribution
          let cashFlow = Math.random() * 60000 - 20000;
          
          // Apply unexpected events with their probabilities
          unexpectedEvents.forEach(event => {
            if (Math.random() < event.probability / modelingParams.periods) {
              cashFlow += event.type === 'inflow' ? event.amount : -event.amount;
            }
          });
          
          // Calculate running balance
          const projectedBalance = i === 0 
            ? modelingParams.initialBalance + cashFlow 
            : null; // Will be calculated in the next step
          
          return {
            date: date.toISOString().split('T')[0],
            predicted_cash_flow: Math.round(cashFlow),
            projected_balance: projectedBalance,
            recommendation: ''
          };
        });
        
        // Calculate running balance
        let balance = modelingParams.initialBalance;
        results.forEach(day => {
          balance += day.predicted_cash_flow;
          day.projected_balance = Math.round(balance);
          
          // Add recommendation based on threshold
          if (balance < modelingParams.threshold) {
            day.recommendation = 'Rebalance funds: Low liquidity';
          } else if (balance > modelingParams.threshold * 3) {
            day.recommendation = 'Consider investments: Excess liquidity';
          } else {
            day.recommendation = 'OK';
          }
        });
        
        setModelingResults({
          initial_balance: modelingParams.initialBalance,
          threshold: modelingParams.threshold,
          modeling_results: results
        });
        
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error running cash flow model:', error);
      setError('Failed to run cash flow model. Please check your inputs and try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="cash-flow-modeling-container">
      <div className="modeling-form">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={modelingParams.startDate}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={modelingParams.endDate}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="periods">Forecast Periods (Days)</label>
            <input
              type="number"
              id="periods"
              name="periods"
              value={modelingParams.periods}
              onChange={handleInputChange}
              className="form-input"
              min="1"
              max="90"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="initialBalance">Initial Cash Balance ($)</label>
            <input
              type="number"
              id="initialBalance"
              name="initialBalance"
              value={modelingParams.initialBalance}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              step="10000"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="threshold">Minimum Balance Threshold ($)</label>
            <input
              type="number"
              id="threshold"
              name="threshold"
              value={modelingParams.threshold}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              step="10000"
            />
          </div>
        </div>
        
        <div className="unexpected-events-section">
          <div className="section-header">
            <h3>Unexpected Events</h3>
            <button 
              className="btn btn-sm btn-outline"
              onClick={addUnexpectedEvent}
              type="button"
            >
              <i className="fas fa-plus"></i> Add Event
            </button>
          </div>
          
          {unexpectedEvents.map((event, index) => (
            <motion.div 
              key={index} 
              className="unexpected-event-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <select
                value={event.type}
                onChange={(e) => handleUnexpectedEventChange(index, 'type', e.target.value)}
                className="event-type-select"
              >
                <option value="inflow">Inflow</option>
                <option value="outflow">Outflow</option>
              </select>
              
              <input
                type="text"
                value={event.description}
                onChange={(e) => handleUnexpectedEventChange(index, 'description', e.target.value)}
                placeholder="Description"
                className="event-description-input"
              />
              
              <div className="event-amount-group">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={event.amount}
                  onChange={(e) => handleUnexpectedEventChange(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="event-amount-input"
                  min="0"
                  step="10000"
                />
              </div>
              
              <div className="event-probability-group">
                <input
                  type="number"
                  value={event.probability}
                  onChange={(e) => handleUnexpectedEventChange(index, 'probability', e.target.value)}
                  placeholder="Probability"
                  className="event-probability-input"
                  min="0"
                  max="1"
                  step="0.1"
                />
                <span className="probability-symbol">%</span>
              </div>
              
              <button 
                className="btn-icon remove-event"
                onClick={() => removeUnexpectedEvent(index)}
                type="button"
              >
                <i className="fas fa-times"></i>
              </button>
            </motion.div>
          ))}
        </div>
        
        <div className="form-actions">
          <button 
            className="btn btn-primary run-model-btn"
            onClick={runCashFlowModel}
            disabled={isLoading}
          >
            {isLoading ? 'Running Model...' : 'Run Cash Flow Model'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Running cash flow model...</p>
        </div>
      )}
      
      {modelingResults && !isLoading && (
        <motion.div 
          className="modeling-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="results-header">
            <h3>Cash Flow Model Results</h3>
            <div className="model-info">
              <div className="info-item">
                <span className="info-label">Initial Balance:</span>
                <span className="info-value">${modelingResults.initial_balance.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Threshold:</span>
                <span className="info-value">${modelingResults.threshold.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="results-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={modelingResults.modeling_results}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  tick={{ fontSize: 12 }}
                  interval={Math.max(1, Math.floor(modelingResults.modeling_results.length / 10))}
                />
                <YAxis 
                  tickFormatter={(value) => `$${Math.abs(value / 1000)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  labelFormatter={(date) => `Date: ${date}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="projected_balance"
                  name="Projected Balance"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_cash_flow"
                  name="Cash Flow"
                  stroke="#82ca9d"
                  dot={false}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="results-table">
            <h4>Cash Flow Details</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Cash Flow</th>
                    <th>Balance</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {modelingResults.modeling_results.map((result, index) => (
                    <tr key={index} className={
                      result.projected_balance < modelingResults.threshold 
                        ? 'low-balance'
                        : result.projected_balance > modelingResults.threshold * 3
                          ? 'high-balance'
                          : ''
                    }>
                      <td>{result.date}</td>
                      <td className={result.predicted_cash_flow >= 0 ? 'positive' : 'negative'}>
                        ${result.predicted_cash_flow.toLocaleString()}
                      </td>
                      <td>${result.projected_balance.toLocaleString()}</td>
                      <td>
                        <span className={`recommendation-badge ${
                          result.recommendation.includes('Low') 
                            ? 'warning' 
                            : result.recommendation.includes('Excess')
                              ? 'info'
                              : 'success'
                        }`}>
                          {result.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="action-recommendations">
            <h4>Action Recommendations</h4>
            <ul className="recommendations-list">
              {modelingResults.modeling_results.some(r => r.projected_balance < modelingResults.threshold) && (
                <li className="recommendation-item warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div className="recommendation-content">
                    <h5>Liquidity Risk Detected</h5>
                    <p>Cash balance falls below threshold of ${modelingResults.threshold.toLocaleString()} in the forecast period. Consider rebalancing portfolio or establishing credit line.</p>
                  </div>
                </li>
              )}
              
              {modelingResults.modeling_results.some(r => r.projected_balance > modelingResults.threshold * 3) && (
                <li className="recommendation-item info">
                  <i className="fas fa-info-circle"></i>
                  <div className="recommendation-content">
                    <h5>Excess Liquidity Detected</h5>
                    <p>Cash balance exceeds 3x threshold (${(modelingResults.threshold * 3).toLocaleString()}) during forecast period. Consider investment opportunities for excess capital.</p>
                  </div>
                </li>
              )}
              
              <li className="recommendation-item success">
                <i className="fas fa-check-circle"></i>
                <div className="recommendation-content">
                  <h5>Run Stress Tests</h5>
                  <p>Consider running additional scenarios with different unexpected events to test portfolio resilience.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="results-actions">
            <button className="btn btn-outline">Export Model Results</button>
            <button className="btn btn-outline">Run New Scenario</button>
            <button className="btn btn-primary">Share with Client</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CashFlowModelingTool;