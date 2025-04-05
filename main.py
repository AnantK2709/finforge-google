# 📁 FILE: main.py (FastAPI app)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from mood_utils import classify_mood
from portfolio_utils import get_portfolio_context
from snowflake_utils import insert_mood_log_snowflake

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

from groq_utils import call_groq_behavior_insight
import snowflake.connector

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


# ✅ Run this using: uvicorn main:app
