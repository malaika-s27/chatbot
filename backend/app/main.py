from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from contextlib import asynccontextmanager

from .routes import chat
# from .services.embedding_service import EmbeddingService
from .services.shared import embedding_service


# ----------------------------
# GLOBAL EMBEDDING SERVICE
# ----------------------------
# embedding_service = EmbeddingService()


# ----------------------------
# FASTAPI LIFESPAN
# ----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):

    # STARTUP
    print("Preloading embedding model...")

    try:
        embedding_service.get_embedding("startup warmup")
        print("Model loaded successfully")
    except Exception as e:
        print(f"Startup warmup failed: {e}")

    yield

    # SHUTDOWN
    print("Application shutting down...")


# ----------------------------
# APP INIT
# ----------------------------
app = FastAPI(
    title="Pakistan Railway Chatbot API",
    version="1.0.0",
    lifespan=lifespan
)


# ----------------------------
# CORS CONFIG
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://chatbot-railway-117.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# ROUTERS
# ----------------------------
app.include_router(chat.router)


# ----------------------------
# ROOT ENDPOINT
# ----------------------------
@app.get("/")
async def root():
    return {
        "message": "Pakistan Railway Chatbot API",
        "version": "1.0.0"
    }


# ----------------------------
# WARMUP ENDPOINT
# ----------------------------
@app.get("/warmup")
async def warmup():

    embedding_service.get_embedding("warmup test")

    return {
        "status": "model loaded successfully"
    }


# ----------------------------
# GLOBAL ERROR HANDLER
# ----------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )