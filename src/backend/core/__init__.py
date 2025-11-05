"""
Core module for ShaderForge AI backend
Contains compilers, AI engine, and utilities
"""

from .compiler import GLSLCompiler, CompiledShader

# Optional imports for AI features (requires anthropic package)
try:
    from .ai_engine import AIShaderGenerator, GeneratedShader
    __all__ = [
        "GLSLCompiler",
        "CompiledShader",
        "AIShaderGenerator",
        "GeneratedShader"
    ]
except ImportError:
    # AI features not available in production
    __all__ = [
        "GLSLCompiler",
        "CompiledShader"
    ]

