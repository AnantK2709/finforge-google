import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './MoodJournalEntry.css';

const MoodJournalEntry = ({ onSubmit, isLoading }) => {
  const [journalEntry, setJournalEntry] = useState('');
  const [moodRating, setMoodRating] = useState(3);
  const [wordCount, setWordCount] = useState(0);
  
  const handleJournalChange = (e) => {
    const text = e.target.value;
    setJournalEntry(text);
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).length);
  };
  
  const handleMoodChange = (rating) => {
    setMoodRating(rating);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (journalEntry.trim() === '') return;
    
    onSubmit({
      journalEntry,
      moodRating
    });
    
    // Reset form
    setJournalEntry('');
    setMoodRating(3);
    setWordCount(0);
  };
  
  // Emoji mapping for mood ratings
  const moodEmojis = {
    1: { icon: '😞', label: 'Very Anxious' },
    2: { icon: '😟', label: 'Anxious' },
    3: { icon: '😐', label: 'Neutral' },
    4: { icon: '🙂', label: 'Confident' },
    5: { icon: '😄', label: 'Very Confident' }
  };
  
  // Journal prompts based on current mood
  const journalPrompts = {
    low: [
      "What market events are causing you concern today?",
      "How is your anxiety affecting your investment decisions?",
      "What past experiences might be influencing your current market fears?"
    ],
    neutral: [
      "How would you describe your current investment outlook?",
      "What factors are keeping your market sentiment balanced today?",
      "Are there any pending decisions you're contemplating?"
    ],
    high: [
      "What has contributed to your positive market outlook today?",
      "How are you planning to capitalize on your current confidence?",
      "Are there any risks you might be overlooking due to your positive sentiment?"
    ]
  };
  
  // Get random prompt based on mood rating
  const getRandomPrompt = () => {
    const promptCategory = moodRating <= 2 ? 'low' : moodRating >= 4 ? 'high' : 'neutral';
    const prompts = journalPrompts[promptCategory];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };
  
  const handleGeneratePrompt = () => {
    const prompt = getRandomPrompt();
    setJournalEntry(prev => prev ? `${prev}\n\n${prompt}` : prompt);
    setWordCount(prompt.trim().split(/\s+/).length);
  };
  
  return (
    <div className="mood-journal-entry">
      <form onSubmit={handleSubmit}>
        <div className="mood-selector">
          <p className="mood-question">How do you feel about the markets today?</p>
          <div className="mood-rating">
            {Object.entries(moodEmojis).map(([rating, { icon, label }]) => (
              <motion.button
                key={rating}
                type="button"
                className={`mood-btn ${Number(rating) === moodRating ? 'selected' : ''}`}
                onClick={() => handleMoodChange(Number(rating))}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="mood-emoji">{icon}</span>
                <span className="mood-label">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="journal-input-container">
          <div className="textarea-header">
            <label htmlFor="journalEntry">What's on your mind about your investments?</label>
            <button 
              type="button" 
              className="prompt-btn"
              onClick={handleGeneratePrompt}
            >
              <i className="fas fa-lightbulb"></i>
              Get Prompt
            </button>
          </div>
          
          <textarea
            id="journalEntry"
            name="journalEntry"
            value={journalEntry}
            onChange={handleJournalChange}
            placeholder="Write about your current market sentiment, recent investment decisions, or concerns..."
            rows="6"
            className="journal-textarea"
          ></textarea>
          
          <div className="textarea-footer">
            <span className="word-count">{wordCount} words</span>
            <motion.button
              type="submit"
              className="submit-btn"
              disabled={isLoading || journalEntry.trim() === ''}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Save Journal Entry
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
      
      <div className="journal-benefits">
        <h3>Benefits of Mood Journaling</h3>
        <ul className="benefits-list">
          <li>
            <i className="fas fa-chart-line"></i>
            <span>Track emotional patterns in relation to market movements</span>
          </li>
          <li>
            <i className="fas fa-brain"></i>
            <span>Identify behavioral biases affecting your investment decisions</span>
          </li>
          <li>
            <i className="fas fa-lightbulb"></i>
            <span>Receive AI-powered insights to improve your investment psychology</span>
          </li>
          <li>
            <i className="fas fa-shield-alt"></i>
            <span>Develop emotional resilience during market volatility</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MoodJournalEntry;