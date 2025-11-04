from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import time
from core.ai_engine import AIShaderGenerator

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

# Modelos Pydantic
class GenerateRequest(BaseModel):
    prompt: str
    style: str = "realistic"
    complexity: str = "medium"
    performance: str = "high"

class GenerateResponse(BaseModel):
    success: bool
    code: str
    explanation: str
    uniforms: List[str]
    techniques: List[str]
    error: Optional[str] = None
    generationTime: float

class RefineRequest(BaseModel):
    feedback: str
    previousCode: str

class ExplainRequest(BaseModel):
    code: str

class OptimizeRequest(BaseModel):
    code: str

# Instancia global (reutilizar para conversación)
_ai_generator = None

def get_generator():
    """Obtiene o crea la instancia del generador"""
    global _ai_generator
    if _ai_generator is None:
        try:
            _ai_generator = AIShaderGenerator()
        except ValueError:
            return None
    return _ai_generator

# Endpoints
@router.post("/generate")
async def generate_shader(request: GenerateRequest):
    """Genera un shader desde descripción en lenguaje natural"""
    
    generator = get_generator()
    if not generator:
        raise HTTPException(
            status_code=503,
            detail="AI service not available. Set ANTHROPIC_API_KEY."
        )
    
    start_time = time.time()
    
    try:
        result = generator.generate_shader(
            prompt=request.prompt,
            style=request.style,
            complexity=request.complexity,
            performance=request.performance
        )
        
        generation_time = time.time() - start_time
        
        if result.error:
            return GenerateResponse(
                success=False,
                code="",
                explanation="",
                uniforms=[],
                techniques=[],
                error=result.error,
                generationTime=generation_time
            )
        
        return GenerateResponse(
            success=True,
            code=result.code,
            explanation=result.explanation,
            uniforms=result.uniforms,
            techniques=result.techniques,
            error=None,
            generationTime=generation_time
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )

@router.post("/refine")
async def refine_shader(request: RefineRequest):
    """Refina un shader existente basado en feedback"""
    
    generator = get_generator()
    if not generator:
        raise HTTPException(
            status_code=503,
            detail="AI service not available."
        )
    
    start_time = time.time()
    
    try:
        result = generator.refine_shader(
            feedback=request.feedback,
            previous_code=request.previousCode
        )
        
        generation_time = time.time() - start_time
        
        if result.error:
            return GenerateResponse(
                success=False,
                code="",
                explanation="",
                uniforms=[],
                techniques=[],
                error=result.error,
                generationTime=generation_time
            )
        
        return GenerateResponse(
            success=True,
            code=result.code,
            explanation=result.explanation,
            uniforms=result.uniforms,
            techniques=result.techniques,
            error=None,
            generationTime=generation_time
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Refinement failed: {str(e)}"
        )

@router.post("/explain")
async def explain_code(request: ExplainRequest):
    """Explica código shader línea por línea"""
    
    generator = get_generator()
    if not generator:
        raise HTTPException(
            status_code=503,
            detail="AI service not available."
        )
    
    try:
        explanation = generator.explain_code(request.code)
        
        return {
            "success": True,
            "explanation": explanation
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation failed: {str(e)}"
        )

@router.post("/optimize")
async def optimize_code(request: OptimizeRequest):
    """Optimiza código shader para mejor rendimiento"""
    
    generator = get_generator()
    if not generator:
        raise HTTPException(
            status_code=503,
            detail="AI service not available."
        )
    
    try:
        result = generator.optimize_shader(request.code)
        
        return {
            "success": result["success"],
            "suggestions": result["suggestions"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {str(e)}"
        )

@router.post("/clear-history")
async def clear_history():
    """Limpia el historial de conversación"""
    
    generator = get_generator()
    if not generator:
        raise HTTPException(
            status_code=503,
            detail="AI service not available."
        )
    
    try:
        generator.clear_history()
        return {
            "success": True,
            "message": "Conversation history cleared"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Clear failed: {str(e)}"
        )

@router.get("/status")
async def ai_status():
    """Verifica estado del servicio de IA"""
    
    generator = get_generator()
    
    return {
        "available": generator is not None,
        "service": "Claude 3.5 Sonnet",
        "features": [
            "generation",
            "refinement",
            "explanation",
            "optimization"
        ]
    }
