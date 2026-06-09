from groq import Groq
from typing import List
from ..config import Config

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=Config.GROQ_API_KEY)
        self.model = Config.GROQ_MODEL
    
    def generate_response(self, question: str, context: List[str]) -> str:
        """Generate response using Groq API with RAG context"""
        
        context_text = "\n\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(context)])
        
        system_prompt = """
        You are a Pakistan Railways assistant. 
        Rules: 
        - Max 2 sentences
        - Be direct
        - No extra explanation
        """

        user_prompt = f"""Context:
{context_text}

Question: {question}

Please provide a comprehensive answer based on the context above."""

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=120
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def generate_simple_response(self, question: str) -> str:
        """Generate response without context for general queries"""
        
        system_prompt = """
        You are a Pakistan Railways assistant. 
        Rules: 
        - Max 2 sentences
        - Be direct
        - No extra explanation
        """

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.2,
                max_tokens=120
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            return f"Error generating response: {str(e)}"
