# 💼 FinSentient

**AI-Powered Comprehensive Financial Platform**

FinSentient is an advanced, full-stack platform designed to empower financial institutions, advisors, and clients with data-driven insights, predictive intelligence, and behavioral finance capabilities.

In today's turbulent markets, businesses are struggling with cash flow issues, outdated liquidity tools, and the growing need for sharper, smarter financial decisions. **FinSentient** bridges that gap—uniting cutting-edge AI, machine learning, and human behavior insights to drive strategic financial planning and decision-making.

---

## 🚀 Features at a Glance

### 🔹 For Financial Advisors
- **Advisor Dashboard**: Real-time overview of total assets, client count, average assets, and cash shortfall alerts.
- **Portfolio Monitoring**: Track monthly returns, risk levels, and sector-wise allocation.
- **Risk Heatmap**: Dynamic visualization of portfolio risk concentration across sectors.
- **Liquidity Intelligence**:
  - Forecast future cash flows using **Prophet ML time series** models.
  - Generate synthetic data using **Pydantic** for robust scenario analysis.
  - Recommend liquidity rebalancing strategies in real time.

### 🔹 For Clients
- **Client Dashboard**: Visual overview of total net worth and financial health.
- **My Portfolio & Risk**:
  - Choose investment amount, sectors (e.g., Semiconductor, Healthcare, Internet).
  - Specify risk tolerance (Very Low → Very High).
  - Generate personalized portfolios using the **Markowitz Model** capped at:
    - Max 15% per stock
    - Max 40% per sector
  - Get projections on expected annual return and portfolio volatility.

## 🎥 Demo


- **My Behavior**:
  - Journaling feature to capture client emotions/thoughts about investments.
  - NLP-powered sentiment analysis converts entries into behavioral insights.
  - Helps clients align emotional awareness with rational financial decisions.

---

## 🧠 Technology Stack

### 🔧 Backend
### 🔧 Backend
- **FastAPI** – High-performance Python web API framework
- **Snowflake** – Real-time, cloud-native data warehouse
- **Prophet** – ML-based time series forecasting for liquidity projection
- **Pydantic** – Data validation and synthetic data generation
- **Markowitz Model** – Machine learning-based portfolio optimization model paired with LLM for user input to hyper parameter creation for the model .
- **Groq API + LLaMA 3** – LLM integration for behavioral & financial insight generation
- **TextBlob** – NLP-based sentiment analysis for journaling data
- **Uvicorn** – ASGI server for fast async app deployment

### 🌐 Frontend
- **React.js** – Modern UI framework with reusable component architecture
- **Recharts** – Responsive charting for risk, performance, allocation
- **Framer Motion** – Smooth UI animations and transitions
- **Tailwind CSS** – Utility-first CSS framework for styling

---
## 🏗️ Project Structure

```bash
Finforge/
├── backend/                        # FastAPI backend
│   ├── main.py                    # Main API entry
│   ├── main2.py                   # Experimental or alternate API route
│   ├── groq_utils.py              # GROQ/LLM-based utilities
│   ├── mood_utils.py              # Sentiment & behavior tracking logic
│   ├── portfolio_utils.py         # Portfolio management utilities
│   ├── snowflake_utils.py         # Snowflake database interaction helpers
│   ├── test_fast.py               # FastAPI test runner
│   └── requirements.txt           # Backend dependencies

├── frontend/                      # React frontend
│   ├── public/                    # Static files
│   ├── src/                       # Main app source
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route-specific page components
│   │   ├── App.js                # App entry point
│   │   ├── index.js              # ReactDOM render
│   │   ├── App.css / index.css   # Global styles
│   │   └── logo.svg              # App logo
│   ├── README.md
│   ├── package.json              # Project config & scripts
│   └── package-lock.json

├── .gitignore
├── README.md                     # Project overview and instructions
```

**Backend Setup (FastAPI)**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```


**Frontend Setup (React)**
```bash
cd frontend
npm install
npm start
```


**Open in Browser**
```bash
http://localhost:3000
```




🧩 **Key Architecture Highlights**
Real-Time Data: Pulled from Snowflake and visualized in the dashboard.

ML Integration: Forecast liquidity & optimize portfolios.

LLM-Enhanced Behavior Insights: Combine journaling, NLP, and emotion tagging for smarter investing.

Secure & Scalable: Modular backend + cloud-based data infrastructure.


