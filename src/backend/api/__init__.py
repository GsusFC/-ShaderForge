"""
API module for ShaderForge AI
Contains route handlers for all endpoints
"""

from .nodes import router as nodes_router

# Optional imports (may require additional dependencies)
__all__ = ["nodes_router"]

try:
    from .search import router as search_router
    __all__.append("search_router")
except ImportError:
    pass

try:
    from .ai import router as ai_router
    __all__.append("ai_router")
except ImportError:
    pass
