import os
from dotenv import load_dotenv
from groq import Groq

# Load environment
load_dotenv()

# Test Groq API
try:
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    groq_model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")
    
    print(f"Testing Groq API with model: {groq_model}")
    
    response = groq_client.chat.completions.create(
        model=groq_model,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, can you help me with Pakistan Railways?"}
        ],
        max_tokens=100,
        temperature=0.7
    )
    
    print("Groq API Test - SUCCESS!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"Groq API Test - ERROR: {e}")
    print(f"Error type: {type(e).__name__}")
