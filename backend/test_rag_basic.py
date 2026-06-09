import json
import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from dotenv import load_dotenv

# Load environment
load_dotenv()

app = FastAPI(title="Pakistan Railway Chatbot - Basic Test")

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    session_id: str

# Load sample data for testing
def load_sample_data():
    with open("data/raw/structured_data.json", "r", encoding="utf-8") as f:
        return json.load(f)

sample_data = load_sample_data()

def find_answer(question: str) -> dict:
    """Simple keyword-based answer finding for testing"""
    question_lower = question.lower()
    
    for item in sample_data:
        # Simple keyword matching
        if any(word in question_lower for word in item["question"].lower().split()):
            return item
    
    return None

@app.post("/chat/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    """Basic chat endpoint without embeddings for testing"""
    
    # Try to find answer in sample data
    result = find_answer(request.question)
    
    if result:
        answer = result["answer"]
        sources = [result.get("source", "Pakistan Railway FAQ")]
    else:
        answer = f"I'm sorry, I don't have information about '{request.question}'. Please try rephrasing your question or contact Pakistan Railway helpline at 117."
        sources = []
    
    session_id = request.session_id or "test-session"
    
    return ChatResponse(
        answer=answer,
        sources=sources,
        session_id=session_id
    )

@app.get("/")
async def root():
    return {
        "message": "Pakistan Railway Chatbot API - Basic Test",
        "status": "working",
        "endpoints": {
            "chat": "/chat/ask",
            "health": "/chat/health"
        }
    }

@app.get("/chat/health")
async def health_check():
    return {"status": "healthy", "service": "Pakistan Railway Chatbot"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
