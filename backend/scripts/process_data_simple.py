import json
import os
from pathlib import Path
from sentence_transformers import SentenceTransformer
import numpy as np

# Configuration
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

class SimpleDataProcessor:
    def __init__(self):
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        self.chunk_size = CHUNK_SIZE
        self.chunk_overlap = CHUNK_OVERLAP
    
    def load_qa_data(self, file_path: str):
        """Load Q&A data from JSON file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def chunk_text(self, text: str, metadata: dict):
        """Split text into chunks with overlap"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            chunk_text = text[start:end]
            
            if len(chunk_text) < 50 and chunks:
                break
            
            chunk = {
                'text': chunk_text,
                'metadata': metadata.copy()
            }
            chunks.append(chunk)
            
            start = end - self.chunk_overlap
        
        return chunks
    
    def process_qa_pairs(self, qa_data):
        """Process Q&A pairs into chunks"""
        chunks = []
        
        for i, item in enumerate(qa_data):
            # Create combined Q&A text
            qa_text = f"Question: {item['question']}\nAnswer: {item['answer']}"
            metadata = {
                'source': item.get('source', 'Pakistan Railway FAQ'),
                'question': item['question'],
                'answer': item['answer'],
                'category': item.get('category', 'General'),
                'type': 'qa_pair',
                'index': i
            }
            
            # Create chunks
            text_chunks = self.chunk_text(qa_text, metadata)
            chunks.extend(text_chunks)
        
        return chunks
    
    def add_embeddings(self, chunks):
        """Add embeddings to chunks"""
        texts = [chunk['text'] for chunk in chunks]
        print(f"Generating embeddings for {len(texts)} chunks...")
        
        embeddings = self.model.encode(texts, convert_to_tensor=False)
        
        for chunk, embedding in zip(chunks, embeddings):
            chunk['embedding'] = embedding.tolist()
        
        print(f"Embeddings generated successfully!")
        return chunks
    
    def save_processed_chunks(self, chunks, output_path):
        """Save processed chunks to file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(chunks)} chunks to {output_path}")
    
    def process_file(self, input_path, output_path):
        """Process a single file"""
        print(f"Processing file: {input_path}")
        
        # Load data
        qa_data = self.load_qa_data(input_path)
        print(f"Loaded {len(qa_data)} Q&A pairs")
        
        # Process into chunks
        chunks = self.process_qa_pairs(qa_data)
        print(f"Created {len(chunks)} chunks")
        
        # Add embeddings
        chunks = self.add_embeddings(chunks)
        
        # Save processed chunks
        self.save_processed_chunks(chunks, output_path)
        
        return chunks

def main():
    processor = SimpleDataProcessor()
    
    # Process structured data
    input_file = "data/raw/structured_data.json"
    output_file = "data/processed/processed_data.json"
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Process the file
    processor.process_file(input_file, output_file)

if __name__ == "__main__":
    main()
