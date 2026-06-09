from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any
from ..config import Config
from ..models import SearchResult

class PineconeService:
    def __init__(self):
        self.pc = Pinecone(api_key=Config.PINECONE_API_KEY)
        self.index_name = Config.PINECONE_INDEX_NAME
        self.dimension = Config.PINECONE_DIMENSION
        self._ensure_index_exists()
    
    def _ensure_index_exists(self):
        """Create index if it doesn't exist"""
        if self.index_name not in [index.name for index in self.pc.list_indexes()]:
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region=Config.PINECONE_ENVIRONMENT
                )
            )
        self.index = self.pc.Index(self.index_name)
    
    def upsert_vectors(self, vectors: List[Dict[str, Any]]):
        """Upsert vectors to Pinecone index"""
        return self.index.upsert(vectors=vectors)
    
    def search(self, query_embedding: List[float], top_k: int = 5) -> List[SearchResult]:
        """Search for similar vectors"""
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        search_results = []
        for match in results['matches']:
            search_results.append(SearchResult(
                text=match['metadata'].get('text', ''),
                score=match['score'],
                metadata=match['metadata']
            ))
        
        return search_results
    
    def delete_index(self):
        """Delete the entire index"""
        self.pc.delete_index(self.index_name)
    
    def get_index_stats(self):
        """Get index statistics"""
        return self.index.describe_index_stats()
