import snowflake.connector

def insert_mood_log_snowflake(log_entry):
    ctx = snowflake.connector.connect(
        user='KEVENDRON',
        password='K4NRBPtrN4EYh8V',
        account='QGMLZIH-TG75052',
        warehouse='COMPUTE_WH',
        database='MOOD_TRACKER_DB',
        schema='PUBLIC'
    )
    cs = ctx.cursor()
    try:
        cs.execute("""
            INSERT INTO mood_logs (
                user_id, timestamp, journal_entry, mood_rating, mood, 
                portfolio_change_pct, action_taken
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            log_entry['user_id'],
            log_entry['timestamp'],
            log_entry['journal_entry'],
            log_entry['mood_rating'],
            log_entry['mood'],
            log_entry['portfolio_change_pct'],
            log_entry['action_taken']
        ))
    finally:
        cs.close()
        ctx.close()