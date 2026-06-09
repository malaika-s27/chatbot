from fastapi import FastAPI
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

app = FastAPI(title="Pakistan Railway Chatbot Test")

@app.get("/")
async def root():
    return {
        "message": "Pakistan Railway Chatbot API Test",
        "status": "working",
        "pinecone_key": "configured" if os.getenv("PINECONE_API_KEY") else "missing",
        "groq_key": "configured" if os.getenv("GROQ_API_KEY") else "missing"
    }

@app.get("/test-env")
async def test_env():
    return {
        "pinecone_api_key": os.getenv("PINECONE_API_KEY", "not set"),
        "groq_api_key": os.getenv("GROQ_API_KEY", "not set"),
        "pinecone_index": os.getenv("PINECONE_INDEX_NAME", "not set"),
        "groq_model": os.getenv("GROQ_MODEL", "not set")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
