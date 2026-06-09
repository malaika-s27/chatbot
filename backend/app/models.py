from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    session_id: str

class DocumentChunk(BaseModel):
    text: str
    metadata: dict
    embedding: Optional[List[float]] = None

class SearchResult(BaseModel):
    text: str
    score: float
    metadata: dict
