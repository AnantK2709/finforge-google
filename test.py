from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime

app = Flask(__name__)

# Helper function to validate date format
def is_valid_date(date_str):
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
    future = model.make_future_dataframe(df, periods=periods)
    forecast = model.predict(future)
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

# Route to generate and return synthetic data
@app.route("/api/synthetic-data", methods=["GET"])
def get_synthetic_data():
    df = generate_synthetic_transactions()  # Generate synthetic data
    return jsonify(df.to_dict(orient="records"))

# Route to forecast future cash flow (next 30 days by default)
@app.route("/api/forecast", methods=["GET"])
def get_forecast():
    start_date = request.args.get('start_date', default="2023-01-01", type=str)
    end_date = request.args.get('end_date', default="2024-12-31", type=str)
    periods = request.args.get('periods', default=30, type=int)
    
    # Validate date format
    if not is_valid_date(start_date) or not is_valid_date(end_date):
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400
    
    df = generate_synthetic_transactions(start_date=start_date, end_date=end_date)
    forecast = forecast_cash_flow(df, periods=periods)
    
    forecast_data = forecast.to_dict(orient="records")
    return jsonify(forecast_data)

if __name__ == "__main__":
    app.run(debug=True)

