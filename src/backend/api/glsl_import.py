from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import re

router = APIRouter(prefix="/api/v1/glsl-import", tags=["glsl-import"])

class GLSLImportRequest(BaseModel):
    glsl_code: str
    target_format: str = "shadertoy"  # shadertoy, glsl_standard, etc.

class GLSLImportResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    analysis: Optional[str] = None

@router.post("/parse", response_model=GLSLImportResponse)
async def import_glsl_to_nodes(request: GLSLImportRequest):
    """
    Convierte código GLSL a un grafo de nodos usando IA.

    Analiza el código GLSL y genera una estructura de nodos
    que puede ser cargada directamente en el editor.
    """

    # Verificar que tenemos API key
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY no configurada. Esta feature requiere API key de Claude."
        )

    try:
        # Importar Anthropic SDK
        try:
            from anthropic import Anthropic
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="anthropic package no instalado. Usa requirements.txt completo."
            )

        client = Anthropic(api_key=anthropic_api_key)

        # Prompt para Claude
        system_prompt = """Eres un experto en GLSL y node-based shader editors.
Tu tarea es analizar código GLSL y convertirlo en un grafo de nodos.

Nodos disponibles:
- uv_input, time_input, mouse_input, float_constant
- add, subtract, multiply, divide, pow, sqrt, abs, sin, cos, tan
- floor, ceil, fract, mod, min, max, clamp, smoothstep, step
- dot, cross, normalize, length, distance, reflect
- vec2_construct, vec3_construct, vec4_construct
- vec2_to_vec3, float_to_vec2, float_to_vec3, float_to_vec4
- split_vec2, split_vec3, split_vec4
- perlin_noise, simplex_noise
- sdf_sphere, sdf_box, sdf_torus
- fragment_output
- custom_code (para funciones personalizadas)

Debes devolver un JSON con:
{
  "nodes": [
    {
      "id": "node-1",
      "type": "shaderNode",
      "position": {"x": 100, "y": 200},
      "data": {
        "label": "UV",
        "type": "uv_input",
        "category": "input",
        "color": "#3b82f6",
        "parameters": {}
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "node-1",
      "target": "node-2",
      "sourceHandle": "output",
      "targetHandle": "input"
    }
  ],
  "analysis": "Descripción de lo que hace el shader"
}

Reglas:
1. Usa custom_code SOLO para funciones complejas que no tienen nodo equivalente
2. Posiciona nodos de izquierda a derecha (inputs → operations → output)
3. Incrementa Y para evitar solapamientos
4. Usa nodos existentes siempre que sea posible
5. Para funciones custom como rgb() o sdCircle(), usa custom_code con el código
"""

        user_prompt = f"""Analiza este código GLSL y conviértelo en nodos:

```glsl
{request.glsl_code}
```

Devuelve SOLO el JSON, sin markdown ni explicaciones."""

        # Llamar a Claude
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )

        # Extraer respuesta
        response_text = message.content[0].text

        # Limpiar markdown si está presente
        # Intentar extraer JSON del markdown
        json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)

        # Parsear JSON
        result = json.loads(response_text)

        return GLSLImportResponse(
            nodes=result.get("nodes", []),
            edges=result.get("edges", []),
            analysis=result.get("analysis")
        )

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error parseando respuesta de IA: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando GLSL: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Verifica que la API de Claude esté configurada"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    return {
        "configured": api_key is not None,
        "message": "Claude API configurada" if api_key else "ANTHROPIC_API_KEY no configurada"
    }
