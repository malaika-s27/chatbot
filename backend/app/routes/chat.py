from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from ..models import ChatRequest, ChatResponse
# from ..services.embedding_service import EmbeddingService
from ..services.pinecone_service import PineconeService
from ..services.groq_service import GroqService
from ..services.shared import embedding_service

router = APIRouter(prefix="/chat", tags=["chat"])

# Initialize services
# embedding_service = EmbeddingService()
pinecone_service = PineconeService()
groq_service = GroqService()

@router.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    """Main chat endpoint to answer user questions"""
    try:
        # Generate embedding for the question
        question_embedding = embedding_service.get_embedding(request.question)
        
        # Search for relevant documents in Pinecone
        search_results = pinecone_service.search(
            query_embedding=question_embedding,
            top_k=5
        )
        
        # Extract context from search results
        context_texts = [result.text for result in search_results if result.score > 0.3]
        
        # Generate response using Groq
        if context_texts:
            answer = groq_service.generate_response(request.question, context_texts)
            sources = list(set(
            result.metadata.get('source', 'Unknown')
            for result in search_results
            ))
        else:
            # Fallback to general response if no relevant context found
            answer = groq_service.generate_simple_response(request.question)
            sources = []
        
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        return ChatResponse(
            answer=answer,
            sources=sources,
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Pakistan Railway Chatbot"}

@router.get("/stats")
async def get_stats():
    """Get Pinecone index statistics"""
    try:
        stats = pinecone_service.get_index_stats()
        return {"status": "success", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")
