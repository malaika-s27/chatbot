# Pakistan Railway Chatbot Backend

A RAG-based chatbot system for Pakistan Railway using FastAPI, Pinecone, and Groq API.

## Architecture

The system follows a Retrieval-Augmented Generation (RAG) architecture:

1. **User Question** → FastAPI Backend
2. **Convert question to embedding** → Sentence Transformers
3. **Search Pinecone vector database** → Similarity search
4. **Retrieve relevant document chunks** → Context extraction
5. **Send context to Groq LLM** → Response generation
6. **Return response to user** → JSON response

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- `PINECONE_API_KEY`: Get from [Pinecone Console](https://app.pinecone.io/)
- `GROQ_API_KEY`: Get from [Groq Console](https://console.groq.com/)

### 3. Prepare Your Data

Place your Q&A data files in `data/raw/` directory. Supported formats:
- JSON: `[{"question": "...", "answer": "..."}, ...]`
- CSV: Columns named 'question' and 'answer'
- TXT: Plain text files

### 4. Process Data and Create Embeddings

```bash
cd scripts
python process_data.py
```

This will:
- Load your Q&A data
- Split into chunks with overlap
- Generate embeddings using Sentence Transformers
- Save processed chunks to `data/processed/`

### 5. Upload to Pinecone

```bash
cd scripts
python upload_to_pinecone.py
```

This uploads the processed embeddings to your Pinecone index.

### 6. Start the FastAPI Server

```bash
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or run:
```bash
python main.py
```

## API Endpoints

### Chat Endpoint
```
POST /chat/ask
Content-Type: application/json

{
  "question": "What are the ticket prices for Karachi to Lahore?",
  "session_id": "optional-session-id"
}
```

Response:
```json
{
  "answer": "The ticket prices for Karachi to Lahore range from...",
  "sources": ["QA Dataset", "Railway Guide"],
  "session_id": "generated-or-provided-session-id"
}
```

### Health Check
```
GET /chat/health
```

### Index Statistics
```
GET /chat/stats
```

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration settings
│   ├── models.py               # Pydantic models
│   ├── routes/
│   │   └── chat.py            # Chat endpoints
│   └── services/
│       ├── embedding_service.py
│       ├── pinecone_service.py
│       └── groq_service.py
├── scripts/
│   ├── process_data.py         # Data processing script
│   └── upload_to_pinecone.py   # Pinecone upload script
├── data/
│   ├── raw/                    # Your Q&A data files
│   └── processed/              # Processed chunks
├── requirements.txt
├── .env.example
└── README.md
```

## Usage Examples

### Frontend Integration

```javascript
const response = await fetch('http://localhost:8000/chat/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'How do I book a train ticket?'
  })
});

const data = await response.json();
console.log(data.answer);
```

### Python Client

```python
import requests

response = requests.post('http://localhost:8000/chat/ask', json={
    'question': 'What are the train timings from Islamabad to Rawalpindi?'
})

data = response.json()
print(data['answer'])
```

## Configuration Options

Key configuration parameters in `config.py`:
- `CHUNK_SIZE`: Size of text chunks (default: 500)
- `CHUNK_OVERLAP`: Overlap between chunks (default: 50)
- `MAX_RETRIEVED_DOCS`: Number of documents to retrieve (default: 5)
- `EMBEDDING_MODEL`: Sentence transformer model
- `GROQ_MODEL`: Groq LLM model

## Troubleshooting

### Common Issues

1. **Pinecone Connection**: Ensure your API key and environment are correct
2. **Embedding Dimension Mismatch**: Make sure Pinecone index dimension matches your embedding model
3. **Groq API Limits**: Check your Groq API quota and rate limits
4. **CORS Issues**: Configure allowed origins in FastAPI CORS middleware

### Debug Mode

Enable debug logging by setting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Production Deployment

For production deployment:
1. Use environment variables for all configuration
2. Set up proper CORS origins
3. Add authentication/authorization
4. Implement rate limiting
5. Set up monitoring and logging
6. Use HTTPS with SSL certificates

## License

This project is for Pakistan Railway internal use.
