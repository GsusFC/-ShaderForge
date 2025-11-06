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
Tu tarea es analizar código GLSL y convertirlo en un GRAFO COMPLETO Y CONECTADO de nodos.

IMPORTANTE: Este es un GRAFO DE FLUJO DE DATOS. TODOS los nodos deben estar conectados formando un flujo desde inputs hasta fragment_output.

## Nodos disponibles:

INPUTS:
- uv_input: Coordenadas UV (vec2)
- time_input: Tiempo (iTime) (float)
- mouse_input: Mouse (vec2)
- resolution_input: Resolución (iResolution) (vec3)
- float_constant: Valor constante (configurable en parameters.value)

OPERACIONES MATEMÁTICAS:
- add, subtract, multiply, divide: Operaciones binarias
- pow, sqrt, abs, sin, cos, tan, floor, ceil, fract
- mod, min, max, clamp, smoothstep, step
- dot, cross, normalize, length, distance, reflect

CONSTRUCTORES:
- vec2_construct, vec3_construct, vec4_construct
- vec2_to_vec3, float_to_vec2, float_to_vec3, float_to_vec4

DESTRUCTORES:
- split_vec2: Extrae x, y de vec2
- split_vec3: Extrae x, y, z de vec3
- split_vec4: Extrae x, y, z, w de vec4

OUTPUT:
- fragment_output: Output final (fragColor)

CUSTOM:
- custom_code: Para funciones complejas (especifica code en parameters)

## Formato JSON requerido:

{
  "nodes": [
    {
      "id": "node-1",
      "type": "shaderNode",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "Time",
        "type": "time_input",
        "category": "input",
        "color": "#3b82f6",
        "parameters": {}
      }
    },
    {
      "id": "node-2",
      "type": "shaderNode",
      "position": {"x": 300, "y": 100},
      "data": {
        "label": "Sin",
        "type": "sin",
        "category": "math",
        "color": "#10b981",
        "parameters": {}
      }
    },
    {
      "id": "node-3",
      "type": "shaderNode",
      "position": {"x": 500, "y": 100},
      "data": {
        "label": "Output",
        "type": "fragment_output",
        "category": "output",
        "color": "#ef4444",
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
    },
    {
      "id": "e2",
      "source": "node-2",
      "target": "node-3",
      "sourceHandle": "output",
      "targetHandle": "color"
    }
  ],
  "analysis": "Calcula sin(time) y lo envía al output"
}

## REGLAS CRÍTICAS:

1. **TODOS LOS NODOS DEBEN ESTAR CONECTADOS**: No dejes nodos sueltos
2. **DEBE HABER UN fragment_output**: Es el nodo final obligatorio
3. **FLUJO DE DATOS**: Sigue el orden de evaluación del shader original
4. **IDs ÚNICOS**: Cada nodo necesita un ID único (node-1, node-2, etc)
5. **EDGES VÁLIDOS**: Cada edge debe conectar nodos que existen
6. **HANDLES CORRECTOS**:
   - Nodos matemáticos usan "input", "input2" para entradas
   - Todos los nodos tienen "output" para salida
   - fragment_output usa "color" como input
7. **POSICIONAMIENTO**: X incrementa de izquierda a derecha (cada 200px), Y incrementa para evitar solapamientos
8. **PARAMETERS**: Para float_constant usa {"value": 1.0}, para custom_code usa {"code": "...glsl..."}

## Ejemplo completo (UV con color):

{
  "nodes": [
    {"id": "n1", "type": "shaderNode", "position": {"x": 50, "y": 100}, "data": {"label": "UV", "type": "uv_input", "category": "input", "color": "#3b82f6", "parameters": {}}},
    {"id": "n2", "type": "shaderNode", "position": {"x": 250, "y": 100}, "data": {"label": "To Vec3", "type": "vec2_to_vec3", "category": "conversion", "color": "#8b5cf6", "parameters": {}}},
    {"id": "n3", "type": "shaderNode", "position": {"x": 450, "y": 100}, "data": {"label": "To Vec4", "type": "float_to_vec4", "category": "conversion", "color": "#8b5cf6", "parameters": {}}},
    {"id": "n4", "type": "shaderNode", "position": {"x": 650, "y": 100}, "data": {"label": "Output", "type": "fragment_output", "category": "output", "color": "#ef4444", "parameters": {}}}
  ],
  "edges": [
    {"id": "e1", "source": "n1", "target": "n2", "sourceHandle": "output", "targetHandle": "input"},
    {"id": "e2", "source": "n2", "target": "n3", "sourceHandle": "output", "targetHandle": "input"},
    {"id": "e3", "source": "n3", "target": "n4", "sourceHandle": "output", "targetHandle": "color"}
  ],
  "analysis": "Convierte UV (vec2) a vec4 y lo envía al output"
}
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

        # Log de la respuesta completa para debugging
        print(f"[DEBUG] Respuesta de Claude - longitud: {len(response_text)} chars")
        print(f"[DEBUG] Primeros 1000 chars:\n{response_text[:1000]}")
        print(f"[DEBUG] Últimos 200 chars:\n{response_text[-200:]}")

        # Limpiar respuesta
        cleaned_text = response_text.strip()

        # Estrategia 1: Remover bloques markdown y extraer el contenido
        # Capturar TODO lo que está dentro de los backticks (no solo hasta primera })
        markdown_patterns = [
            r'```json\s*(.+?)\s*```',  # ```json ... ```
            r'```\s*(.+?)\s*```',       # ``` ... ```
        ]

        json_text = None
        for pattern in markdown_patterns:
            match = re.search(pattern, cleaned_text, re.DOTALL)
            if match:
                json_text = match.group(1).strip()
                print(f"[DEBUG] Extraído de markdown con patrón: {pattern}")
                print(f"[DEBUG] JSON extraído (primeros 300 chars): {json_text[:300]}")
                break

        # Estrategia 2: Si no hay markdown, buscar desde primera { hasta última }
        if not json_text:
            first_brace = cleaned_text.find('{')
            last_brace = cleaned_text.rfind('}')
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                json_text = cleaned_text[first_brace:last_brace + 1]
                print(f"[DEBUG] Extraído JSON sin markdown (desde pos {first_brace} hasta {last_brace})")
            else:
                print(f"[ERROR] No se encontraron llaves {{ }} en la respuesta")
                print(f"[ERROR] Respuesta completa:\n{response_text}")
                raise ValueError(
                    f"No se pudo encontrar JSON en la respuesta de Claude. "
                    f"Respuesta (primeros 500 chars): {response_text[:500]}"
                )

        # Intentar parsear el JSON extraído
        try:
            result = json.loads(json_text)
            print(f"[DEBUG] JSON parseado exitosamente")
        except json.JSONDecodeError as e:
            print(f"[ERROR] Error parseando JSON: {str(e)}")
            print(f"[ERROR] JSON que intentamos parsear:\n{json_text[:1000]}")
            raise ValueError(
                f"El JSON extraído no es válido: {str(e)}. "
                f"JSON (primeros 500 chars): {json_text[:500]}"
            )

        # Validar el grafo generado
        nodes = result.get("nodes", [])
        edges = result.get("edges", [])

        print(f"[DEBUG] Nodos generados: {len(nodes)}")
        print(f"[DEBUG] Edges generados: {len(edges)}")

        # Validación 1: Debe haber nodos
        if not nodes:
            raise ValueError("Claude no generó ningún nodo. El shader podría ser muy complejo.")

        # Validación 2: Debe haber un fragment_output
        has_output = any(node.get("data", {}).get("type") == "fragment_output" for node in nodes)
        if not has_output:
            print(f"[WARNING] No se encontró fragment_output en los nodos generados")

        # Validación 3: Verificar que los edges tengan IDs válidos
        node_ids = {node.get("id") for node in nodes}
        invalid_edges = []
        for edge in edges:
            source = edge.get("source")
            target = edge.get("target")
            if source not in node_ids:
                invalid_edges.append(f"Edge {edge.get('id')}: source '{source}' no existe")
            if target not in node_ids:
                invalid_edges.append(f"Edge {edge.get('id')}: target '{target}' no existe")

        if invalid_edges:
            print(f"[ERROR] Edges inválidos encontrados:")
            for err in invalid_edges:
                print(f"  - {err}")
            print(f"[DEBUG] Node IDs disponibles: {node_ids}")

        # Validación 4: Advertencia si hay pocos edges
        # Un grafo conectado necesita al menos N-1 edges
        if len(edges) < len(nodes) - 1:
            print(f"[WARNING] Posible grafo desconectado: {len(nodes)} nodos pero solo {len(edges)} edges")
            print(f"[WARNING] Un grafo conectado necesita al menos {len(nodes)-1} edges")

            # Encontrar nodos sin conexiones
            nodes_in_edges = set()
            for edge in edges:
                nodes_in_edges.add(edge.get("source"))
                nodes_in_edges.add(edge.get("target"))

            disconnected = node_ids - nodes_in_edges
            if disconnected:
                print(f"[WARNING] Nodos sin conexiones: {disconnected}")

        return GLSLImportResponse(
            nodes=nodes,
            edges=edges,
            analysis=result.get("analysis")
        )

    except json.JSONDecodeError as e:
        print(f"[ERROR] JSONDecodeError: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error parseando JSON de respuesta de IA: {str(e)}. Verifica los logs del servidor para más detalles."
        )
    except ValueError as e:
        print(f"[ERROR] ValueError: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    except Exception as e:
        print(f"[ERROR] Exception no esperada: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando GLSL: {type(e).__name__}: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Verifica que la API de Claude esté configurada"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    return {
        "configured": api_key is not None,
        "message": "Claude API configurada" if api_key else "ANTHROPIC_API_KEY no configurada"
    }
