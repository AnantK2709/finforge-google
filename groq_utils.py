import requests
import json

GROQ_API_KEY = "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"

def call_groq_behavior_insight(user_data: list) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }

    system_message = {
        "role": "system",
        "content": (
            "You are a behavioral finance coach. Based on the user's past moods, actions, "
            "and portfolio performance, generate personalized insights. "
            "Look for patterns such as emotional triggers, overreactions, and behavioral biases. "
            "Offer advice for better financial decision-making."
        )
    }

    user_message = {
        "role": "user",
        "content": f"Here is the user's mood and behavior log:\n\n{json.dumps(user_data, indent=2)}"
    }

    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [system_message, user_message],
        "temperature": 0.7,
        "max_tokens": 300
    }

    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Groq API error: {response.text}")

    result = response.json()
    return result["choices"][0]["message"]["content"]
