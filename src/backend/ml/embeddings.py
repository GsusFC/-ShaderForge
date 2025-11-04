"""
Embeddings generation for ShaderForge AI
Uses OpenAI API to generate text and code embeddings
"""

import os
from typing import List, Optional
import numpy as np
from openai import OpenAI

class EmbeddingGenerator:
    """Genera embeddings usando OpenAI"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = "text-embedding-3-small"
        self.dimension = 1536
    
    def embed_text(self, text: str) -> List[float]:
        """
        Genera embedding de texto
        
        Args:
            text: Texto a embedear
            
        Returns:
            Lista de floats representando el embedding
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error embedding text: {e}")
            return [0.0] * self.dimension
    
    def embed_shader(
        self, 
        description: str, 
        code: str, 
        weight_text: float = 0.6,
        weight_code: float = 0.4
    ) -> dict:
        """
        Genera embeddings para un shader
        
        Combina:
        - Embedding de descripción (más peso en búsqueda)
        - Embedding de código (para similitud técnica)
        
        Args:
            description: Descripción del shader
            code: Código del shader
            weight_text: Peso para embedding de texto
            weight_code: Peso para embedding de código
            
        Returns:
            {
                "text_embedding": [...],
                "code_embedding": [...],
                "combined_embedding": [...]
            }
        """
        # Limitar código a 8000 chars (límite de tokens)
        code_truncated = code[:8000] if code else ""
        
        # Generar embeddings
        text_emb = self.embed_text(description)
        code_emb = self.embed_text(code_truncated)
        
        # Combinar embeddings (promedio ponderado)
        text_array = np.array(text_emb)
        code_array = np.array(code_emb)
        combined = (text_array * weight_text + code_array * weight_code) / (weight_text + weight_code)
        combined = combined.tolist()
        
        return {
            "text_embedding": text_emb,
            "code_embedding": code_emb,
            "combined_embedding": combined
        }
    
    def embed_batch(
        self, 
        texts: List[str], 
        batch_size: int = 100
    ) -> List[List[float]]:
        """
        Genera embeddings para lote de textos
        
        Args:
            texts: Lista de textos
            batch_size: Tamaño de batch (para no exceder límites API)
            
        Returns:
            Lista de embeddings
        """
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            try:
                response = self.client.embeddings.create(
                    model=self.model,
                    input=batch
                )
                
                # Ordenar por índice (API puede reordenar)
                batch_embeddings = [None] * len(batch)
                for item in response.data:
                    batch_embeddings[item.index] = item.embedding
                
                embeddings.extend(batch_embeddings)
                print(f"✓ Embedded {i + len(batch)}/{len(texts)}")
                
            except Exception as e:
                print(f"Error in batch {i}-{i+batch_size}: {e}")
                embeddings.extend([[0.0] * self.dimension] * len(batch))
        
        return embeddings

def generate_embeddings(
    description: str,
    code: str,
    api_key: Optional[str] = None
) -> dict:
    """
    Función helper para generar embeddings
    
    Args:
        description: Descripción del shader
        code: Código del shader
        api_key: API key de OpenAI (opcional)
        
    Returns:
        Embeddings dictionary
    """
    generator = EmbeddingGenerator(api_key=api_key)
    return generator.embed_shader(description, code)
