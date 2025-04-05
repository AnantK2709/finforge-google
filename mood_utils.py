# 📁 FILE: mood_utils.py
from textblob import TextBlob

def classify_mood(text):
    """Analyze the user's journal text and return a mood label."""
    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.3:
        return "confident"
    elif polarity < -0.3:
        return "anxious"
    else:
        return "neutral"