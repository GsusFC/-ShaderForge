"""
Vector search using Pinecone for semantic shader search
"""

import os
from typing import List, Optional, Dict, Any
from pinecone import Pinecone

class VectorSearch:
    """Búsqueda semántica usando Pinecone"""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        environment: Optional[str] = None,
        index_name: str = "shaderforge-embeddings"
    ):
        self.api_key = api_key or os.getenv("PINECONE_API_KEY")
        self.environment = environment or os.getenv("PINECONE_ENVIRONMENT", "us-west1-gcp")
        self.index_name = index_name
        
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY not set")
        
        # Inicializar cliente Pinecone
        self.pc = Pinecone(api_key=self.api_key)
        
        try:
            self.index = self.pc.Index(index_name)
            print(f"✓ Connected to Pinecone index: {index_name}")
        except Exception as e:
            print(f"⚠️ Error connecting to Pinecone index: {e}")
            self.index = None
    
    def upsert_embedding(
        self,
        shader_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> bool:
        """
        Sube o actualiza un embedding en Pinecone
        
        Args:
            shader_id: ID único del shader
            embedding: Vector de embedding (1536 dimensiones)
            metadata: Metadata del shader (name, category, tags, etc.)
            
        Returns:
            True si fue exitoso, False si falló
        """
        if not self.index:
            print("Pinecone index not available")
            return False
        
        try:
            self.index.upsert(
                vectors=[
                    {
                        "id": shader_id,
                        "values": embedding,
                        "metadata": {
                            "name": metadata.get("name", ""),
                            "description": metadata.get("description", "")[:512],  # Limitar
                            "category": metadata.get("category", ""),
                            "tags": metadata.get("tags", [])[:10],  # Máximo 10 tags
                            "techniques": metadata.get("techniques", [])[:5],
                            "source": metadata.get("source", ""),
                            "complexity": metadata.get("complexity_score", 0),
                            "timestamp": metadata.get("created_at", "")
                        }
                    }
                ]
            )
            return True
        except Exception as e:
            print(f"Error upserting to Pinecone: {e}")
            return False
    
    def search(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Busca shaders similares en Pinecone
        
        Args:
            query_embedding: Vector de embedding de la query
            top_k: Número de resultados
            filters: Filtros metadata (category, tags, etc.)
            
        Returns:
            Lista de resultados ordenados por similitud
        """
        if not self.index:
            print("Pinecone index not available")
            return []
        
        try:
            # Construir filtro si existe
            filter_dict = None
            if filters:
                filter_dict = {}
                if "category" in filters:
                    filter_dict["category"] = {"$eq": filters["category"]}
                if "min_complexity" in filters:
                    filter_dict["complexity"] = {"$gte": filters["min_complexity"]}
                if "max_complexity" in filters:
                    filter_dict["complexity"] = {"$lte": filters["max_complexity"]}
            
            # Realizar búsqueda
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            # Formatear resultados
            formatted_results = []
            for match in results.get("matches", []):
                formatted_results.append({
                    "shader_id": match["id"],
                    "score": match.get("score", 0),
                    "metadata": match.get("metadata", {})
                })
            
            return formatted_results
        except Exception as e:
            print(f"Error searching Pinecone: {e}")
            return []
    
    def delete_embedding(self, shader_id: str) -> bool:
        """Elimina un embedding de Pinecone"""
        if not self.index:
            return False
        
        try:
            self.index.delete(ids=[shader_id])
            return True
        except Exception as e:
            print(f"Error deleting from Pinecone: {e}")
            return False
    
    def delete_by_ids(self, shader_ids: List[str]) -> bool:
        """Elimina múltiples embeddings"""
        if not self.index:
            return False
        
        try:
            self.index.delete(ids=shader_ids)
            return True
        except Exception as e:
            print(f"Error deleting multiple embeddings: {e}")
            return False
    
    def stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del índice"""
        if not self.index:
            return {}
        
        try:
            return self.index.describe_index_stats()
        except Exception as e:
            print(f"Error getting stats: {e}")
            return {}
    
    @staticmethod
    def create_index(
        api_key: str,
        index_name: str = "shaderforge-embeddings",
        dimension: int = 1536,
        metric: str = "cosine"
    ) -> bool:
        """
        Crea un nuevo índice en Pinecone
        
        Args:
            api_key: API key de Pinecone
            index_name: Nombre del índice
            dimension: Dimensión de los embeddings
            metric: Métrica de similitud (cosine, euclidean, dotproduct)
            
        Returns:
            True si fue exitoso
        """
        try:
            pc = Pinecone(api_key=api_key)
            
            # Crear índice
            pc.create_index(
                name=index_name,
                dimension=dimension,
                metric=metric,
                spec={
                    "serverless": {
                        "cloud": "aws",
                        "region": "us-west-1"
                    }
                }
            )
            print(f"✓ Created Pinecone index: {index_name}")
            return True
        except Exception as e:
            print(f"Error creating index: {e}")
            return False
