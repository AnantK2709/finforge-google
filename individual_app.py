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

app = FastAPI()

# ------------------------------------------------------------------------
# 1. Define the top 10 stocks for each of 5 sectors.
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
    ],
    "consumer": [
        "PG", "KO", "PEP", "MCD", "NKE", "SBUX", "TGT", "WMT", "COST", "DIS"
    ]
}

# ------------------------------------------------------------------------
# 2. Mapping from ticker to sector (for display purposes).
# ------------------------------------------------------------------------
STOCK_TO_SECTOR = {}
for sector, stocks in SECTOR_STOCKS.items():
    for stock in stocks:
        STOCK_TO_SECTOR[stock] = sector

# ------------------------------------------------------------------------
# 3. Pydantic models.
#    a. PortfolioRequest for structured requests.
#    b. ChatRequest for free‑form text requests.
# ------------------------------------------------------------------------
class PortfolioRequest(BaseModel):
    sectors: List[str]       # e.g. ["banks", "internet", "consumer"]
    risk_level: str          # one of: "very low", "low", "moderate", "high", "very high"
    capital: float = 10000.0

class ChatRequest(BaseModel):
    message: str

# ------------------------------------------------------------------------
# 4. Function to fetch historical stock data for each ticker individually.
# ------------------------------------------------------------------------
def fetch_data_for_stocks(tickers: List[str], years: int = 5) -> pd.DataFrame:
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=years * 365)
    dfs = []
    for ticker in tickers:
        df = yf.download(ticker, start=start_date, end=end_date, auto_adjust=True)
        if not df.empty:
            # Prefer adjusted close prices if available.
            if "Adj Close" in df.columns:
                close_data = df["Adj Close"]
            else:
                close_data = df["Close"]
            if isinstance(close_data, pd.Series):
                close_data = close_data.to_frame(name=ticker)
            else:
                close_data.columns = [ticker]
            dfs.append(close_data)
        else:
            print(f"No data returned for ticker: {ticker}")
    if dfs:
        df_prices = pd.concat(dfs, axis=1)
    else:
        df_prices = pd.DataFrame()
    return df_prices

# ------------------------------------------------------------------------
# 5. Compute expected annual returns and covariance matrix.
# ------------------------------------------------------------------------
def compute_returns_and_annual_stats(df_prices: pd.DataFrame):
    daily_returns = df_prices.pct_change().dropna()
    avg_daily_returns = daily_returns.mean()
    expected_annual_return = avg_daily_returns * 252

    daily_cov = daily_returns.cov()
    annual_cov = daily_cov * 252

    return expected_annual_return, annual_cov

# ------------------------------------------------------------------------
# 6. Basic Markowitz Optimization for individual investors.
#    (No extra constraints are applied.)
# ------------------------------------------------------------------------
def markowitz_optimization(expected_returns, cov_matrix, risk_level: str):
    # Map categorical risk levels to a numeric risk penalty.
    risk_mapping = {
        "very low": 10,
        "low": 8,
        "moderate": 6,
        "high": 4,
        "very high": 2
    }
    key = risk_level.lower().strip()
    if key not in risk_mapping:
        raise ValueError("Invalid risk level. Use one of: very low, low, moderate, high, very high.")
    gamma = risk_mapping[key]

    n = len(expected_returns)
    mu = np.array(expected_returns)
    Sigma = np.array(cov_matrix)

    # Define the optimization variable.
    w = cp.Variable(n)
    constraints = [cp.sum(w) == 1, w >= 0]
    
    objective = cp.Minimize(-mu @ w + gamma * cp.quad_form(w, Sigma))
    problem = cp.Problem(objective, constraints)
    problem.solve()
    
    weights = w.value
    port_return = mu @ weights
    port_volatility = np.sqrt(weights.T @ Sigma @ weights)
    return weights, port_return, port_volatility

# ------------------------------------------------------------------------
# 7. Generate Individual Portfolio.
# ------------------------------------------------------------------------
def generate_portfolio(sectors: List[str], risk_level: str, capital: float):
    valid_sectors = [s.lower() for s in SECTOR_STOCKS.keys()]
    selected_sectors = [s.lower() for s in sectors if s.lower() in valid_sectors]
    if not selected_sectors:
        raise ValueError("No valid sectors selected.")
    
    # Combine tickers from the selected sectors.
    tickers = []
    for sec in selected_sectors:
        tickers.extend(SECTOR_STOCKS[sec])
    tickers = list(set(tickers))
    
    # Fetch historical price data.
    df_prices = fetch_data_for_stocks(tickers, years=5)
    if df_prices.empty:
        raise ValueError("Could not fetch data for the selected stocks.")
    
    exp_annual_return, annual_cov = compute_returns_and_annual_stats(df_prices)
    weights, port_return, port_volatility = markowitz_optimization(exp_annual_return, annual_cov, risk_level)
    
    stock_allocations = {}
    for symbol, weight in zip(exp_annual_return.index, weights):
        stock_allocations[symbol] = {
            "weight": round(float(weight), 4),
            "capital": round(float(weight * capital), 2),
            "sector": STOCK_TO_SECTOR.get(symbol, "Unknown")
        }
    
    sorted_allocations = dict(sorted(stock_allocations.items(), key=lambda item: item[1]["capital"], reverse=True))
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
# 8. LLM Call Function.
#
#    Calls your LLM (via the GROQ API) using your API key and model to extract
#    individual investor parameters from free-form text.
# ------------------------------------------------------------------------
def call_llm(message: str) -> dict:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
    }
    system_message = {
        "role": "system",
        "content": (
            "You are an assistant that extracts individual investor investment parameters from text. "
            "Return only a JSON object with the keys: 'sectors' (list of strings chosen from: 'semiconductor', 'banks', 'internet', 'healthcare', 'consumer'), "
            "'risk_level' (string; one of 'very low', 'low', 'moderate', 'high', 'very high'), and 'capital' (number). "
            "Map any synonyms to these canonical values."
        )
    }
    user_message = {
        "role": "user",
        "content": f"Extract the parameters from this text: \"{message}\""
    }
    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [system_message, user_message],
        "temperature": 0.0,
        "max_tokens": 150
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Error from LLM: {response.text}")
    result = response.json()
    try:
        text = result["choices"][0]["message"]["content"]
        parsed = json.loads(text)
    except Exception as e:
        raise Exception("Error parsing JSON from LLM response: " + str(e))
    return parsed

# ------------------------------------------------------------------------
# 9. Individual Chat Endpoint.
#
#    Accepts a free-form text prompt, calls the LLM to extract parameters,
#    and then generates the portfolio.
# ------------------------------------------------------------------------
@app.post("/individual_chat")
async def individual_chat_endpoint(request: ChatRequest):
    message = request.message
    try:
        params = call_llm(message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    capital = params.get("capital")
    risk_level = params.get("risk_level")
    sectors = params.get("sectors")
    
    if capital is None or risk_level is None or not sectors:
        raise HTTPException(
            status_code=400,
            detail="LLM did not return valid parameters (capital, risk_level, and sectors are required)."
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
# 10. Structured Individual Investor Endpoint.
# ------------------------------------------------------------------------
@app.post("/portfolio")
async def portfolio_endpoint(request: PortfolioRequest):
    try:
        response = generate_portfolio(request.sectors, request.risk_level, request.capital)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return response

# ------------------------------------------------------------------------
# 11. Run the FastAPI application.
# ------------------------------------------------------------------------
if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=8000)
