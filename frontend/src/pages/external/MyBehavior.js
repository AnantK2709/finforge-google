import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './MyBehavior.css';

// Import components
import MoodJournalEntry from '../../components/external/MoodJournalEntry';
import MoodTrendsChart from '../../components/external/MoodTrendsChart';
import BehavioralInsights from '../../components/external/BehavioralInsights';
import StressTestSimulator from '../../components/external/StressTestSimulator';

const MyBehavior = () => {
  const [moodData, setMoodData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('user123'); // Hardcoded for demo
  const [activeTab, setActiveTab] = useState('journal');
  
  useEffect(() => {
    fetchMoodData();
  }, []);
  
  const fetchMoodData = async () => {
    setIsLoading(true);
    
    try {
      // This would be your actual API call using the endpoints in main.py
      /*
      const response = await axios.get(`/api/mood-insights/${userId}`);
      setInsights(response.data.insight);
      
      // Fetch journal entries or use them from insights data
      */
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockMoodData = generateMockMoodData();
        const mockInsight = "Based on your mood patterns, you tend to feel anxious when market volatility increases, especially during downturns. You've shown a pattern of selling assets during periods of anxiety, which has resulted in missed recovery opportunities. Consider implementing a 48-hour reflection period before making major investment decisions during market stress.";
        
        setMoodData(mockMoodData);
        setInsights(mockInsight);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching mood data:', error);
      setIsLoading(false);
    }
  };
  
  const generateMockMoodData = () => {
    const moods = ['confident', 'neutral', 'anxious'];
    const now = new Date();
    
    // Generate mock data for the last 30 days
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - (29 - i));
      
      const portfolioChange = (Math.random() * 10) - 5; // Random portfolio change between -5% and +5%
      const moodIndex = portfolioChange > 2 ? 0 : portfolioChange < -2 ? 2 : 1;
      const mood = moods[moodIndex];
      
      const actionTaken = portfolioChange < -3 && mood === 'anxious' 
        ? 'sold' 
        : portfolioChange > 3 && mood === 'confident'
          ? 'bought'
          : 'held';
      
      return {
        id: i + 1,
        date: date.toISOString().split('T')[0],
        mood: mood,
        moodRating: mood === 'confident' ? 4 + Math.floor(Math.random() * 2) :
                   mood === 'neutral' ? 2 + Math.floor(Math.random() * 3) :
                   1 + Math.floor(Math.random() * 2),
        portfolioChangePct: portfolioChange.toFixed(2),
        journalEntry: generateJournalEntry(mood, portfolioChange, actionTaken),
        actionTaken: actionTaken
      };
    });
  };
  
  const generateJournalEntry = (mood, portfolioChange, actionTaken) => {
    const entries = {
      confident: [
        "Feeling optimistic about the market today. My investment strategy seems to be working well.",
        "Markets are performing above expectations. Glad I stuck to my investment plan.",
        "Portfolio value increased significantly. Considering adding to positions in growth sectors."
      ],
      neutral: [
        "Markets are steady today. No major changes to report.",
        "Maintaining a balanced perspective despite minor fluctuations.",
        "Neither particularly optimistic nor pessimistic about market conditions today."
      ],
      anxious: [
        "Concerned about recent market volatility. Considering reducing exposure to riskier assets.",
        "Worried about economic reports and their potential impact on my portfolio.",
        "Market downturn is creating stress. Questioning whether my asset allocation is appropriate."
      ]
    };
    
    const actionPhrases = {
      sold: " Decided to sell some positions to reduce risk.",
      bought: " Added to my positions to capture potential upside.",
      held: " Maintaining current positions and sticking to the strategy."
    };
    
    const randomEntry = entries[mood][Math.floor(Math.random() * entries[mood].length)];
    return randomEntry + actionPhrases[actionTaken];
  };
  
  const submitJournalEntry = async (entry) => {
    setIsLoading(true);
    
    try {
      // This would be your actual API call to the endpoint in main.py
      /*
      await axios.post('/api/mood-journal', {
        user_id: userId,
        journal_entry: entry.journalEntry,
        mood_rating: entry.moodRating
      });
      */
      
      // For demo, just add to the local state
      const newEntry = {
        id: moodData.length + 1,
        date: new Date().toISOString().split('T')[0],
        journalEntry: entry.journalEntry,
        moodRating: entry.moodRating,
        mood: entry.moodRating >= 4 ? 'confident' : 
              entry.moodRating >= 2 ? 'neutral' : 'anxious',
        portfolioChangePct: (Math.random() * 6 - 3).toFixed(2),
        actionTaken: 'pending'
      };
      
      setMoodData([...moodData, newEntry]);
      
      // Re-fetch insights after new entry
      // fetchMoodData();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting journal entry:', error);
      setIsLoading(false);
    }
  };
  
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
  
  if (isLoading && moodData.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your behavioral data...</p>
      </div>
    );
  }
  
  return (
    <div className="behavior-container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>My Behavior</h1>
        <p className="subtitle">Track your emotional responses to market events and improve decision-making</p>
      </motion.div>
      
      <div className="behavior-tabs">
        <button 
          className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          <i className="fas fa-book"></i>
          Mood Journal
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <i className="fas fa-chart-line"></i>
          Mood Trends
        </button>
        <button 
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <i className="fas fa-lightbulb"></i>
          Behavioral Insights
        </button>
        <button 
          className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <i className="fas fa-flask"></i>
          Stress Test Simulator
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'journal' && (
          <motion.div 
            className="journal-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="journal-form-container" variants={itemVariants}>
              <h2>How are you feeling today?</h2>
              <MoodJournalEntry onSubmit={submitJournalEntry} isLoading={isLoading} />
            </motion.div>
            
            <motion.div className="recent-entries" variants={itemVariants}>
              <h2>Recent Journal Entries</h2>
              <div className="entries-list">
                {moodData.slice().reverse().slice(0, 5).map((entry) => (
                  <div key={entry.id} className={`entry-card mood-${entry.mood}`}>
                    <div className="entry-header">
                      <div className="entry-date">{entry.date}</div>
                      <div className={`mood-badge ${entry.mood}`}>
                        <i className={`fas ${
                          entry.mood === 'confident' ? 'fa-smile' :
                          entry.mood === 'neutral' ? 'fa-meh' : 'fa-frown'
                        }`}></i>
                        {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                      </div>
                    </div>
                    
                    <div className="entry-body">
                      <p>{entry.journalEntry}</p>
                    </div>
                    
                    <div className="entry-footer">
                      <div className="portfolio-change">
                        <span className="label">Portfolio Change:</span>
                        <span className={`value ${parseFloat(entry.portfolioChangePct) >= 0 ? 'positive' : 'negative'}`}>
                          {parseFloat(entry.portfolioChangePct) >= 0 ? '+' : ''}{entry.portfolioChangePct}%
                        </span>
                      </div>
                      <div className="action-taken">
                        <span className="label">Action:</span>
                        <span className="value">{entry.actionTaken.charAt(0).toUpperCase() + entry.actionTaken.slice(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'trends' && (
          <motion.div 
            className="trends-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <MoodTrendsChart moodData={moodData} />
          </motion.div>
        )}
        
        {activeTab === 'insights' && (
          <motion.div 
            className="insights-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <BehavioralInsights insights={insights} moodData={moodData} />
          </motion.div>
        )}
        
        {activeTab === 'simulator' && (
          <motion.div 
            className="simulator-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <StressTestSimulator />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyBehavior;