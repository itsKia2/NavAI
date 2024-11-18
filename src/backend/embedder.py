import openai
import os

# Set OpenAI API key from .env
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_embedding(text):
    response = openai.Embedding.create(input=text, model="text-embedding-ada-002")
    return response['data'][0]['embedding']
