from pydantic import BaseModel
from datetime import datetime
import pandas as pd
import numpy as np
from prophet import Prophet
from fastapi import FastAPI, HTTPException, Query

app = FastAPI()

# Helper function to validate date format
def is_valid_date(date_str: str) -> bool:
    try:
        datetime.strptime(date_str, "%Y-%m-%d")  # Check if date is in YYYY-MM-DD format
        return True
    except ValueError:
        return False

# Generating synthetic liquidity data
def generate_synthetic_transactions(start_date="2023-01-01", end_date="2024-12-31", seed=42):
    np.random.seed(seed)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')

    data = []
    for date in dates:
        if date.weekday() >= 5:  # Skip weekends
            continue
        
        inflow = np.random.normal(loc=80000, scale=15000)
        inflow = max(inflow, 0)  # No negative inflow
        
        base_outflow = np.random.normal(loc=50000, scale=10000)
        if np.random.rand() < 0.1:  # 10% chance of an unexpected expense spike
            base_outflow += np.random.normal(loc=30000, scale=15000)
        base_outflow = max(base_outflow, 0)  # No negative outflow
        
        net_cash_flow = inflow - base_outflow

        data.append({
            "date": date,
            "inflow": round(inflow, 2),
            "outflow": round(base_outflow, 2),
            "net_cash_flow": round(net_cash_flow, 2)
        })

    df = pd.DataFrame(data)
    return df

# Forecasting cash flow using Prophet
def forecast_cash_flow(df, periods=30):
    df = df.rename(columns={"date": "ds", "net_cash_flow": "y"})  # Prepare for Prophet
    model = Prophet()
    model.fit(df)
    
    # Generate future dates and forecast
    future = model.make_future_dataframe(periods=periods, freq='D')  # Fixed: removed df parameter
    
    # Make the forecast
    forecast = model.predict(future)
    
    # Return the forecast data (only relevant columns)
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

# Pydantic model for input validation
class ForecastParams(BaseModel):
    start_date: str = "2023-01-01"
    end_date: str = "2024-12-31"
    periods: int = 30

# Define thresholds for liquidity and fund allocation
LIQUIDITY_THRESHOLD_LOW = 5000  # Minimum net cash flow to cover short-term obligations
LIQUIDITY_THRESHOLD_HIGH = 100000  # Maximum surplus before reallocating funds
LIQUIDITY_SURPLUS_WARNING = 0.2  # 20% surplus means consider rebalancing

# Function to generate fund rebalancing recommendations
def generate_rebalancing_recommendations(forecast, current_cash_balance):
    recommendations = []
    
    # Analyze forecast and compare with current cash balance
    for i, row in forecast.iterrows():
        predicted_cash_flow = row['yhat']
        
        # If predicted liquidity is below the minimum threshold, suggest moving funds to cash
        if predicted_cash_flow < LIQUIDITY_THRESHOLD_LOW:
            recommendations.append(f"Prediction for {row['ds']} shows low liquidity ({predicted_cash_flow}), recommend transferring funds to short-term liquid assets.")
        
        # If predicted liquidity is above the high threshold, suggest investing surplus funds
        elif predicted_cash_flow > LIQUIDITY_THRESHOLD_HIGH:
            surplus = predicted_cash_flow - LIQUIDITY_THRESHOLD_HIGH
            if surplus / predicted_cash_flow > LIQUIDITY_SURPLUS_WARNING:
                recommendations.append(f"Prediction for {row['ds']} shows high surplus liquidity ({predicted_cash_flow}), recommend reallocating {surplus} to long-term investments.")
    
    # Return the recommendations list
    return recommendations

class UnexpectedEvent(BaseModel):
    type: str  # 'inflow' or 'outflow'
    probability: float
    amount: float

class CashFlowModelInput(BaseModel):
    initial_balance: float
    periods: int = 30
    net_cash_flow_forecast: list[float] = None  # Optional
    inflow: float = 80000
    outflow: float = 50000
    unexpected_events: list[UnexpectedEvent] = []

##
def cash_flow_modeling_tool(forecast_df, initial_balance=100000, threshold=20000):
    yhat_values = forecast_df['yhat'].tolist()
    dates = forecast_df['ds'].tolist()

    balance = initial_balance
    modeled_output = []

    for i in range(len(yhat_values)):
        cash_flow = yhat_values[i]

        # Optionally simulate unexpected events here
        if np.random.rand() < 0.05:
            cash_flow -= np.random.normal(10000, 3000)

        balance += cash_flow

        recommendation = "OK"
        if balance < threshold:
            recommendation = "Rebalance funds: Low liquidity"

        modeled_output.append({
            "date": str(dates[i].date()),
            "predicted_cash_flow": round(cash_flow, 2),
            "projected_balance": round(balance, 2),
            "recommendation": recommendation
        })

    return modeled_output



# Route to generate and return synthetic data
@app.get("/api/synthetic-data")
def get_synthetic_data():
    df = generate_synthetic_transactions()  # Generate synthetic data
    return df.to_dict(orient="records")

# Route to forecast future cash flow (next 30 days by default)
@app.get("/api/forecast")
async def get_forecast(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    periods: int = Query(30, ge=1, description="Number of periods to forecast"),
    current_cash_balance: float = Query(..., description="Current available cash balance")
):
    # Validate date format (optional)
    if not is_valid_date(start_date):
        raise HTTPException(status_code=400, detail="Invalid start_date format. Expected YYYY-MM-DD.")
    if not is_valid_date(end_date):
        raise HTTPException(status_code=400, detail="Invalid end_date format. Expected YYYY-MM-DD.")
    
    # Generate the synthetic data for the given period
    df = generate_synthetic_transactions(start_date=start_date, end_date=end_date)
    
    # Call the forecasting function with the synthetic data and periods
    forecast = forecast_cash_flow(df, periods=periods)
    
    # Generate rebalancing recommendations based on forecast and current cash balance
    rebalancing_recommendations = generate_rebalancing_recommendations(forecast, current_cash_balance)
    
    # Return the forecast data along with rebalancing recommendations
    return {
        "forecast": forecast.to_dict(orient="records"),
        "rebalancing_recommendations": rebalancing_recommendations
    }

#
# Option 1: Add a new GET endpoint for the cash flow modeling tool
@app.get("/api/cash-flow-modeling")
async def get_cash_flow_modeling(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    periods: int = Query(30, ge=1, description="Number of periods to forecast"),
    initial_balance: float = Query(100000.0, description="Initial cash balance"),
    threshold: float = Query(20000.0, description="Minimum balance threshold")
):
    # Validate date format
    if not is_valid_date(start_date):
        raise HTTPException(status_code=400, detail="Invalid start_date format. Expected YYYY-MM-DD.")
    if not is_valid_date(end_date):
        raise HTTPException(status_code=400, detail="Invalid end_date format. Expected YYYY-MM-DD.")
    
    # Generate synthetic data
    df = generate_synthetic_transactions(start_date=start_date, end_date=end_date)
    
    # Get forecast
    forecast = forecast_cash_flow(df, periods=periods)
    
    # Use the cash flow modeling tool
    modeling_results = cash_flow_modeling_tool(forecast, initial_balance=initial_balance, threshold=threshold)
    
    return {
        "initial_balance": initial_balance,
        "threshold": threshold,
        "modeling_results": modeling_results
    }



