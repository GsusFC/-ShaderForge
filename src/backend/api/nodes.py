from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from core.compiler import GLSLCompiler

router = APIRouter(prefix="/api/v1/nodes", tags=["nodes"])

# Modelos Pydantic
class NodeData(BaseModel):
    id: str
    type: str
    label: str
    description: Optional[str] = None
    category: str
    position: Dict[str, float]

class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class NodeGraph(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class CompileRequest(BaseModel):
    graph: NodeGraph
    language: str = "glsl"
    optimize: bool = True

class CompileResponse(BaseModel):
    success: bool
    code: str
    language: str
    uniforms: List[Dict[str, str]]
    functions: List[str]
    error: Optional[str] = None
    warnings: List[str] = []
    compilationTime: float

# Endpoints
@router.post("/graph/compile")
async def compile_graph(request: CompileRequest):
    """Compila un grafo de nodos a código shader"""
    import time
    
    start_time = time.time()
    
    try:
        # Convertir NodeGraph a dict
        graph_dict = {
            "nodes": request.graph.nodes,
            "edges": request.graph.edges
        }
        
        # Compilar
        compiler = GLSLCompiler()
        result = compiler.compile(graph_dict)
        
        compilation_time = time.time() - start_time
        
        # Response
        if result.error:
            return CompileResponse(
                success=False,
                code="",
                language=request.language,
                uniforms=[],
                functions=[],
                error=result.error,
                warnings=result.warnings,
                compilationTime=compilation_time
            )
        
        return CompileResponse(
            success=True,
            code=result.code,
            language=request.language,
            uniforms=result.uniforms,
            functions=result.functions,
            error=None,
            warnings=result.warnings,
            compilationTime=compilation_time
        )
        
    except Exception as e:
        compilation_time = time.time() - start_time
        raise HTTPException(
            status_code=500,
            detail=f"Compilation failed: {str(e)}"
        )

@router.get("/library")
async def get_node_library(category: Optional[str] = None):
    """Obtiene la librería de nodos disponibles"""
    
    node_library = {
        "Inputs": [
            {
                "type": "uv_input",
                "name": "UV",
                "description": "Coordenadas UV de pantalla",
                "category": "input",
                "inputs": 0,
                "outputs": 1,
                "color": "#3b82f6"
            },
            {
                "type": "time_input",
                "name": "Time",
                "description": "Tiempo desde inicio",
                "category": "input",
                "inputs": 0,
                "outputs": 1,
                "color": "#3b82f6"
            }
        ],
        "Math": [
            {
                "type": "add",
                "name": "Add",
                "description": "Suma dos valores",
                "category": "operation",
                "inputs": 2,
                "outputs": 1,
                "color": "#8b5cf6"
            },
            {
                "type": "multiply",
                "name": "Multiply",
                "description": "Multiplica dos valores",
                "category": "operation",
                "inputs": 2,
                "outputs": 1,
                "color": "#8b5cf6"
            },
            {
                "type": "lerp",
                "name": "Lerp",
                "description": "Interpolación lineal",
                "category": "operation",
                "inputs": 3,
                "outputs": 1,
                "color": "#8b5cf6"
            },
            {
                "type": "clamp",
                "name": "Clamp",
                "description": "Limita valor",
                "category": "operation",
                "inputs": 3,
                "outputs": 1,
                "color": "#8b5cf6"
            }
        ],
        "Noise": [
            {
                "type": "perlin_noise",
                "name": "Perlin Noise",
                "description": "Ruido de Perlin",
                "category": "operation",
                "inputs": 1,
                "outputs": 1,
                "color": "#ec4899"
            },
            {
                "type": "simplex_noise",
                "name": "Simplex Noise",
                "description": "Ruido Simplex",
                "category": "operation",
                "inputs": 1,
                "outputs": 1,
                "color": "#ec4899"
            }
        ],
        "SDF": [
            {
                "type": "sdf_sphere",
                "name": "SDF Sphere",
                "description": "Función de distancia: Esfera",
                "category": "operation",
                "inputs": 2,
                "outputs": 1,
                "color": "#f59e0b"
            }
        ],
        "Output": [
            {
                "type": "fragment_output",
                "name": "Fragment Output",
                "description": "Color final",
                "category": "output",
                "inputs": 1,
                "outputs": 0,
                "color": "#10b981"
            }
        ]
    }
    
    if category:
        return {
            "category": category,
            "nodes": node_library.get(category, [])
        }
    
    return {"library": node_library}

@router.post("/graph/validate")
async def validate_graph(graph: NodeGraph):
    """Valida un grafo sin compilar"""
    try:
        compiler = GLSLCompiler()
        
        # Solo validar
        is_valid = compiler._validate_graph({
            "nodes": graph.nodes,
            "edges": graph.edges
        })
        
        return {
            "valid": is_valid,
            "errors": compiler.errors,
            "warnings": compiler.warnings
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Validation failed: {str(e)}"
        )

@router.get("/stats")
async def get_compiler_stats():
    """Obtiene estadísticas del compilador"""
    compiler = GLSLCompiler()
    
    return {
        "supported_nodes": len(compiler.NODE_FUNCTIONS),
        "helper_functions": len(compiler.HELPER_FUNCTIONS),
        "node_types": {
            "inputs": sum(1 for n in compiler.NODE_FUNCTIONS.values() if n.get('uniforms')),
            "operations": sum(1 for n in compiler.NODE_FUNCTIONS.values() if n.get('inputs', 0) > 0),
            "outputs": sum(1 for n in compiler.NODE_FUNCTIONS.values() if n.get('outputs', 0) == 0)
        }
    }
