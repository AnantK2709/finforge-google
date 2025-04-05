import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ClientInsightsHub.css';

// Import components
import PortfolioSummaryCard from '../../components/internal/PortfolioSummaryCard';

const ClientInsightsHub = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [behavioralInsights, setBehavioralInsights] = useState(null);
    const [clientHistory, setClientHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alertFilter, setAlertFilter] = useState('all');

    useEffect(() => {
        // Simulate API call to fetch clients
        fetchClients();
    }, []);

    useEffect(() => {
        // When a client is selected, fetch their insights
        if (selectedClient) {
            fetchClientInsights(selectedClient.id);
        }
    }, [selectedClient]);

    const fetchClients = () => {
        setIsLoading(true);

        // Mock data - in a real app, this would be an API call
        setTimeout(() => {
            const mockClients = [
                {
                    id: 'C10582',
                    name: 'Roberts Family Trust',
                    riskScore: 7.2,
                    portfolioValue: 12500000,
                    assetAllocation: [
                        { category: 'Equities', percentage: 65 },
                        { category: 'Fixed Income', percentage: 20 },
                        { category: 'Alternatives', percentage: 10 },
                        { category: 'Cash', percentage: 5 }
                    ],
                    performance: {
                        ytd: 8.3,
                        oneYear: 12.7,
                        threeYear: 32.4
                    },
                    riskMetrics: {
                        score: 7.2,
                        volatility: 14.2,
                        sharpeRatio: 1.32
                    },
                    alerts: [
                        { type: 'behavior', level: 'high', message: 'Has shown panic selling during volatility' },
                        { type: 'liquidity', level: 'medium', message: 'Upcoming cash shortfall in 14 days' }
                    ],
                    recommendedActions: [
                        { type: 'review', title: 'Portfolio Review', description: 'Schedule quarterly review meeting', priority: 'medium' },
                        { type: 'rebalance', title: 'Rebalance Portfolio', description: 'Equity allocation is 5% above target', priority: 'low' },
                        { type: 'behavioral', title: 'Behavioral Coaching', description: 'Discuss market volatility responses', priority: 'high' }
                    ],
                    lastUpdate: '2025-03-28T14:30:00Z'
                },
                {
                    id: 'C10832',
                    name: 'Westbrook Holdings',
                    riskScore: 8.5,
                    portfolioValue: 18750000,
                    assetAllocation: [
                        { category: 'Equities', percentage: 75 },
                        { category: 'Fixed Income', percentage: 15 },
                        { category: 'Alternatives', percentage: 8 },
                        { category: 'Cash', percentage: 2 }
                    ],
                    performance: {
                        ytd: 9.1,
                        oneYear: 15.2,
                        threeYear: 38.7
                    },
                    riskMetrics: {
                        score: 8.5,
                        volatility: 16.8,
                        sharpeRatio: 1.48
                    },
                    alerts: [
                        { type: 'liquidity', level: 'high', message: 'Cash levels below 3% threshold' }
                    ],
                    recommendedActions: [
                        { type: 'tax', title: 'Tax-Loss Harvesting', description: 'Opportunity in tech sector positions', priority: 'medium' },
                        { type: 'liquidity', title: 'Liquidity Planning', description: 'Increase cash reserves for upcoming expenses', priority: 'high' }
                    ],
                    lastUpdate: '2025-03-30T09:15:00Z'
                },
                {
                    id: 'C10347',
                    name: 'Chen Family Office',
                    riskScore: 5.4,
                    portfolioValue: 9200000,
                    assetAllocation: [
                        { category: 'Equities', percentage: 55 },
                        { category: 'Fixed Income', percentage: 30 },
                        { category: 'Alternatives', percentage: 10 },
                        { category: 'Cash', percentage: 5 }
                    ],
                    performance: {
                        ytd: 5.8,
                        oneYear: 9.3,
                        threeYear: 24.1
                    },
                    riskMetrics: {
                        score: 5.4,
                        volatility: 11.3,
                        sharpeRatio: 1.18
                    },
                    alerts: [
                        { type: 'behavior', level: 'low', message: 'Recently increased login frequency during volatility' }
                    ],
                    recommendedActions: [
                        { type: 'review', title: 'Goals Review', description: 'Retirement planning update needed', priority: 'medium' },
                        { type: 'rebalance', title: 'Rebalance Fixed Income', description: 'Duration adjustment recommended', priority: 'low' }
                    ],
                    lastUpdate: '2025-03-29T11:45:00Z'
                }
            ];

            setClients(mockClients);
            setSelectedClient(mockClients[0]);
            setIsLoading(false);
        }, 1200);
    };

    const fetchClientInsights = (clientId) => {
        setIsLoading(true);

        // Mock data - in a real app, this would be an API call
        setTimeout(() => {
            // Behavioral insights
            const mockInsights = {
                riskTolerance: {
                    score: 6.8,
                    category: 'Moderate-Aggressive',
                    description: 'Comfortable with market volatility but seeks some downside protection'
                },
                behavioralPatterns: [
                    {
                        pattern: 'Loss Aversion',
                        description: 'Tendency to sell positions after market declines of >3%',
                        strength: 'high',
                        recommendations: [
                            'Implement 48-hour cooling period before sell decisions during volatility',
                            'Review long-term goals during next meeting to reinforce strategy'
                        ]
                    },
                    {
                        pattern: 'Recency Bias',
                        description: 'Overweighting recent market events in decision making',
                        strength: 'medium',
                        recommendations: [
                            'Provide historical context for current market conditions',
                            'Share case studies of recovery patterns'
                        ]
                    }
                ],
                marketEvents: {
                    volatilityResponse: 'Increased contact frequency during downturns',
                    fearIndicator: 7.2,
                    greedIndicator: 5.4
                }
            };

            // Client activity history
            const mockHistory = [
                {
                    date: '2025-03-28',
                    action: 'Sold $120,000 of technology stocks',
                    marketContext: {
                        marketChange: -2.8,
                        sectorChange: -3.9
                    },
                    sentiment: 'anxious',
                    notes: 'Called expressing concerns about tech sector valuations'
                },
                {
                    date: '2025-03-15',
                    action: 'Logged in 12 times without taking action',
                    marketContext: {
                        marketChange: -4.2,
                        sectorChange: -5.1
                    },
                    sentiment: 'uncertain',
                    notes: 'No contact made despite increased login activity'
                },
                {
                    date: '2025-02-22',
                    action: 'Purchased $200,000 of value stocks',
                    marketContext: {
                        marketChange: 1.8,
                        sectorChange: 2.3
                    },
                    sentiment: 'confident',
                    notes: 'Discussed strategy to increase exposure to value stocks'
                },
                {
                    date: '2025-01-15',
                    action: 'Quarterly portfolio review meeting',
                    marketContext: {
                        marketChange: 0.2,
                        sectorChange: 0.1
                    },
                    sentiment: 'neutral',
                    notes: 'Discussed upcoming liquidity needs for real estate purchase'
                }
            ];

            setBehavioralInsights(mockInsights);
            setClientHistory(mockHistory);
            setIsLoading(false);
        }, 800);
    };

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        setSelectedClient(client);
    };

    const filterAlerts = (alerts) => {
        if (alertFilter === 'all') return alerts;
        return alerts.filter(alert => alert.type === alertFilter);
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

    if (isLoading && !selectedClient) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading client data...</p>
            </div>
        );
    }

    return (
        <div className="client-insights-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Client Insights Hub</h1>
                <p className="subtitle">Analyze and coach individual clients based on behavioral patterns</p>
            </motion.div>

            <div className="client-selector-bar">
                <div className="client-dropdown">
                    <label>Select Client:</label>
                    <select
                        value={selectedClient?.id || ''}
                        onChange={(e) => handleClientChange(e.target.value)}
                        disabled={isLoading}
                    >
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.name} ({client.id})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="alert-filter">
                    <label>Filter Alerts:</label>
                    <div className="filter-options">
                        <button
                            className={`filter-btn ${alertFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setAlertFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${alertFilter === 'behavior' ? 'active' : ''}`}
                            onClick={() => setAlertFilter('behavior')}
                        >
                            Behavioral
                        </button>
                        <button
                            className={`filter-btn ${alertFilter === 'liquidity' ? 'active' : ''}`}
                            onClick={() => setAlertFilter('liquidity')}
                        >
                            Liquidity
                        </button>
                    </div>
                </div>
            </div>

            {selectedClient && (
                <motion.div
                    className="insights-dashboard"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="insights-columns">
                        <motion.div className="column-left" variants={itemVariants}>
                            <PortfolioSummaryCard clientData={selectedClient} />

                            <motion.div
                                className="client-alerts-card"
                                variants={itemVariants}
                            >
                                <div className="card-header">
                                    <h2>Client Alerts</h2>
                                    <span className="alert-count">{filterAlerts(selectedClient.alerts).length} Active</span>
                                </div>

                                {filterAlerts(selectedClient.alerts).length === 0 ? (
                                    <div className="no-alerts-message">
                                        <i className="fas fa-check-circle"></i>
                                        <p>No {alertFilter !== 'all' ? alertFilter : ''} alerts for this client</p>
                                    </div>
                                ) : (
                                    <ul className="alerts-list">
                                        {filterAlerts(selectedClient.alerts).map((alert, index) => (
                                            <motion.li
                                                key={index}
                                                className={`alert-item ${alert.level}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="alert-icon">
                                                    <i className={`fas ${alert.type === 'behavior' ? 'fa-brain' :
                                                            alert.type === 'liquidity' ? 'fa-water' : 'fa-exclamation-circle'
                                                        }`}></i>
                                                </div>
                                                <div className="alert-content">
                                                    <span className="alert-message">{alert.message}</span>
                                                    <span className="alert-type">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert</span>
                                                </div>
                                                <div className="alert-actions">
                                                    <button className="alert-action-btn">
                                                        <i className="fas fa-arrow-right"></i>
                                                    </button>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        </motion.div>

                        <motion.div className="column-right" variants={itemVariants}>
                            {isLoading || !behavioralInsights ? (
                                <div className="loading-insights">
                                    <div className="loading-spinner"></div>
                                    <p>Loading client insights...</p>
                                </div>
                            ) : (
                                <>
                                    {behavioralInsights?.riskTolerance && (
                                        <motion.div className="behavioral-profile-card" variants={itemVariants}>
                                            <h2>Behavioral Profile</h2>
                                            <div className="risk-tolerance-section">
                                                <h3>Risk Tolerance Analysis</h3>
                                                <div className="tolerance-wrapper">
                                                    <div className="tolerance-meter">
                                                        <div
                                                            className="tolerance-fill"
                                                            style={{ width: `${(behavioralInsights?.riskTolerance?.score / 10 || 0) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="tolerance-labels">
                                                        <span>Conservative</span>
                                                        <span>Moderate</span>
                                                        <span>Aggressive</span>
                                                    </div>
                                                </div>
                                                <div className="tolerance-info">
                                                    <div className="tolerance-score">
                                                        <span className="score-value">{behavioralInsights?.riskTolerance?.score ?? '-'}</span>
                                                        <span className="score-label">/10</span>
                                                    </div>
                                                    <div className="tolerance-details">
                                                        <span className="tolerance-category">{behavioralInsights?.riskTolerance?.category ?? 'N/A'}</span>
                                                        <p className="tolerance-description">{behavioralInsights?.riskTolerance?.description ?? 'No description available'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {behavioralInsights?.behavioralPatterns?.length > 0 && (
                                                <div className="behavioral-patterns-section">
                                                    <h3>Identified Patterns</h3>
                                                    <div className="patterns-list">
                                                        {behavioralInsights.behavioralPatterns.map((pattern, index) => (
                                                            <div key={index} className={`pattern-card ${pattern.strength}`}>
                                                                <div className="pattern-header">
                                                                    <h4>{pattern.pattern}</h4>
                                                                    <span className={`strength-badge ${pattern.strength}`}>
                                                                        {pattern.strength.charAt(0).toUpperCase() + pattern.strength.slice(1)}
                                                                    </span>
                                                                </div>
                                                                <p className="pattern-description">{pattern.description}</p>
                                                                <div className="recommendations-section">
                                                                    <h5>Recommendations</h5>
                                                                    <ul className="recommendations-list">
                                                                        {pattern.recommendations.map((rec, recIndex) => (
                                                                            <li key={recIndex}>
                                                                                <i className="fas fa-check"></i>
                                                                                <span>{rec}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    <motion.div className="client-history-card" variants={itemVariants}>
                                        <h2>Client Activity History</h2>
                                        <div className="history-timeline">
                                            {clientHistory.map((event, index) => (
                                                <div key={index} className={`timeline-item ${event.sentiment}`}>
                                                    <div className="timeline-date">
                                                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        <div className="date-line"></div>
                                                    </div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-header">
                                                            <h4>{event.action}</h4>
                                                            <div className={`market-context ${event.marketContext.marketChange >= 0 ? 'positive' : 'negative'}`}>
                                                                <i className={`fas fa-chart-line ${event.marketContext.marketChange >= 0 ? 'up' : 'down'}`}></i>
                                                                <span>{event.marketContext.marketChange >= 0 ? '+' : ''}{event.marketContext.marketChange}%</span>
                                                            </div>
                                                        </div>
                                                        <p className="timeline-notes">{event.notes}</p>
                                                        <div className="timeline-sentiment">
                                                            <i className={`fas ${event.sentiment === 'confident' ? 'fa-smile' :
                                                                    event.sentiment === 'neutral' ? 'fa-meh' :
                                                                        event.sentiment === 'uncertain' ? 'fa-question-circle' : 'fa-frown'
                                                                }`}></i>
                                                            <span>{event.sentiment.charAt(0).toUpperCase() + event.sentiment.slice(1)} Sentiment</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </motion.div>

                    </div>

                    <motion.div
                        className="coaching-recommendations"
                        variants={itemVariants}
                    >
                        <h2>Coaching Action Plan</h2>
                        <div className="coaching-grid">
                            <div className="coaching-card immediate">
                                <h3>Immediate Actions</h3>
                                <ul className="coaching-list">
                                    {selectedClient.recommendedActions
                                        .filter(action => action.priority === 'high')
                                        .map((action, index) => (
                                            <li key={index}>
                                                <i className={`fas ${action.type === 'rebalance' ? 'fa-balance-scale' :
                                                        action.type === 'review' ? 'fa-search' :
                                                            action.type === 'tax' ? 'fa-file-invoice-dollar' :
                                                                action.type === 'behavioral' ? 'fa-brain' :
                                                                    action.type === 'liquidity' ? 'fa-water' : 'fa-exclamation-circle'
                                                    }`}></i>
                                                <span>{action.title}: {action.description}</span>
                                            </li>
                                        ))}

                                    {/* Add behavioral coaching recommendations if available */}
                                    {behavioralInsights?.behavioralPatterns
                                        .filter(pattern => pattern.strength === 'high')
                                        .map((pattern, patternIndex) =>
                                            pattern.recommendations.map((rec, recIndex) => (
                                                <li key={`${patternIndex}-${recIndex}`}>
                                                    <i className="fas fa-brain"></i>
                                                    <span>{rec}</span>
                                                </li>
                                            ))
                                        )}
                                </ul>
                                <button className="coaching-action-btn">Schedule Call</button>
                            </div>

                            <div className="coaching-card next-meeting">
                                <h3>Next Meeting Agenda</h3>
                                <ul className="coaching-list">
                                    {selectedClient.recommendedActions
                                        .filter(action => action.priority === 'medium')
                                        .map((action, index) => (
                                            <li key={index}>
                                                <i className={`fas ${action.type === 'rebalance' ? 'fa-balance-scale' :
                                                        action.type === 'review' ? 'fa-search' :
                                                            action.type === 'tax' ? 'fa-file-invoice-dollar' :
                                                                action.type === 'behavioral' ? 'fa-brain' :
                                                                    action.type === 'liquidity' ? 'fa-water' : 'fa-exclamation-circle'
                                                    }`}></i>
                                                <span>{action.title}: {action.description}</span>
                                            </li>
                                        ))}

                                    {/* Add medium priority behavioral recommendations */}
                                    {behavioralInsights?.behavioralPatterns
                                        .filter(pattern => pattern.strength === 'medium')
                                        .map((pattern, patternIndex) =>
                                            pattern.recommendations.map((rec, recIndex) => (
                                                <li key={`${patternIndex}-${recIndex}`}>
                                                    <i className="fas fa-brain"></i>
                                                    <span>{rec}</span>
                                                </li>
                                            ))
                                        )}
                                </ul>
                                <button className="coaching-action-btn">Prepare Materials</button>
                            </div>

                            <div className="coaching-card resources">
                                <h3>Resources & Materials</h3>
                                <ul className="resources-list">
                                    <li>
                                        <i className="fas fa-file-pdf"></i>
                                        <span>Loss Aversion Coaching Guide</span>
                                        <button className="resource-btn">View</button>
                                    </li>
                                    <li>
                                        <i className="fas fa-chart-line"></i>
                                        <span>Market Volatility Perspective</span>
                                        <button className="resource-btn">View</button>
                                    </li>
                                    <li>
                                        <i className="fas fa-video"></i>
                                        <span>Behavioral Finance Training</span>
                                        <button className="resource-btn">View</button>
                                    </li>
                                </ul>
                                <button className="coaching-action-btn full-width">Access All Resources</button>
                            </div>
                        </div>
                    </motion.div>

                    <div className="insights-actions">
                        <button className="insight-action-btn outline">
                            <i className="fas fa-file-alt"></i>
                            Generate Client Report
                        </button>
                        <button className="insight-action-btn">
                            <i className="fas fa-phone-alt"></i>
                            Contact Client
                        </button>
                        <button className="insight-action-btn primary">
                            <i className="fas fa-calendar-alt"></i>
                            Schedule Strategy Session
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ClientInsightsHub;