// src/apis/api.js

import axios from 'axios';

// Base URL for API calls - change this to your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Portfolio endpoints
export const portfolioApi = {
  getPortfolio: (sectors, riskLevel, capital) => {
    return api.post('/portfolio', {
      sectors,
      risk_level: riskLevel, 
      capital
    });
  },
  
  sendChat: (message) => {
    return api.post('/chat', { message });
  }
};

// Mood tracking endpoints
export const moodApi = {
  submitJournal: (userId, journalEntry, moodRating) => {
    return api.post('/api/mood-journal', {
      user_id: userId,
      journal_entry: journalEntry,
      mood_rating: moodRating
    });
  },
  
  getInsights: (userId) => {
    return api.get(`/api/mood-insights/${userId}`);
  }
};

// Cash flow and liquidity endpoints
export const cashFlowApi = {
  getForecast: (startDate, endDate, periods, currentCashBalance) => {
    return api.get('/api/forecast', {
      params: {
        start_date: startDate,
        end_date: endDate,
        periods,
        current_cash_balance: currentCashBalance
      }
    });
  },
  
  getCashFlowModeling: (startDate, endDate, periods, initialBalance, threshold) => {
    return api.get('/api/cash-flow-modeling', {
      params: {
        start_date: startDate,
        end_date: endDate,
        periods,
        initial_balance: initialBalance,
        threshold
      }
    });
  }
};

export default api;