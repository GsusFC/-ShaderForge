"""
Database models for ShaderForge AI
"""

from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean, JSON, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

# Association table for favorites
shader_favorites = Table(
    'shader_favorites',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id')),
    Column('shader_id', String(36), ForeignKey('shaders.id'))
)

class User(Base):
    """Usuario del sistema"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    shaders = relationship("Shader", back_populates="author", foreign_keys="Shader.author_id")
    favorites = relationship(
        "Shader",
        secondary=shader_favorites,
        backref="favorited_by"
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Shader(Base):
    """Shader en la plataforma"""
    __tablename__ = "shaders"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    code = Column(Text, nullable=False)
    language = Column(String(20), default="glsl")  # glsl, hlsl, metal, wgsl
    category = Column(String(50), index=True)
    
    # Metadata
    tags = relationship("ShaderTag", back_populates="shader", cascade="all, delete-orphan")
    techniques = Column(JSON, default=list)  # ["raymarching", "sdf", ...]
    uniforms = Column(JSON, default=list)  # [{"name": "iTime", "type": "float"}, ...]
    complexity_score = Column(Integer, default=0)  # 0-100
    
    # Stats
    views = Column(Integer, default=0, index=True)
    likes = Column(Integer, default=0, index=True)
    forks = Column(Integer, default=0)
    
    # Ownership
    author_id = Column(String(36), ForeignKey('users.id'), index=True)
    author = relationship("User", back_populates="shaders", foreign_keys=[author_id])
    
    # Source
    source = Column(String(100))  # shadertoy, github, user
    source_url = Column(String(500))
    source_id = Column(String(100))  # ID externo si aplica
    
    # Visibility
    visibility = Column(String(20), default="public")  # public, private, unlisted
    forked_from = Column(String(36), ForeignKey('shaders.id'), nullable=True)
    
    # Metadata JSON (renamed to avoid SQLAlchemy reserved word)
    shader_metadata = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    node_graph = relationship("NodeGraph", back_populates="shader", uselist=False, cascade="all, delete-orphan")
    embedding = relationship("ShaderEmbedding", back_populates="shader", uselist=False, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "code": self.code[:500] if self.code else "",  # Truncate for API
            "language": self.language,
            "category": self.category,
            "tags": [tag.name for tag in self.tags] if self.tags else [],
            "techniques": self.techniques,
            "complexity_score": self.complexity_score,
            "views": self.views,
            "likes": self.likes,
            "forks": self.forks,
            "author": self.author.to_dict() if self.author else None,
            "source": self.source,
            "source_url": self.source_url,
            "visibility": self.visibility,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class ShaderTag(Base):
    """Tags para shaders"""
    __tablename__ = "shader_tags"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shader_id = Column(String(36), ForeignKey('shaders.id'), nullable=False, index=True)
    name = Column(String(50), nullable=False, index=True)
    
    shader = relationship("Shader", back_populates="tags")

class NodeGraph(Base):
    """Node graph para un shader"""
    __tablename__ = "node_graphs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shader_id = Column(String(36), ForeignKey('shaders.id'), nullable=False, unique=True)
    
    # Data
    graph_data = Column(JSON, nullable=False)  # {nodes: [...], edges: [...]}
    thumbnail_url = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    shader = relationship("Shader", back_populates="node_graph")

class ShaderEmbedding(Base):
    """Embeddings vectoriales para búsqueda semántica"""
    __tablename__ = "shader_embeddings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shader_id = Column(String(36), ForeignKey('shaders.id'), nullable=False, unique=True)
    
    # Embeddings (stored as JSON strings for now, ideally pgvector)
    text_embedding = Column(JSON)  # List[float]
    code_embedding = Column(JSON)  # List[float]
    
    model = Column(String(100), default="text-embedding-3-small")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    shader = relationship("Shader", back_populates="embedding")

class ShaderComment(Base):
    """Comentarios en shaders"""
    __tablename__ = "shader_comments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shader_id = Column(String(36), ForeignKey('shaders.id'), nullable=False, index=True)
    author_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    text = Column(Text, nullable=False)
    reply_to = Column(String(36), ForeignKey('shader_comments.id'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    author = relationship("User")
    shader = relationship("Shader")
