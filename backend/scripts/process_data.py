import json
import pandas as pd
from typing import List, Dict, Any
import os
from pathlib import Path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.config import Config
from app.services.embedding_service import EmbeddingService
from app.models import DocumentChunk

class DataProcessor:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.chunk_size = Config.CHUNK_SIZE
        self.chunk_overlap = Config.CHUNK_OVERLAP
    
    def load_qa_data(self, file_path: str) -> List[Dict[str, Any]]:
        """Load Q&A data from various formats"""
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.json':
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        elif file_ext == '.csv':
            df = pd.read_csv(file_path)
            return df.to_dict('records')
        elif file_ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                # Simple text processing - each line as a separate document
                return [{"text": line.strip(), "source": file_path} for line in lines if line.strip()]
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    def chunk_text(self, text: str, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """Split text into chunks with overlap"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            chunk_text = text[start:end]
            
            # Don't create tiny chunks at the end
            if len(chunk_text) < 50 and chunks:
                break
            
            chunk = DocumentChunk(
                text=chunk_text,
                metadata=metadata.copy()
            )
            chunks.append(chunk)
            
            start = end - self.chunk_overlap
        
        return chunks
    
    def process_qa_pairs(self, qa_data: List[Dict[str, Any]]) -> List[DocumentChunk]:
        """Process Q&A pairs into chunks"""
        chunks = []
        
        for i, item in enumerate(qa_data):
            # Handle different Q&A formats
            if 'question' in item and 'answer' in item:
                # Format: {"question": "...", "answer": "..."}
                qa_text = f"Question: {item['question']}\nAnswer: {item['answer']}"
                metadata = {
                    'source': item.get('source', 'QA Dataset'),
                    'question': item['question'],
                    'answer': item['answer'],
                    'type': 'qa_pair',
                    'index': i
                }
            elif 'text' in item:
                # Format: {"text": "..."}
                qa_text = item['text']
                metadata = {
                    'source': item.get('source', 'Text Dataset'),
                    'type': 'text',
                    'index': i
                }
            else:
                # Generic format - convert entire item to text
                qa_text = str(item)
                metadata = {
                    'source': 'Generic Dataset',
                    'type': 'generic',
                    'index': i
                }
            
            # Create chunks
            text_chunks = self.chunk_text(qa_text, metadata)
            chunks.extend(text_chunks)
        
        return chunks
    
    def add_embeddings(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        """Add embeddings to chunks"""
        texts = [chunk.text for chunk in chunks]
        embeddings = self.embedding_service.get_embeddings(texts)
        
        for chunk, embedding in zip(chunks, embeddings):
            chunk.embedding = embedding
        
        return chunks
    
    def save_processed_chunks(self, chunks: List[DocumentChunk], output_path: str):
        """Save processed chunks to file"""
        chunks_data = []
        for chunk in chunks:
            chunk_dict = {
                'text': chunk.text,
                'metadata': chunk.metadata,
                'embedding': chunk.embedding
            }
            chunks_data.append(chunk_dict)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(chunks_data, f, ensure_ascii=False, indent=2)
    
    def process_file(self, input_path: str, output_path: str):
        """Process a single file"""
        print(f"Processing file: {input_path}")
        
        # Load data
        qa_data = self.load_qa_data(input_path)
        print(f"Loaded {len(qa_data)} items from {input_path}")
        
        # Process into chunks
        chunks = self.process_qa_pairs(qa_data)
        print(f"Created {len(chunks)} chunks")
        
        # Add embeddings
        chunks = self.add_embeddings(chunks)
        print(f"Added embeddings to {len(chunks)} chunks")
        
        # Save processed chunks
        self.save_processed_chunks(chunks, output_path)
        print(f"Saved processed chunks to {output_path}")
        
        return chunks

def main():
    processor = DataProcessor()
    
    # Define input and output directories
    input_dir = Path("../data/raw")
    output_dir = Path("../data/processed")
    output_dir.mkdir(exist_ok=True)
    
    # Process all files in input directory
    for file_path in input_dir.glob("*"):
        if file_path.is_file():
            output_file = output_dir / f"{file_path.stem}_processed.json"
            try:
                processor.process_file(str(file_path), str(output_file))
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    main()
