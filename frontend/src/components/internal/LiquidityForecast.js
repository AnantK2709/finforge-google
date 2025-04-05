import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './LiquidityForecast.css';

const LiquidityForecast = ({ data }) => {
  // Process data to create monthly forecast
  const monthlyForecast = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group by month
    const monthlyData = data.reduce((acc, day) => {
      const date = new Date(day.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          monthYear,
          month: new Date(day.date).toLocaleString('default', { month: 'short' }),
          year: new Date(day.date).getFullYear(),
          inflows: 0,
          outflows: 0,
          netCashFlow: 0,
          endingBalance: 0,
          days: []
        };
      }
      
      // Add day's net cash flow to the monthly total
      if (day.netCashFlow > 0) {
        acc[monthYear].inflows += day.netCashFlow;
      } else {
        acc[monthYear].outflows += Math.abs(day.netCashFlow);
      }
      
      acc[monthYear].netCashFlow += day.netCashFlow;
      acc[monthYear].days.push(day);
      
      return acc;
    }, {});
    
    // Convert to array and calculate ending balances
    const monthsArray = Object.values(monthlyData).sort((a, b) => a.monthYear.localeCompare(b.monthYear));
    
    // Calculate ending balance for each month
    let runningBalance = data[0].runningBalance || 0;
    monthsArray.forEach(month => {
      runningBalance += month.netCashFlow;
      month.endingBalance = runningBalance;
    });
    
    return monthsArray;
  }, [data]);
  
  // Calculate threshold for minimum cash balance
  const threshold = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data[0].threshold || 200000; // Default threshold if not provided
  }, [data]);
  
  // Calculate liquidity metrics
  const metrics = useMemo(() => {
    if (monthlyForecast.length === 0) return null;
    
    const totalInflows = monthlyForecast.reduce((sum, month) => sum + month.inflows, 0);
    const totalOutflows = monthlyForecast.reduce((sum, month) => sum + month.outflows, 0);
    const avgMonthlyNet = monthlyForecast.reduce((sum, month) => sum + month.netCashFlow, 0) / monthlyForecast.length;
    const liquidityRatio = totalInflows / (totalOutflows || 1); // Avoid division by zero
    
    const minBalance = Math.min(...monthlyForecast.map(m => m.endingBalance));
    const maxBalance = Math.max(...monthlyForecast.map(m => m.endingBalance));
    
    const belowThresholdMonths = monthlyForecast.filter(m => m.endingBalance < threshold);
    
    return {
      totalInflows,
      totalOutflows,
      avgMonthlyNet,
      liquidityRatio,
      minBalance,
      maxBalance,
      belowThresholdMonths
    };
  }, [monthlyForecast, threshold]);
  
  if (!data || data.length === 0) {
    return (
      <div className="no-data-message">
        <i className="fas fa-chart-line"></i>
        <p>No liquidity data available for forecast.</p>
      </div>
    );
  }
  
  return (
    <div className="liquidity-forecast-container">
      <div className="forecast-metrics">
        <motion.div 
          className="metric-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="metric-value">${Math.round(metrics.avgMonthlyNet).toLocaleString()}</div>
          <div className="metric-label">Avg. Monthly Net Cash Flow</div>
        </motion.div>
        
        <motion.div 
          className="metric-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="metric-value">{metrics.liquidityRatio.toFixed(2)}</div>
          <div className="metric-label">Liquidity Ratio (Inflows/Outflows)</div>
        </motion.div>
        
        <motion.div 
          className={`metric-card ${metrics.belowThresholdMonths.length > 0 ? 'warning' : 'success'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="metric-value">{metrics.belowThresholdMonths.length}</div>
          <div className="metric-label">Months Below Threshold</div>
        </motion.div>
      </div>
      
      <div className="forecast-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${Math.abs(value / 1000)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, '']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="inflows" 
              name="Inflows" 
              fill="#4caf50" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="outflows" 
              name="Outflows" 
              fill="#f44336" 
              radius={[4, 4, 0, 0]}
            />
            <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="ending-balance-chart">
        <h4>Projected Ending Cash Balance</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${Math.abs(value / 1000)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, '']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar 
              dataKey="endingBalance" 
              name="Ending Balance" 
              fill={({ endingBalance }) => endingBalance < threshold ? "#f44336" : "#2196f3"}
              radius={[4, 4, 0, 0]}
            />
            <ReferenceLine y={threshold} stroke="#ff9800" strokeDasharray="3 3" label={{ value: 'Min. Threshold', position: 'right', fill: '#ff9800', fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="monthly-forecast-table">
        <h4>Monthly Liquidity Forecast</h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Inflows</th>
                <th>Outflows</th>
                <th>Net Cash Flow</th>
                <th>Ending Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyForecast.map((month) => (
                <tr 
                  key={month.monthYear}
                  className={month.endingBalance < threshold ? 'below-threshold' : ''}
                >
                  <td>{month.month} {month.year}</td>
                  <td className="positive">${month.inflows.toLocaleString()}</td>
                  <td className="negative">${month.outflows.toLocaleString()}</td>
                  <td className={month.netCashFlow >= 0 ? 'positive' : 'negative'}>
                    ${Math.abs(month.netCashFlow).toLocaleString()}
                    {month.netCashFlow >= 0 ? ' (+)' : ' (-)'}
                  </td>
                  <td>${month.endingBalance.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${month.endingBalance < threshold ? 'warning' : 'success'}`}>
                      {month.endingBalance < threshold ? 'Below Threshold' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiquidityForecast;