from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
from ..config import Config

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.dimension = None

    def _load_model(self):
        """Lazy load model only when needed"""
        if self.model is None:
            print("Loading embedding model...")
            self.model = SentenceTransformer(Config.EMBEDDING_MODEL)
            self.dimension = self.model.get_sentence_embedding_dimension()

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts"""
        self._load_model()
        embeddings = self.model.encode(texts, convert_to_tensor=False)
        return embeddings.tolist()

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        self._load_model()
        embedding = self.model.encode(text, convert_to_tensor=False)
        return embedding.tolist()

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Cosine similarity between embeddings"""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))