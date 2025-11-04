"""
API module for ShaderForge AI
Contains route handlers for all endpoints
"""

from .search import router as search_router
from .nodes import router as nodes_router
from .ai import router as ai_router

__all__ = [
    "search_router",
    "nodes_router",
    "ai_router"
]
