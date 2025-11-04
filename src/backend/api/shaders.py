"""
API endpoints para gestión de shaders
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from db.database import get_db
from db.models import Shader, User, ShaderTag, NodeGraph, ShaderEmbedding

router = APIRouter(prefix="/api/v1/shaders", tags=["shaders"])

# Modelos Pydantic
from pydantic import BaseModel

class ShaderCreate(BaseModel):
    name: str
    description: Optional[str] = None
    code: str
    language: str = "glsl"
    category: Optional[str] = None
    tags: List[str] = []
    techniques: List[str] = []
    visibility: str = "public"

class ShaderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    visibility: Optional[str] = None

class ShaderResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    language: str
    category: Optional[str]
    tags: List[str]
    techniques: List[str]
    views: int
    likes: int
    visibility: str
    created_at: Optional[str]
    updated_at: Optional[str]
    
    class Config:
        from_attributes = True

# Endpoints
@router.post("", response_model=ShaderResponse)
def create_shader(
    shader_data: ShaderCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuevo shader"""
    try:
        # Crear shader
        new_shader = Shader(
            name=shader_data.name,
            description=shader_data.description,
            code=shader_data.code,
            language=shader_data.language,
            category=shader_data.category,
            techniques=shader_data.techniques,
            visibility=shader_data.visibility,
            source="user"
        )
        
        # Agregar tags
        for tag_name in shader_data.tags:
            tag = ShaderTag(name=tag_name)
            new_shader.tags.append(tag)
        
        # Guardar en BD
        db.add(new_shader)
        db.commit()
        db.refresh(new_shader)
        
        return new_shader
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating shader: {str(e)}")

@router.get("/{shader_id}", response_model=ShaderResponse)
def get_shader(
    shader_id: str,
    db: Session = Depends(get_db)
):
    """Obtiene un shader específico"""
    shader = db.query(Shader).filter(Shader.id == shader_id).first()
    
    if not shader:
        raise HTTPException(status_code=404, detail="Shader not found")
    
    # Incrementar vistas
    shader.views += 1
    db.commit()
    
    return shader

@router.get("")
def list_shaders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    visibility: str = "public",
    db: Session = Depends(get_db)
):
    """Lista shaders con paginación"""
    query = db.query(Shader).filter(Shader.visibility == visibility)
    
    if category:
        query = query.filter(Shader.category == category)
    
    # Ordenar por views descendente
    query = query.order_by(Shader.views.desc())
    
    total = query.count()
    shaders = query.offset(skip).limit(limit).all()
    
    return {
        "success": True,
        "results": shaders,
        "pagination": {
            "total": total,
            "skip": skip,
            "limit": limit,
            "hasMore": (skip + limit) < total
        }
    }

@router.put("/{shader_id}", response_model=ShaderResponse)
def update_shader(
    shader_id: str,
    shader_data: ShaderUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza un shader"""
    shader = db.query(Shader).filter(Shader.id == shader_id).first()
    
    if not shader:
        raise HTTPException(status_code=404, detail="Shader not found")
    
    try:
        # Actualizar campos
        if shader_data.name is not None:
            shader.name = shader_data.name
        if shader_data.description is not None:
            shader.description = shader_data.description
        if shader_data.code is not None:
            shader.code = shader_data.code
        if shader_data.category is not None:
            shader.category = shader_data.category
        if shader_data.visibility is not None:
            shader.visibility = shader_data.visibility
        
        # Actualizar tags
        if shader_data.tags is not None:
            # Eliminar tags anteriores
            for tag in shader.tags:
                db.delete(tag)
            
            # Agregar nuevos tags
            for tag_name in shader_data.tags:
                tag = ShaderTag(name=tag_name)
                shader.tags.append(tag)
        
        shader.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(shader)
        
        return shader
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating shader: {str(e)}")

@router.delete("/{shader_id}")
def delete_shader(
    shader_id: str,
    db: Session = Depends(get_db)
):
    """Elimina un shader"""
    shader = db.query(Shader).filter(Shader.id == shader_id).first()
    
    if not shader:
        raise HTTPException(status_code=404, detail="Shader not found")
    
    try:
        db.delete(shader)
        db.commit()
        
        return {
            "success": True,
            "message": f"Shader {shader_id} deleted"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting shader: {str(e)}")

@router.post("/{shader_id}/like")
def like_shader(
    shader_id: str,
    db: Session = Depends(get_db)
):
    """Agrega un like a un shader"""
    shader = db.query(Shader).filter(Shader.id == shader_id).first()
    
    if not shader:
        raise HTTPException(status_code=404, detail="Shader not found")
    
    try:
        shader.likes += 1
        db.commit()
        
        return {
            "success": True,
            "likes": shader.likes
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error liking shader: {str(e)}")

@router.get("/search/by-category/{category}")
def search_by_category(
    category: str,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Busca shaders por categoría"""
    shaders = db.query(Shader).filter(
        Shader.category == category,
        Shader.visibility == "public"
    ).order_by(Shader.views.desc()).limit(limit).all()
    
    return {
        "success": True,
        "category": category,
        "results": shaders,
        "count": len(shaders)
    }

@router.get("/trending/top")
def get_trending_shaders(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Obtiene shaders trending (populares)"""
    shaders = db.query(Shader).filter(
        Shader.visibility == "public"
    ).order_by(
        (Shader.views + Shader.likes * 10).desc()
    ).limit(limit).all()
    
    return {
        "success": True,
        "results": shaders,
        "count": len(shaders)
    }

@router.post("/{shader_id}/save-node-graph")
def save_node_graph(
    shader_id: str,
    graph_data: dict,
    db: Session = Depends(get_db)
):
    """Guarda el node graph de un shader"""
    shader = db.query(Shader).filter(Shader.id == shader_id).first()
    
    if not shader:
        raise HTTPException(status_code=404, detail="Shader not found")
    
    try:
        # Buscar o crear node graph
        node_graph = db.query(NodeGraph).filter(NodeGraph.shader_id == shader_id).first()
        
        if not node_graph:
            node_graph = NodeGraph(shader_id=shader_id, graph_data=graph_data)
            db.add(node_graph)
        else:
            node_graph.graph_data = graph_data
            node_graph.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Node graph saved"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving node graph: {str(e)}")

@router.get("/{shader_id}/node-graph")
def get_node_graph(
    shader_id: str,
    db: Session = Depends(get_db)
):
    """Obtiene el node graph de un shader"""
    node_graph = db.query(NodeGraph).filter(NodeGraph.shader_id == shader_id).first()
    
    if not node_graph:
        raise HTTPException(status_code=404, detail="Node graph not found")
    
    return {
        "success": True,
        "graph": node_graph.graph_data
    }
