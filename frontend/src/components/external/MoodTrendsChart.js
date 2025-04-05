import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MoodTrendsChart.css';

const MoodTrendsChart = ({ moodData }) => {
  // Process data to be used in charts
  const processedData = useMemo(() => {
    if (!moodData || moodData.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...moodData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Map mood to numerical values for charting
    return sortedData.map(entry => ({
      ...entry,
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      moodValue: entry.mood === 'confident' ? 5 : 
                entry.mood === 'neutral' ? 3 : 1,
      portfolioChange: parseFloat(entry.portfolioChangePct)
    }));
  }, [moodData]);
  
  // Calculate correlations between mood and portfolio changes
  const correlationData = useMemo(() => {
    if (!moodData || moodData.length === 0) return null;
    
    const moodsByChange = moodData.reduce((acc, entry) => {
      const changeRange = Math.floor(parseFloat(entry.portfolioChangePct) / 2) * 2;
      const rangeKey = `${changeRange > 0 ? '+' : ''}${changeRange}% to ${changeRange > 0 ? '+' : ''}${changeRange + 2}%`;
      
      if (!acc[rangeKey]) {
        acc[rangeKey] = {
          range: rangeKey,
          confident: 0,
          neutral: 0,
          anxious: 0,
          total: 0,
          avgChange: 0,
          totalChange: 0
        };
      }
      
      acc[rangeKey][entry.mood] += 1;
      acc[rangeKey].total += 1;
      acc[rangeKey].totalChange += parseFloat(entry.portfolioChangePct);
      acc[rangeKey].avgChange = acc[rangeKey].totalChange / acc[rangeKey].total;
      
      return acc;
    }, {});
    
    // Convert to array and sort by change range
    return Object.values(moodsByChange).sort((a, b) => {
      const aValue = parseFloat(a.range.split('%')[0]);
      const bValue = parseFloat(b.range.split('%')[0]);
      return aValue - bValue;
    });
  }, [moodData]);
  
  // Calculate mood trends over time
  const moodTrendData = useMemo(() => {
    if (!moodData || moodData.length === 0) return [];
    
    // Group by week
    const weeklyData = moodData.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          confident: 0,
          neutral: 0,
          anxious: 0,
          total: 0,
          avgMood: 0,
          totalMood: 0
        };
      }
      
      acc[weekKey][entry.mood] += 1;
      acc[weekKey].total += 1;
      
      // Calculate average mood value (5 for confident, 3 for neutral, 1 for anxious)
      const moodValue = entry.mood === 'confident' ? 5 : 
                       entry.mood === 'neutral' ? 3 : 1;
      acc[weekKey].totalMood += moodValue;
      acc[weekKey].avgMood = acc[weekKey].totalMood / acc[weekKey].total;
      
      return acc;
    }, {});
    
    // Convert to array and sort by week
    return Object.values(weeklyData).sort((a, b) => {
      return new Date(a.week) - new Date(b.week);
    });
  }, [moodData]);
  
  if (!moodData || moodData.length === 0) {
    return (
      <div className="no-data-message">
        <i className="fas fa-chart-line"></i>
        <p>No mood data available for analysis. Add some journal entries to see trends.</p>
      </div>
    );
  }
  
  return (
    <div className="mood-trends-container">
      <div className="trends-header">
        <h2>Your Mood Trends</h2>
        <p className="trends-description">
          Analysis of your emotional patterns in relation to market events
        </p>
      </div>
      
      <div className="charts-grid">
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Mood & Portfolio Changes Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" label={{ value: 'Mood Rating', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Portfolio Change %', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="moodValue" 
                  name="Mood Rating"
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="portfolioChange" 
                  name="Portfolio Change %"
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-insights">
            <div className="insight-item">
              <i className="fas fa-info-circle"></i>
              <p>This chart shows the relationship between your mood ratings and portfolio performance over time.</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3>Weekly Mood Trends</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={moodTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="confident" 
                  name="Confident" 
                  stackId="1"
                  stroke="#4caf50" 
                  fill="#4caf50" 
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  name="Neutral" 
                  stackId="1"
                  stroke="#2196f3" 
                  fill="#2196f3" 
                />
                <Area 
                  type="monotone" 
                  dataKey="anxious" 
                  name="Anxious" 
                  stackId="1"
                  stroke="#f44336" 
                  fill="#f44336" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-insights">
            <div className="insight-item">
              <i className="fas fa-info-circle"></i>
              <p>This area chart shows the distribution of your mood states by week, helping identify patterns over time.</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="chart-card full-width"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3>Mood Distribution by Portfolio Change</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={correlationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="confident" name="Confident" stackId="a" fill="#4caf50" />
                <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#2196f3" />
                <Bar dataKey="anxious" name="Anxious" stackId="a" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-insights">
            <div className="insight-item">
              <i className="fas fa-lightbulb"></i>
              <p>This chart reveals how your mood states correlate with different portfolio performance ranges.</p>
            </div>
            {correlationData && correlationData.some(d => d.anxious > 0 && d.avgChange < 0) && (
              <div className="insight-item warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>You tend to experience anxiety during market downturns, which could potentially lead to reactive decision-making.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <div className="mood-analysis-summary">
        <h3>Key Observations</h3>
        <ul className="observations-list">
          {processedData.length > 5 && (
            <li>
              <span className="observation-point">Tracking Consistency:</span> You've logged {processedData.length} mood entries, providing a good baseline for analysis.
            </li>
          )}
          
          {moodTrendData.length > 0 && (
            <li>
              <span className="observation-point">Dominant Mood:</span> Your most frequent mood state is {
                Math.max(
                  moodData.filter(d => d.mood === 'confident').length,
                  moodData.filter(d => d.mood === 'neutral').length,
                  moodData.filter(d => d.mood === 'anxious').length
                ) === moodData.filter(d => d.mood === 'confident').length
                  ? 'confidence'
                  : Math.max(
                      moodData.filter(d => d.mood === 'confident').length,
                      moodData.filter(d => d.mood === 'neutral').length,
                      moodData.filter(d => d.mood === 'anxious').length
                    ) === moodData.filter(d => d.mood === 'neutral').length
                    ? 'neutrality'
                    : 'anxiety'
              }.
            </li>
          )}
          
          {correlationData && (
            <li>
              <span className="observation-point">Market Response:</span> Your emotional responses {
                correlationData.some(d => (d.anxious > d.neutral && d.anxious > d.confident) && d.avgChange < 0)
                  ? 'show sensitivity to market downturns'
                  : 'appear relatively stable across market conditions'
              }.
            </li>
          )}
          
          {moodTrendData.length > 2 && (
            <li>
              <span className="observation-point">Trend Direction:</span> Your overall mood trend is {
                moodTrendData[moodTrendData.length - 1].avgMood > moodTrendData[0].avgMood
                  ? 'improving over time'
                  : moodTrendData[moodTrendData.length - 1].avgMood < moodTrendData[0].avgMood
                    ? 'becoming more cautious over time'
                    : 'remaining stable over time'
              }.
            </li>
          )}
        </ul>
      </div>
      
      <div className="trends-actions">
        <button className="action-btn">
          <i className="fas fa-download"></i>
          Download Trends Report
        </button>
        <button className="action-btn primary">
          <i className="fas fa-user-chart"></i>
          Get Personalized Strategies
        </button>
      </div>
    </div>
  );
};

export default MoodTrendsChart;