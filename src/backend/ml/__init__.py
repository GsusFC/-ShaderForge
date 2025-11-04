"""
ML module for ShaderForge AI
Contains embeddings, vector search, and ML utilities
"""

from .embeddings import EmbeddingGenerator, generate_embeddings
from .vector_search import VectorSearch

__all__ = [
    "EmbeddingGenerator",
    "generate_embeddings",
    "VectorSearch"
]
