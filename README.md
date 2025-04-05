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

- **My Behavior**:
  - Journaling feature to capture client emotions/thoughts about investments.
  - NLP-powered sentiment analysis converts entries into behavioral insights.
  - Helps clients align emotional awareness with rational financial decisions.

---

## 🧠 Technology Stack

### 🔧 Backend
- **FastAPI** — High-performance API backend
- **Snowflake** — Cloud-native data warehouse for real-time financial data
- **Prophet** — ML-based time series forecasting
- **Pydantic** — Data modeling and synthetic data generation
- **Markowitz Optimization** — Portfolio construction & risk management

### 🌐 Frontend
- **React.js** — Modern UI with component-based design
- **Framer Motion** — UI animations and transitions
- **Recharts** — Data visualization (bar, pie, area, line)
- **Tailwind CSS** — Utility-first styling

---

## 🏗️ Project Structure

