from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import snowflake.connector
from typing import Any, Dict

app = FastAPI()

# Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, use ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Snowflake credentials/config
SNOWFLAKE_CONFIG = {
    "user": "KEVENDRON",
    "account": "QGMLZIH-TG75052",
    "password": "K4NRBPtrN4EYh8V",
    "warehouse": "COMPUTE_WH",
    "database": "MOOD_TRACKER_DB",
    "schema": "PUBLIC"
}

# Utility to run a query
def run_query(sql: str) -> Any:
    try:
        conn = snowflake.connector.connect(**SNOWFLAKE_CONFIG)
        cursor = conn.cursor()
        cursor.execute(sql)
        result = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        cursor.close()
        conn.close()
        return [dict(zip(columns, row)) for row in result]
    except Exception as e:
        print(f"❌ Query failed: {e}")
        raise

# Formatters for camelCase keys
def format_cash_alert(alert: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": alert.get("ID"),
        "clientName": alert.get("CLIENT_NAME"),
        "clientId": alert.get("CLIENT_ID"),
        "daysUntilShortfall": alert.get("DAYS_UNTIL_SHORTFALL"),
        "amount": alert.get("AMOUNT"),
        "probability": alert.get("PROBABILITY"),
        "recommendation": alert.get("RECOMMENDATION")
    }

def format_sector(row):
    return {
        "name": row["NAME"],
        "value": row["VALUE"]
    }

def format_monthly(row):
    return {
        "month": row["MONTH"],
        "return": row["RETURN"]
    }

import random

def format_risk(row):
    return {
        "level": row["LEVEL"],
        "clients": random.randint(10, 100)  # Simulated range
    }

@app.get("/api/dashboard-data")
def get_dashboard_data() -> Dict[str, Any]:
    try:
        print("🔍 Running Snowflake queries...")

        totalAssets = run_query("SELECT SUM(asset_value) AS TOTAL_ASSETS FROM portfolios;")[0]
        print("✅ totalAssets done")

        totalClients = run_query("SELECT COUNT(DISTINCT client_id) AS TOTAL_CLIENTS FROM clients;")[0]
        print("✅ totalClients done")

        avgClientAssets = run_query("SELECT AVG(asset_value) AS AVG_CLIENT_ASSETS FROM clients;")[0]
        print("✅ avgClientAssets done")

        # Format all remaining data sets
        rawSector = run_query("SELECT sector AS NAME, value AS VALUE FROM sector_allocations;")
        sectorAllocation = [format_sector(s) for s in rawSector]
        print("✅ sectorAllocation done")

        rawMonthly = run_query("SELECT month AS MONTH, return AS RETURN FROM monthly_performance;")
        monthlyPerformance = [format_monthly(m) for m in rawMonthly]
        print("✅ monthlyPerformance done")

        rawRisk = run_query("""
            SELECT risk_level AS LEVEL, COUNT(*) AS CLIENTS FROM clients GROUP BY risk_level;
        """)
        riskDistribution = [format_risk(r) for r in rawRisk]
        print("✅ riskDistribution done")

        rawCashAlerts = run_query("SELECT * FROM cash_shortfall_alerts;")
        cashAlerts = [format_cash_alert(alert) for alert in rawCashAlerts]
        print("✅ cashAlerts formatted")

        print("🚀 All queries complete. Sending response...")

        return {
            "portfolioData": {
                "totalAssets": totalAssets.get("TOTAL_ASSETS", 0),
                "totalClients": totalClients.get("TOTAL_CLIENTS", 0),
                "avgClientAssets": float(avgClientAssets.get("AVG_CLIENT_ASSETS", 0)),
                "sectorAllocation": sectorAllocation,
                "monthlyPerformance": monthlyPerformance,
                "riskDistribution": riskDistribution
            },
            "cashAlerts": cashAlerts
        }

    except Exception as e:
        print("❌ Error fetching dashboard data:", str(e))
        return {"error": str(e)}