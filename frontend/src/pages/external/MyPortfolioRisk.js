import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './MyPortfolioRisk.css';
import { portfolioApi } from '../../apis/api'; // Assuming you've placed the api.js in src/apis directory

// Define available sectors and sample stocks
const SECTOR_STOCKS = {
    "technology": ["AAPL", "MSFT", "GOOGL", "NVDA"],
    "healthcare": ["JNJ", "PFE", "UNH", "ABBV"],
    "financial": ["JPM", "BAC", "V", "MA"],
    "consumer": ["AMZN", "PG", "KO", "WMT"],
    "industrial": ["BA", "CAT", "GE", "HON"],
    "energy": ["XOM", "CVX", "COP", "SLB"],
    "utilities": ["NEE", "DUK", "SO", "D"],
    "semiconductor": ["INTC", "AMD", "TSM", "MU"],
    "banks": ["JPM", "BAC", "C", "WFC"],
    "internet": ["GOOGL", "META", "AMZN", "NFLX"]
};

const MyPortfolioRisk = () => {
    const [portfolioData, setPortfolioData] = useState(null);
    const [riskProfile, setRiskProfile] = useState(null);
    const [sectorData, setSectorData] = useState([]);
    const [geographyData, setGeographyData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('sector');
    const [chatQuery, setChatQuery] = useState('');
    const [chatResponse, setChatResponse] = useState(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        investmentText: '',
        sectors: ["semiconductor", "banks", "internet", "healthcare"],
        riskLevel: 6,
        capital: 1000000
    });
    
    // Form display toggle
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Fetch portfolio data when component mounts
        fetchPortfolioData();
    }, []);

    const fetchPortfolioData = async (customSectors, customRiskLevel, customCapital) => {
        setIsLoading(true);

        const sectors = customSectors || formData.sectors;
        const riskLevel = customRiskLevel || formData.riskLevel;
        const capital = customCapital || formData.capital;

        try {
            // Connect to the portfolio endpoint in main.py
            const portfolioResponse = await portfolioApi.getPortfolio(
                sectors,
                riskLevel,
                capital
            );

            // Process the response data
            const responseData = portfolioResponse.data;

            // Map the backend response to our frontend data structure
            const processedData = {
                totalValue: responseData.total_capital || 1250000,
                targetRiskLevel: responseData.risk_level || 6,

                // If these fields aren't in the API response, hardcode them
                actualRiskLevel: responseData.actual_risk_level || 6.8,

                // Process sector allocation from backend data
                sectorAllocation: Object.entries(responseData.stock_allocations || {}).map(([ticker, details]) => ({
                    name: details.sector,
                    // Group by sector and calculate aggregates
                    // This is simplified - you would need to aggregate by sector in a real implementation
                    value: details.weight * 100,
                    assets: details.capital
                })),

                // Hardcode geography as it's not in the backend
                geographyAllocation: [
                    { name: 'North America', value: 60, assets: 750000 },
                    { name: 'Europe', value: 15, assets: 187500 },
                    { name: 'Asia-Pacific', value: 20, assets: 250000 },
                    { name: 'Emerging Markets', value: 5, assets: 62500 }
                ],

                // Process risk metrics from backend or hardcode
                riskMetrics: {
                    volatility: responseData.expected_annual_volatility * 100 || 14.7,
                    sharpeRatio: 1.2, // Hardcoded
                    maxDrawdown: -12.5, // Hardcoded
                    beta: 1.1, // Hardcoded
                    alpha: 2.3, // Hardcoded
                    rSquared: 0.92 // Hardcoded
                },

                // Other hardcoded data that's not available from backend
                riskBreakdown: [
                    { name: 'Market Risk', value: 45 },
                    { name: 'Sector Risk', value: 30 },
                    { name: 'Stock-Specific Risk', value: 15 },
                    { name: 'Currency Risk', value: 5 },
                    { name: 'Interest Rate Risk', value: 5 }
                ],

                riskProfile: {
                    score: 68,
                    category: 'Growth',
                    attributes: [
                        { name: 'Risk Tolerance', value: 70 },
                        { name: 'Time Horizon', value: 85 },
                        { name: 'Financial Stability', value: 75 },
                        { name: 'Investment Knowledge', value: 60 },
                        { name: 'Income Needs', value: 50 }
                    ],
                    recommendation: "Your current allocation aligns well with your risk profile, though it's slightly more aggressive than your target."
                },

                // Process top holdings from backend
                topHoldings: Object.entries(responseData.stock_allocations || {})
                    .sort((a, b) => b[1].capital - a[1].capital)
                    .slice(0, 5)
                    .map(([ticker, details]) => ({
                        ticker: ticker,
                        name: ticker, // Backend doesn't provide company names
                        value: details.capital,
                        weight: details.weight * 100,
                        riskScore: Math.random() * 3 + 5 // Hardcoded risk score
                    })),

                scenarioAnalysis: [
                    { scenario: 'Market Crash (-30%)', impact: -27.5 },
                    { scenario: 'Recession', impact: -22.0 },
                    { scenario: 'Tech Bubble Burst', impact: -35.0 },
                    { scenario: 'Rising Interest Rates', impact: -12.5 },
                    { scenario: 'Inflation Surge', impact: -18.0 }
                ]
            };

            setPortfolioData(processedData);
            setRiskProfile(processedData.riskProfile);
            setSectorData(processedData.sectorAllocation);
            setGeographyData(processedData.geographyAllocation);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            // Fallback to mock data if API fails
            const mockData = getMockPortfolioData(capital || formData.capital, riskLevel || formData.riskLevel);
            
            setPortfolioData(mockData);
            setRiskProfile(mockData.riskProfile);
            setSectorData(mockData.sectorAllocation);
            setGeographyData(mockData.geographyAllocation);
            setIsLoading(false);
        }
    };

    // Fallback mock data function
    const getMockPortfolioData = (capital = 1000000, riskLevel = 6) => {
        return {
            totalValue: capital,
            targetRiskLevel: riskLevel,
            actualRiskLevel: riskLevel + 0.8,
            sectorAllocation: [
                { name: 'Technology', value: 35, assets: capital * 0.35 },
                { name: 'Healthcare', value: 20, assets: capital * 0.2 },
                { name: 'Financial Services', value: 15, assets: capital * 0.15 },
                { name: 'Consumer Cyclical', value: 10, assets: capital * 0.1 },
                { name: 'Industrials', value: 10, assets: capital * 0.1 },
                { name: 'Other', value: 10, assets: capital * 0.1 }
            ],
            geographyAllocation: [
                { name: 'North America', value: 60, assets: capital * 0.6 },
                { name: 'Europe', value: 15, assets: capital * 0.15 },
                { name: 'Asia-Pacific', value: 20, assets: capital * 0.2 },
                { name: 'Emerging Markets', value: 5, assets: capital * 0.05 }
            ],
            riskMetrics: {
                volatility: 14.7,
                sharpeRatio: 1.2,
                maxDrawdown: -12.5,
                beta: 1.1,
                alpha: 2.3,
                rSquared: 0.92
            },
            riskBreakdown: [
                { name: 'Market Risk', value: 45 },
                { name: 'Sector Risk', value: 30 },
                { name: 'Stock-Specific Risk', value: 15 },
                { name: 'Currency Risk', value: 5 },
                { name: 'Interest Rate Risk', value: 5 }
            ],
            riskProfile: {
                score: 68,
                category: riskLevel <= 3 ? 'Conservative' : riskLevel <= 6 ? 'Moderate' : 'Aggressive',
                attributes: [
                    { name: 'Risk Tolerance', value: riskLevel * 10 },
                    { name: 'Time Horizon', value: 85 },
                    { name: 'Financial Stability', value: 75 },
                    { name: 'Investment Knowledge', value: 60 },
                    { name: 'Income Needs', value: 50 }
                ],
                recommendation: `Your portfolio is aligned with a ${riskLevel <= 3 ? 'conservative' : riskLevel <= 6 ? 'moderate' : 'aggressive'} risk profile.`
            },
            topHoldings: [
                { ticker: 'AAPL', name: 'Apple Inc.', value: capital * 0.08, weight: 8, riskScore: 6.5 },
                { ticker: 'MSFT', name: 'Microsoft Corp', value: capital * 0.07, weight: 7, riskScore: 6.2 },
                { ticker: 'AMZN', name: 'Amazon.com Inc', value: capital * 0.06, weight: 6, riskScore: 7.8 },
                { ticker: 'GOOGL', name: 'Alphabet Inc', value: capital * 0.05, weight: 5, riskScore: 6.7 },
                { ticker: 'JNJ', name: 'Johnson & Johnson', value: capital * 0.04, weight: 4, riskScore: 5.3 }
            ],
            scenarioAnalysis: [
                { scenario: 'Market Crash (-30%)', impact: -27.5 },
                { scenario: 'Recession', impact: -22.0 },
                { scenario: 'Tech Bubble Burst', impact: -35.0 },
                { scenario: 'Rising Interest Rates', impact: -12.5 },
                { scenario: 'Inflation Surge', impact: -18.0 }
            ]
        };
    };

    const handleChatQuery = async () => {
        if (!chatQuery.trim()) return;

        setIsChatLoading(true);
        setChatResponse(null);

        try {
            // Connect to the chat endpoint in main.py
            const response = await portfolioApi.sendChat(chatQuery);

            // Process the response
            const formattedResponse = {
                response: response.data.portfolio?.recommendation || response.data.response || generateMockChatResponse(chatQuery),
                suggestedActions: response.data.suggestedActions || [
                    "Rebalance portfolio",
                    "Review risk tolerance",
                    "Diversify tech holdings"
                ]
            };

            setChatResponse(formattedResponse);
            setIsChatLoading(false);
        } catch (error) {
            console.error('Error fetching chat response:', error);
            // Fallback to mock response if API fails
            const mockResponse = {
                response: generateMockChatResponse(chatQuery),
                suggestedActions: [
                    "Rebalance portfolio",
                    "Review risk tolerance",
                    "Diversify tech holdings"
                ]
            };

            setChatResponse(mockResponse);
            setIsChatLoading(false);
        }
    };

    // New: Natural language investment form handling
    const handleInvestmentTextSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Send the natural language query to the chat endpoint
            const response = await portfolioApi.sendChat(formData.investmentText);
            
            // Extract the parsed parameters
            const parsedParams = response.data;
            
            // Update form data with parsed values
            const updatedFormData = {
                ...formData,
                sectors: parsedParams.sectors || formData.sectors,
                riskLevel: parsedParams.risk_level || parsedParams.riskLevel || formData.riskLevel,
                capital: parsedParams.capital || formData.capital
            };
            
            setFormData(updatedFormData);
            
            // Fetch portfolio data with the new parameters
            await fetchPortfolioData(
                updatedFormData.sectors,
                updatedFormData.riskLevel,
                updatedFormData.capital
            );
            
            // Hide the form after submission
            setShowForm(false);
            
        } catch (error) {
            console.error('Error processing investment text:', error);
            
            // Fallback - use current form values
            fetchPortfolioData();
            setShowForm(false);
        }
    };

    // Mock chat response based on query
    const generateMockChatResponse = (query) => {
        const lowercaseQuery = query.toLowerCase();

        if (lowercaseQuery.includes('risk') && lowercaseQuery.includes('reduce')) {
            return "To reduce your portfolio risk, I recommend rebalancing to include more defensive assets. Your technology exposure (35%) is above your target allocation. Consider trimming some tech holdings and adding to healthcare or consumer staples. Another option is to increase your fixed income allocation, which would lower your portfolio's overall volatility.";
        } else if (lowercaseQuery.includes('tech') || lowercaseQuery.includes('technology')) {
            return "Your technology allocation (35%) is currently your largest sector exposure. While tech has driven strong returns, it also contributes significantly to your portfolio volatility. Your top tech holdings include Apple (7%), Microsoft (6%), Amazon (5%), and Alphabet (4.5%). If you're concerned about concentration risk, consider diversifying within the sector or trimming some positions.";
        } else if (lowercaseQuery.includes('rebalance') || lowercaseQuery.includes('balance')) {
            return "Based on your target risk level of 6, I recommend rebalancing your portfolio to reduce your technology allocation from 35% to 30%, and increasing your allocation to defensive sectors like consumer staples and utilities by 5%. This would bring your actual risk level (currently 6.8) closer to your target.";
        } else if (lowercaseQuery.includes('recession') || lowercaseQuery.includes('downturn')) {
            return "In a recession scenario, your current portfolio is estimated to decline by approximately 22%. Your technology and consumer discretionary sectors would be most impacted. To improve recession resilience, consider increasing your allocation to healthcare, utilities, and consumer staples, which tend to be more defensive during economic downturns.";
        } else {
            return "I'm here to help you understand and optimize your portfolio risk profile. Your current portfolio has a risk level of 6.8 (Growth), with significant allocations to Technology (35%), Healthcare (20%), and Financial Services (15%). Would you like specific recommendations on how to adjust your allocations to better match your risk tolerance or improve performance?";
        }
    };

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    };
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    // Handle sector selection
    const handleSectorChange = (e) => {
        const { value, checked } = e.target;
        let updatedSectors = [...formData.sectors];
        
        if (checked) {
            if (!updatedSectors.includes(value)) {
                updatedSectors.push(value);
            }
        } else {
            updatedSectors = updatedSectors.filter(sector => sector !== value);
        }
        
        setFormData({
            ...formData,
            sectors: updatedSectors
        });
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your portfolio and risk data...</p>
            </div>
        );
    }

    return (
        <div className="portfolio-risk-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>My Portfolio & Risk</h1>
                <p className="subtitle">Understand your investments and risk exposure</p>
                
                <div className="header-actions">
                    <button 
                        className="action-btn primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className="fas fa-edit"></i>
                        {showForm ? 'Hide Form' : 'Customize Portfolio'}
                    </button>
                </div>
                
                {/* New: Natural Language Investment Form */}
                {showForm && (
                    <motion.div 
                        className="investment-form-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <form onSubmit={handleInvestmentTextSubmit} className="investment-form">
                            <div className="form-group">
                                <h3>Describe Your Investment</h3>
                                <textarea
                                    name="investmentText"
                                    value={formData.investmentText}
                                    onChange={handleInputChange}
                                    placeholder="Describe your investment goals in natural language. For example: 'I want to invest $500,000 in technology and healthcare with a moderate risk level of 5'"
                                    rows={3}
                                    required
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <h3>Investment Amount</h3>
                                    <input
                                        type="number"
                                        name="capital"
                                        value={formData.capital}
                                        onChange={handleInputChange}
                                        min="1000"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <h3>Risk Level (1-10)</h3>
                                    <input
                                        type="range"
                                        name="riskLevel"
                                        value={formData.riskLevel}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="10"
                                        step="1"
                                    />
                                    <div className="risk-value">{formData.riskLevel}</div>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <h3>Sectors</h3>
                                <div className="sectors-checkboxes">
                                    {Object.keys(SECTOR_STOCKS).map(sector => (
                                        <label key={sector} className="sector-checkbox">
                                            <input
                                                type="checkbox"
                                                value={sector}
                                                checked={formData.sectors.includes(sector)}
                                                onChange={handleSectorChange}
                                            />
                                            {sector.charAt(0).toUpperCase() + sector.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="action-btn primary">
                                    Generate Portfolio
                                </button>
                                <button 
                                    type="button" 
                                    className="action-btn outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </motion.div>

            <motion.div
                className="portfolio-summary"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="summary-card" variants={itemVariants}>
                    <h3>Portfolio Value</h3>
                    <div className="summary-value">${portfolioData.totalValue.toLocaleString()}</div>
                </motion.div>

                <motion.div className="summary-card" variants={itemVariants}>
                    <h3>Risk Level</h3>
                    <div className="summary-value">{portfolioData.actualRiskLevel}/10</div>
                    <div className="summary-context">Target: {portfolioData.targetRiskLevel}/10</div>
                </motion.div>

                <motion.div className="summary-card" variants={itemVariants}>
                    <h3>Risk Profile</h3>
                    <div className="summary-value">{riskProfile.category}</div>
                </motion.div>

                <motion.div className="summary-card" variants={itemVariants}>
                    <h3>Volatility</h3>
                    <div className="summary-value">{portfolioData.riskMetrics.volatility}%</div>
                </motion.div>

                <motion.div className="summary-card" variants={itemVariants}>
                    <h3>Sharpe Ratio</h3>
                    <div className="summary-value">{portfolioData.riskMetrics.sharpeRatio}</div>
                </motion.div>

                <motion.div className="summary-card" variants={itemVariants}>
                    <h3>Beta</h3>
                    <div className="summary-value">{portfolioData.riskMetrics.beta}</div>
                    <div className="summary-context">vs S&P 500 (1.0)</div>
                </motion.div>
            </motion.div>

            <div className="content-grid">
                <motion.div
                    className="grid-left"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="card allocation-card"
                        variants={itemVariants}
                    >
                        <div className="card-header">
                            <h2>Portfolio Breakdown</h2>
                            <div className="tab-selector">
                                <button
                                    className={`tab-btn ${selectedTab === 'sector' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('sector')}
                                >
                                    Sector
                                </button>
                                <button
                                    className={`tab-btn ${selectedTab === 'geography' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('geography')}
                                >
                                    Geography
                                </button>
                            </div>
                        </div>

                        <div className="card-content">
                            <div className="allocation-chart">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={selectedTab === 'sector' ? sectorData : geographyData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {(selectedTab === 'sector' ? sectorData : geographyData).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="allocation-details">
                                <h3>{selectedTab === 'sector' ? 'Sector Breakdown' : 'Geographic Breakdown'}</h3>
                                <div className="allocation-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>{selectedTab === 'sector' ? 'Sector' : 'Region'}</th>
                                                <th>Allocation</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedTab === 'sector' ? sectorData : geographyData).map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div className="color-indicator" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                        {item.name}
                                                    </td>
                                                    <td>{item.value}%</td>
                                                    <td>${item.assets.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card risk-profile-card"
                        variants={itemVariants}
                    >
                        <div className="card-header">
                            <h2>Your Risk Profile</h2>
                        </div>

                        <div className="card-content">
                            <div className="profile-summary">
                                <div className="profile-score">
                                    <div className="score-display">
                                        <svg width="80" height="80" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke="#6a11cb"
                                                strokeWidth="8"
                                                strokeDasharray={`${riskProfile.score * 2.83} 283`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </svg>
                                        <div className="score-number">{riskProfile.score}</div>
                                    </div>
                                    <div className="score-label">{riskProfile.category}</div>
                                </div>

                                <div className="profile-attributes">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadarChart data={riskProfile.attributes}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="name" tick={{ fill: '#333', fontSize: 10 }} />
                                            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                            <Radar
                                                name="Your Profile"
                                                dataKey="value"
                                                stroke="#6a11cb"
                                                fill="#6a11cb"
                                                fillOpacity={0.5}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="profile-recommendation">
                                <h3>Recommendation</h3>
                                <p>{riskProfile.recommendation}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="grid-right"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="card top-holdings-card"
                        variants={itemVariants}
                    >
                        <div className="card-header">
                            <h2>Top Holdings</h2>
                        </div>

                        <div className="card-content">
                            <div className="holdings-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ticker</th>
                                            <th>Name</th>
                                            <th>Weight</th>
                                            <th>Value</th>
                                            <th>Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolioData.topHoldings.map((holding, index) => (
                                            <tr key={index}>
                                                <td className="ticker">{holding.ticker}</td>
                                                <td>{holding.name}</td>
                                                <td>{holding.weight}%</td>
                                                <td>${holding.value.toLocaleString()}</td>
                                                <td>
                                                    <div className="risk-indicator">
                                                        <div
                                                            className="risk-fill"
                                                            style={{ width: `${holding.riskScore * 10}%` }}
                                                        ></div>
                                                        <span className="risk-value">{holding.riskScore}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card scenarios-card"
                        variants={itemVariants}
                    >
                        <div className="card-header">
                            <h2>Scenario Analysis</h2>
                        </div>

                        <div className="card-content">
                            <div className="scenarios-chart">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={portfolioData.scenarioAnalysis}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickFormatter={(value) => `${value}%`} domain={[-40, 0]} />
                                        <YAxis type="category" dataKey="scenario" tick={{ fontSize: 12 }} width={100} />
                                        <Tooltip formatter={(value) => [`${value}%`, 'Impact']} />
                                        <Bar
                                            dataKey="impact"
                                            fill="#f44336"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="scenario-message">
                                <div className="message-icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div className="message-content">
                                    <h3>Scenario Impact</h3>
                                    <p>In a severe market downturn (-30%), your portfolio may decline by approximately {Math.abs(portfolioData.scenarioAnalysis[0].impact)}%. Your technology holdings are particularly vulnerable to a tech bubble scenario, which could result in a {Math.abs(portfolioData.scenarioAnalysis[2].impact)}% decline.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card ai-assistant-card"
                        variants={itemVariants}
                    >
                        <div className="card-header">
                            <h2>Ask About Your Portfolio</h2>
                        </div>

                        <div className="card-content">
                            <div className="chat-interface">
                                <div className="chat-box">
                                    {!chatResponse ? (
                                        <div className="empty-chat">
                                            <div className="empty-chat-icon">
                                                <i className="fas fa-comments"></i>
                                            </div>
                                            <p>Ask me anything about your portfolio risk, asset allocation, or how to optimize your investments.</p>
                                            <div className="example-queries">
                                                <div className="example-query" onClick={() => setChatQuery("How can I reduce my portfolio risk?")}>
                                                    How can I reduce my portfolio risk?
                                                </div>
                                                <div className="example-query" onClick={() => setChatQuery("Is my technology allocation too high?")}>
                                                    Is my technology allocation too high?
                                                </div>
                                                <div className="example-query" onClick={() => setChatQuery("How will my portfolio perform in a recession?")}>
                                                    How will my portfolio perform in a recession?
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="chat-response">
                                            <div className="ai-message">
                                                <div className="ai-icon">
                                                    <i className="fas fa-robot"></i>
                                                </div>
                                                <div className="message-content">
                                                    <p>{chatResponse.response}</p>
                                                </div>
                                            </div>

                                            {chatResponse.suggestedActions && (
                                                <div className="suggested-actions">
                                                    <h4>Suggested Actions</h4>
                                                    <div className="actions-list">
                                                        {chatResponse.suggestedActions.map((action, index) => (
                                                            <div key={index} className="action-chip">
                                                                <i className="fas fa-play-circle"></i>
                                                                <span>{action}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="chat-input">
                                    <input
                                        type="text"
                                        placeholder="Ask about your portfolio risk..."
                                        value={chatQuery}
                                        onChange={(e) => setChatQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleChatQuery()}
                                    />
                                    <button
                                        className="send-btn"
                                        onClick={handleChatQuery}
                                        disabled={isChatLoading}
                                    >
                                        {isChatLoading ? (
                                            <div className="loading-dot-spinner">
                                                <div className="dot"></div>
                                                <div className="dot"></div>
                                                <div className="dot"></div>
                                            </div>
                                        ) : (
                                            <i className="fas fa-paper-plane"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                className="action-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <button className="action-btn outline">
                    <i className="fas fa-download"></i>
                    Download Portfolio Report
                </button>
                <button className="action-btn primary" onClick={() => setShowForm(true)}>
                    <i className="fas fa-sliders-h"></i>
                    Adjust Risk Profile
                </button>
                <button className="action-btn primary">
                    <i className="fas fa-sync-alt"></i>
                    Rebalance Portfolio
                </button>
            </motion.div>
        </div>
    );
};

export default MyPortfolioRisk;