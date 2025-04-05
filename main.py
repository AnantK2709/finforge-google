# 📁 FILE: main.py (FastAPI app)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from mood_utils import classify_mood
from portfolio_utils import get_portfolio_context
from snowflake_utils import insert_mood_log_snowflake
# ✅ Run this using: uvicorn main:app
import re
import json
import datetime
import numpy as np
import pandas as pd
import yfinance as yf
import cvxpy as cp
import uvicorn
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from groq_utils import call_groq_behavior_insight
import snowflake.connector

app = FastAPI()

# Enable CORS if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary in-memory store
mood_logs = []

class MoodEntry(BaseModel):
    user_id: str
    journal_entry: str
    mood_rating: int | None = None

@app.post("/api/mood-journal")
async def mood_journal(entry: MoodEntry):
    timestamp = datetime.utcnow().isoformat()
    mood = classify_mood(entry.journal_entry)
    portfolio_context = get_portfolio_context(entry.user_id, timestamp)

    log_entry = {
        "user_id": entry.user_id,
        "timestamp": timestamp,
        "journal_entry": entry.journal_entry,
        "mood_rating": entry.mood_rating,
        "mood": mood,
        "portfolio_change_pct": portfolio_context['portfolio_change_pct'],
        "action_taken": portfolio_context['action_taken']
    }

    insert_mood_log_snowflake(log_entry)
    mood_logs.append(log_entry)

    return {"message": "Journal saved!", "log": log_entry}

@app.get("/api/mood-insights/{user_id}")
async def mood_insights(user_id: str):
    # Connect to Snowflake
    conn = snowflake.connector.connect(
        user="KEVENDRON",
        password="K4NRBPtrN4EYh8V",
        account="QGMLZIH-TG75052",
        warehouse="COMPUTE_WH",
        database="MOOD_TRACKER_DB",
        schema="PUBLIC"
    )
    cs = conn.cursor()
    user_id = user_id.strip()
    try:
        cs.execute("""
        SELECT timestamp, mood, portfolio_change_pct, action_taken
        FROM mood_logs
        WHERE user_id = %(user_id)s
    """, {"user_id": user_id})
        rows = cs.fetchall()
        print(f"[DEBUG] Got {len(rows)} rows from Snowflake for user_id: {user_id}")

    finally:
        cs.close()
        conn.close()

    if not rows:
        return {"insight": "No mood logs found for this user."}

    # Format rows into list of dicts
    user_data = []
    for row in rows:
        user_data.append({
            "timestamp": row[0],
            "mood": row[1],
            "portfolio_change_pct": row[2],
            "action_taken": row[3]
        })

    # ✨ Send to Groq for insight
    insight = call_groq_behavior_insight(user_data)

    return {
        "user_id": user_id,
        "logs_analyzed": len(user_data),
        "insight": insight
    }

# ------------------------------------------------------------------------
# 1. Predefine the top 10 stocks for each sector.
#    Each stock is assigned to one sector.
# ------------------------------------------------------------------------
SECTOR_STOCKS = {
    "semiconductor": [
        "TSM", "NVDA", "AMD", "INTC", "ASML", "MU", "TXN", "QCOM", "AVGO", "AMAT"
    ],
    "banks": [
        "JPM", "BAC", "WFC", "C", "GS", "MS", "USB", "PNC", "TFC", "BK"
    ],
    "internet": [
        "GOOGL", "META", "AMZN", "NFLX", "BIDU", "TWTR", "SNAP", "PINS", "EBAY", "BKNG"
    ],
    "healthcare": [
        "JNJ", "PFE", "MRK", "ABT", "TMO", "UNH", "ABBV", "LLY", "AMGN", "GILD"
    ]
}

# Build a mapping from stock symbol to sector.
STOCK_TO_SECTOR = {}
for sector, stocks in SECTOR_STOCKS.items():
    for stock in stocks:
        STOCK_TO_SECTOR[stock] = sector

# ------------------------------------------------------------------------
# 2. Pydantic model for structured portfolio requests.
# ------------------------------------------------------------------------
class PortfolioRequest(BaseModel):
    sectors: List[str]  # List of sectors, e.g. ["semiconductor", "banks"]
    risk_level: int = 5  # 1 (very risk averse) to 10 (risk tolerant)
    capital: float = 10000.0

# ------------------------------------------------------------------------
# 3. Pydantic model for chatbot (free-form text) requests.
# ------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str

# ------------------------------------------------------------------------
# 4. Function to fetch historical stock data using yfinance.
#    Uses explicit start and end dates.
# ------------------------------------------------------------------------
def fetch_data_for_stocks(stocks: List[str], years: int = 5) -> pd.DataFrame:
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=years * 365)
    
    data = yf.download(stocks, start=start_date, end=end_date, auto_adjust=True)
    # Use adjusted close prices if available.
    if "Adj Close" in data.columns:
        df_prices = data["Adj Close"]
    else:
        df_prices = data["Close"]
    
    if isinstance(df_prices, pd.Series):
        df_prices = df_prices.to_frame()
    
    if df_prices.empty:
        print("No data returned for tickers:", stocks)
    
    return df_prices

# ------------------------------------------------------------------------
# 5. Function to compute expected annual returns and annual covariance.
# ------------------------------------------------------------------------
def compute_returns_and_annual_stats(df_prices: pd.DataFrame):
    daily_returns = df_prices.pct_change().dropna()
    avg_daily_returns = daily_returns.mean()
    expected_annual_return = avg_daily_returns * 252

    daily_cov = daily_returns.cov()
    annual_cov = daily_cov * 252

    return expected_annual_return, annual_cov

# ------------------------------------------------------------------------
# 6. Markowitz Mean-Variance Optimization using cvxpy.
# ------------------------------------------------------------------------
def markowitz_optimization(expected_returns, cov_matrix, risk_level: int):
    n = len(expected_returns)
    mu = np.array(expected_returns)
    Sigma = np.array(cov_matrix)
    
    # Translate risk level (1-10) into a risk penalty factor (gamma).
    gamma = 11 - risk_level  # Lower risk level (more risk averse) implies higher gamma.

    # Optimization variable: portfolio weights.
    w = cp.Variable(n)
    
    # Objective: minimize negative return plus risk penalty.
    objective = cp.Minimize(-mu @ w + gamma * cp.quad_form(w, Sigma))
    constraints = [cp.sum(w) == 1, w >= 0]
    
    problem = cp.Problem(objective, constraints)
    problem.solve()
    
    weights = w.value
    port_return = mu @ weights
    port_volatility = np.sqrt(weights.T @ Sigma @ weights)
    
    return weights, port_return, port_volatility

# ------------------------------------------------------------------------
# 7. Portfolio generation function.
#    Combines stocks from multiple sectors.
# ------------------------------------------------------------------------
def generate_portfolio(sectors: List[str], risk_level: int, capital: float):
    valid_sectors = [s.lower() for s in SECTOR_STOCKS.keys()]
    selected_sectors = [s.lower() for s in sectors if s.lower() in valid_sectors]
    
    if not selected_sectors:
        raise ValueError("No valid sectors selected.")
    
    # Combine stock symbols from all selected sectors.
    stocks = []
    for sec in selected_sectors:
        stocks.extend(SECTOR_STOCKS[sec])
    stocks = list(set(stocks))  # Remove duplicates if any.
    
    # Fetch historical price data.
    df_prices = fetch_data_for_stocks(stocks, years=5)
    if df_prices.empty:
        raise ValueError("Could not fetch data for the selected stocks.")
    
    exp_annual_return, annual_cov = compute_returns_and_annual_stats(df_prices)
    weights, port_return, port_volatility = markowitz_optimization(exp_annual_return, annual_cov, risk_level)
    
    # Build allocations, including sector information.
    stock_allocations = {}
    for symbol, weight in zip(exp_annual_return.index, weights):
        stock_allocations[symbol] = {
            "weight": round(float(weight), 4),
            "capital": round(float(weight * capital), 2),
            "sector": STOCK_TO_SECTOR.get(symbol, "Unknown")
        }
    
    # Sort allocations by allocated capital (highest first).
    sorted_allocations = dict(
        sorted(stock_allocations.items(), key=lambda item: item[1]["capital"], reverse=True)
    )
    
    response = {
        "sectors": selected_sectors,
        "risk_level": risk_level,
        "total_capital": capital,
        "expected_annual_return": round(float(port_return), 4),
        "expected_annual_volatility": round(float(port_volatility), 4),
        "stock_allocations": sorted_allocations
    }
    
    return response

# ------------------------------------------------------------------------
# 8. Call GROQ API to parse the free-form message.
#    This function calls the external GROQ API using your API key and model.
# ------------------------------------------------------------------------
def call_groq_api(message: str) -> dict:
    # Changed URL to use the chat completions endpoint from your example.
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
    }
    
    # System message instructs the assistant to extract investment parameters.
    system_message = {
        "role": "system",
        "content": (
            "You are an assistant that extracts investment parameters from text. "
            "Return only a JSON object with the keys: 'capital' (number), "
            "'risk_level' (integer), and 'sectors' (list of strings)."
        )
    }
    
    # User message contains the free-form input.
    user_message = {
        "role": "user",
        "content": f"Extract the parameters from the following text: \"{message}\""
    }
    
    data = {
        "model": "llama-3.1-8b-instant",  # using your original model
        "messages": [system_message, user_message],
        "temperature": 0.0,
        "max_tokens": 150
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Error from GROQ API: {response.text}")
    
    result = response.json()
    try:
        # Extract the assistant's message content.
        text = result["choices"][0]["message"]["content"]
        parsed = json.loads(text)
    except Exception as e:
        raise Exception("Error parsing JSON from GROQ API response: " + str(e))
    
    return parsed


# ------------------------------------------------------------------------
# 9. FastAPI endpoint for structured portfolio requests.
# ------------------------------------------------------------------------
@app.post("/portfolio")
async def portfolio_endpoint(request: PortfolioRequest):
    try:
        response = generate_portfolio(request.sectors, request.risk_level, request.capital)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return response

# ------------------------------------------------------------------------
# 10. FastAPI endpoint for chatbot natural language input.
#     This endpoint uses the GROQ API to parse the free-form text.
# ------------------------------------------------------------------------
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    message = request.message
    try:
        parsed = call_groq_api(message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    capital = parsed.get("capital")
    risk_level = parsed.get("risk_level")
    sectors = parsed.get("sectors")
    
    if capital is None or risk_level is None or not sectors:
        raise HTTPException(
            status_code=400,
            detail="GROQ API did not return valid capital, risk level, and sectors."
        )
    
    try:
        portfolio = generate_portfolio(sectors, risk_level, capital)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return {
        "capital": capital,
        "risk_level": risk_level,
        "sectors": sectors,
        "portfolio": portfolio
    }

# ------------------------------------------------------------------------
# 11. Run the FastAPI application with uvicorn.
# ------------------------------------------------------------------------
if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=8000)
