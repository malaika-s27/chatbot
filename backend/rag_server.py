import os
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from groq import Groq

# Load environment variables
load_dotenv()


# =========================
# App Initialization
# =========================
app = FastAPI(
    title="Pakistan Railway RAG Chatbot",
    version="1.0.0"
)

# CORS (tighten in production if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Request / Response Models
# =========================
class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    precision_mode: Optional[bool] = False


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    session_id: str
    confidence: float


# =========================
# RAG SERVICE
# =========================
class RAGService:
    def __init__(self):
        # Lazy-loaded embedding model (IMPORTANT)
        self.embedding_model = None

        # Pinecone init
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "railway-chatbot")
        self.index = self.pc.Index(self.index_name)

        # Groq init
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.groq_model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

        print(f"RAG service initialized → index: {self.index_name}")

    # -------------------------
    # Lazy Load Embedding Model
    # -------------------------
    def get_embedding_model(self):
        if self.embedding_model is None:
            print("Loading SentenceTransformer model (first request)...")
            self.embedding_model = SentenceTransformer(
                os.getenv(
                    "EMBEDDING_MODEL",
                    "sentence-transformers/all-MiniLM-L6-v2"
                )
            )
        return self.embedding_model

    # -------------------------
    # Generate Embedding
    # -------------------------
    def generate_embedding(self, text: str) -> List[float]:
        model = self.get_embedding_model()
        embedding = model.encode(text, convert_to_tensor=False)
        return embedding.tolist()

    # -------------------------
    # Pinecone Search
    # -------------------------
    def search_pinecone(self, vector: List[float], top_k: int = 3) -> List[Dict[str, Any]]:
        try:
            response = self.index.query(
                vector=vector,
                top_k=top_k,
                include_metadata=True
            )

            results = []
            for match in response.get("matches", []):
                results.append({
                    "text": match["metadata"].get("text", ""),
                    "score": match["score"],
                    "metadata": match["metadata"]
                })

            return results

        except Exception as e:
            print(f"Pinecone error: {e}")
            return []

    # -------------------------
    # Groq Response Generation
    # -------------------------
    def generate_response(
        self,
        question: str,
        context: List[str],
        precision_mode: bool = False
    ) -> str:

        context_text = "\n\n".join(context)

        if precision_mode:
            system_prompt = (
                "You are a Pakistan Railways assistant.\n"
                "Rules:\n"
                "- Max 2 sentences\n"
                "- Be direct\n"
                "- No extra explanation"
            )
            max_tokens = 120
            temperature = 0.2
        else:
            system_prompt = "You are a helpful Pakistan Railways assistant."
            max_tokens = 300
            temperature = 0.5

        user_prompt = f"""
Context:
{context_text}

Question:
{question}

Answer:
"""

        try:
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"Groq error: {e}")
            return "Unable to generate response. Please contact support."

    # -------------------------
    # Full RAG Pipeline
    # -------------------------
    def answer(self, question: str, precision_mode: bool = False) -> Dict[str, Any]:

        # 1. Embed query
        query_vector = self.generate_embedding(question)

        # 2. Retrieve from Pinecone
        matches = self.search_pinecone(query_vector, top_k=3)

        if not matches:
            return {
                "answer": (
                    f"I couldn't find information for '{question}'. "
                    "Please contact Pakistan Railways helpline 117."
                ),
                "sources": [],
                "confidence": 0.0
            }

        # 3. Build context
        context = [m["text"] for m in matches]
        sources = list(set(
            m["metadata"].get("source", "Pakistan Railway FAQ")
            for m in matches
        ))

        confidence = max(m["score"] for m in matches)

        # 4. Generate answer
        answer = self.generate_response(question, context, precision_mode)

        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence
        }


# =========================
# Singleton Service
# =========================
rag_service = RAGService()


# =========================
# Routes
# =========================
@app.get("/")
async def root():
    return {
        "message": "Pakistan Railway RAG Chatbot API",
        "status": "active"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/warmup")
async def warmup():
    """
    OPTIONAL:
    Call this after deployment to preload model safely.
    """
    rag_service.get_embedding_model().encode("warmup test")
    return {"status": "model loaded"}


@app.post("/chat/ask", response_model=ChatResponse)
async def ask(request: ChatRequest):

    try:
        result = rag_service.answer(
            request.question,
            request.precision_mode
        )

        session_id = request.session_id or f"session_{hash(request.question) % 1000000}"

        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            session_id=session_id,
            confidence=result["confidence"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))