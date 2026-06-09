import json
import os
import uuid
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PineconeUploader:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "railway-chatbot")
        self.dimension = int(os.getenv("PINECONE_DIMENSION", "384"))
        self._ensure_index_exists()
    
    def _ensure_index_exists(self):
        """Create index if it doesn't exist"""
        if self.index_name not in [index.name for index in self.pc.list_indexes()]:
            print(f"Creating new index: {self.index_name}")
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
        self.index = self.pc.Index(self.index_name)
        print(f"Connected to index: {self.index_name}")
    
    def load_processed_chunks(self, file_path):
        """Load processed chunks from file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def prepare_vectors(self, chunks, batch_size=100):
        """Prepare chunks for Pinecone upload in batches"""
        batches = []
        current_batch = []
        
        for i, chunk in enumerate(chunks):
            vector = {
                'id': str(uuid.uuid4()),
                'values': chunk['embedding'],
                'metadata': {
                    'text': chunk['text'],
                    **chunk['metadata']
                }
            }
            current_batch.append(vector)
            
            # Create batch when reaching batch_size
            if len(current_batch) >= batch_size:
                batches.append(current_batch)
                current_batch = []
        
        # Add remaining chunks
        if current_batch:
            batches.append(current_batch)
        
        return batches
    
    def upload_file(self, file_path, batch_size=100):
        """Upload processed chunks to Pinecone"""
        print(f"Loading chunks from {file_path}")
        chunks = self.load_processed_chunks(file_path)
        print(f"Loaded {len(chunks)} chunks")
        
        # Prepare vectors in batches
        batches = self.prepare_vectors(chunks, batch_size)
        print(f"Prepared {len(batches)} batches for upload")
        
        # Upload batches
        total_uploaded = 0
        for i, batch in enumerate(batches):
            try:
                result = self.index.upsert(vectors=batch)
                total_uploaded += len(batch)
                print(f"Batch {i+1}/{len(batches)}: Uploaded {len(batch)} vectors")
                print(f"Upsert result: {result}")
            except Exception as e:
                print(f"Error uploading batch {i+1}: {e}")
        
        print(f"Total uploaded: {total_uploaded} vectors")
        
        # Get index stats
        stats = self.index.describe_index_stats()
        print(f"Index stats: {stats}")
        
        return total_uploaded

def main():
    uploader = PineconeUploader()
    
    # Upload processed data
    processed_file = "data/processed/processed_data.json"
    
    if os.path.exists(processed_file):
        uploader.upload_file(processed_file)
    else:
        print(f"Processed data file not found: {processed_file}")
        print("Please run process_data_simple.py first to create processed chunks")

if __name__ == "__main__":
    main()
