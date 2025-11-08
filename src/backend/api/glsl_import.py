from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional, Literal
import os
import json
import re
import asyncio

router = APIRouter(prefix="/api/v1/glsl-import", tags=["glsl-import"])

# Límites de complejidad
MAX_GLSL_LENGTH = 50000  # 50KB de código GLSL
MAX_NODES = 200  # Máximo 200 nodos
MAX_EDGES = 500  # Máximo 500 conexiones

def detect_code_golf(code: str) -> bool:
    """
    Detecta si el código es probablemente code golf (extremadamente minificado).

    Heurísticas:
    - Muy pocos saltos de línea en relación al tamaño
    - Variables de una sola letra predominantes
    - Pocos espacios
    - Muchas operaciones encadenadas
    """
    lines = code.split('\n')
    non_empty_lines = [l.strip() for l in lines if l.strip()]

    if not non_empty_lines:
        return False

    total_chars = len(code)
    avg_line_length = total_chars / max(len(non_empty_lines), 1)

    # Contador de señales de code golf
    golf_signals = 0

    # Heurística 1: Líneas muy largas (promedio > 100 caracteres)
    if avg_line_length > 80:
        golf_signals += 1

    # Heurística 2: Muy pocas líneas para mucho código (densidad alta)
    if total_chars > 150 and len(non_empty_lines) < 5:
        golf_signals += 2  # Señal fuerte

    # Heurística 3: Muy pocos espacios en relación al código (ratio < 8%)
    space_ratio = code.count(' ') / max(total_chars, 1)
    if space_ratio < 0.08 and total_chars > 100:
        golf_signals += 1

    # Heurística 4: Muchos operadores sin espacios alrededor
    # Contar casos como "a=b" o "x*y" sin espacios
    compact_operators = len(re.findall(r'\w[+\-*/=]\w', code))
    operator_density = compact_operators / max(total_chars, 1)
    if operator_density > 0.02:  # Más del 2% son operadores compactos
        golf_signals += 1

    # Heurística 5: Una sola línea con todo el código
    if len(non_empty_lines) == 1 and total_chars > 80:
        golf_signals += 2  # Señal muy fuerte

    # Decidir: necesitamos al menos 2 señales para considerar code golf
    return golf_signals >= 2

def preprocess_code_golf(code: str) -> tuple[str, bool]:
    """
    Pre-procesa código minificado para hacerlo más fácil de analizar.

    Returns:
        (código procesado, fue modificado)
    """
    is_golf = detect_code_golf(code)

    if not is_golf:
        return code, False

    print(f"[INFO] Code golf detectado, aplicando pre-procesamiento...")

    # No modificamos el código ya que Claude 3.5 Sonnet es capaz de analizarlo,
    # solo añadimos espacios mínimos para mejorar el parsing
    processed = code

    # Añadir espacios después de puntos y comas si no los hay
    processed = re.sub(r';([^\s])', r'; \1', processed)

    # Añadir espacios alrededor de operadores si no los hay
    processed = re.sub(r'([+\-*/=])([^\s=])', r'\1 \2', processed)
    processed = re.sub(r'([^\s=])([+\-*/=])', r'\1 \2', processed)

    # Añadir saltos de línea después de punto y coma si la línea es muy larga
    lines = processed.split('\n')
    new_lines = []
    for line in lines:
        if len(line) > 120 and ';' in line:
            # Split en múltiples líneas
            parts = line.split(';')
            for i, part in enumerate(parts):
                if i < len(parts) - 1:
                    new_lines.append(part.strip() + ';')
                elif part.strip():
                    new_lines.append(part.strip())
        else:
            new_lines.append(line)

    processed = '\n'.join(new_lines)

    print(f"[INFO] Pre-procesamiento completado: {len(code)} -> {len(processed)} chars")

    return processed, True

# Tipos de nodos válidos
VALID_NODE_TYPES = {
    # Inputs
    "uv_input", "time_input", "mouse_input", "resolution_input", "float_constant",
    # Math operations
    "add", "subtract", "multiply", "divide", "pow", "sqrt", "abs",
    "sin", "cos", "tan", "floor", "ceil", "fract",
    "mod", "min", "max", "clamp", "smoothstep", "step",
    # Vector operations
    "dot", "cross", "normalize", "length", "distance", "reflect",
    # Constructors
    "vec2_construct", "vec3_construct", "vec4_construct",
    "vec2_to_vec3", "float_to_vec2", "float_to_vec3", "float_to_vec4",
    # Destructors
    "split_vec2", "split_vec3", "split_vec4",
    # Output
    "fragment_output",
    # Custom
    "custom_code"
}

class NodeData(BaseModel):
    label: str
    type: str
    category: str
    color: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('type')
    @classmethod
    def validate_type(cls, v):
        if v not in VALID_NODE_TYPES:
            raise ValueError(f"Tipo de nodo '{v}' no válido. Debe ser uno de: {VALID_NODE_TYPES}")
        return v

class NodePosition(BaseModel):
    x: float
    y: float

class ShaderNode(BaseModel):
    id: str
    type: Literal["shaderNode"]
    position: NodePosition
    data: NodeData

class ShaderEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str
    targetHandle: str

class GLSLImportRequest(BaseModel):
    glsl_code: str = Field(..., max_length=MAX_GLSL_LENGTH)
    target_format: str = "shadertoy"  # shadertoy, glsl_standard, etc.

    @field_validator('glsl_code')
    @classmethod
    def validate_glsl_code(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("El código GLSL no puede estar vacío")
        if len(v) > MAX_GLSL_LENGTH:
            raise ValueError(f"El código GLSL es demasiado largo ({len(v)} chars). Máximo: {MAX_GLSL_LENGTH}")
        return v

class GLSLImportResponse(BaseModel):
    nodes: List[ShaderNode]
    edges: List[ShaderEdge]
    analysis: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)

def validate_node_graph(nodes: List[Dict], edges: List[Dict]) -> List[str]:
    """
    Valida exhaustivamente el grafo de nodos.
    Retorna lista de warnings (errores graves lanzan excepciones).
    """
    warnings = []

    # Validación 1: Debe haber nodos
    if not nodes:
        raise ValueError("No se generaron nodos. El shader podría ser demasiado complejo o no válido.")

    # Validación 2: Límites de complejidad
    if len(nodes) > MAX_NODES:
        raise ValueError(f"Demasiados nodos generados ({len(nodes)}). Máximo permitido: {MAX_NODES}")

    if len(edges) > MAX_EDGES:
        raise ValueError(f"Demasiadas conexiones generadas ({len(edges)}). Máximo permitido: {MAX_EDGES}")

    # Validación 3: Debe haber un fragment_output
    has_output = any(node.get("data", {}).get("type") == "fragment_output" for node in nodes)
    if not has_output:
        raise ValueError("El grafo no tiene nodo 'fragment_output'. Todo shader debe tener un output final.")

    # Validación 4: IDs únicos
    node_ids = [node.get("id") for node in nodes]
    if len(node_ids) != len(set(node_ids)):
        duplicates = [id for id in node_ids if node_ids.count(id) > 1]
        raise ValueError(f"IDs de nodos duplicados: {set(duplicates)}")

    node_id_set = set(node_ids)

    # Validación 5: Edges deben referenciar nodos existentes
    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")

        if source not in node_id_set:
            raise ValueError(f"Edge {edge.get('id')}: source '{source}' no existe en los nodos")

        if target not in node_id_set:
            raise ValueError(f"Edge {edge.get('id')}: target '{target}' no existe en los nodos")

    # Validación 6: Conectividad del grafo
    # Un grafo conectado necesita al menos N-1 edges
    if len(edges) < len(nodes) - 1:
        warnings.append(
            f"Posible grafo desconectado: {len(nodes)} nodos con solo {len(edges)} conexiones. "
            f"Se esperan al menos {len(nodes)-1} conexiones."
        )

        # Encontrar nodos sin conexiones
        nodes_in_edges = set()
        for edge in edges:
            nodes_in_edges.add(edge.get("source"))
            nodes_in_edges.add(edge.get("target"))

        disconnected = node_id_set - nodes_in_edges
        if disconnected:
            warnings.append(f"Nodos sin conexiones detectados: {disconnected}")

    # Validación 7: Output debe ser alcanzable
    # Hacer BFS desde fragment_output hacia atrás para ver si todos los inputs son alcanzables
    output_nodes = [node.get("id") for node in nodes if node.get("data", {}).get("type") == "fragment_output"]
    if output_nodes:
        output_id = output_nodes[0]

        # Construir grafo inverso (de target a source)
        incoming_edges = {node_id: [] for node_id in node_id_set}
        for edge in edges:
            incoming_edges[edge.get("target")].append(edge.get("source"))

        # BFS desde output
        visited = set()
        queue = [output_id]
        while queue:
            current = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)
            for source in incoming_edges.get(current, []):
                if source not in visited:
                    queue.append(source)

        unreachable = node_id_set - visited
        if unreachable:
            warnings.append(
                f"Nodos que no contribuyen al output final: {unreachable}. "
                f"Estos nodos están desconectados del flujo principal."
            )

    return warnings

async def call_claude_api_async(api_key: str, system_prompt: str, user_prompt: str, max_tokens: int = 8000) -> str:
    """
    Llama a la API de Claude de manera asíncrona.
    """
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=api_key)

    try:
        message = await client.messages.create(
            model="claude-3-5-sonnet-20241022",  # Modelo estable
            max_tokens=max_tokens,  # Ajustable según complejidad
            temperature=0.3,  # Más determinístico
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )

        return message.content[0].text

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error llamando a Claude API: {type(e).__name__}: {str(e)}"
        )

def extract_json_from_response(response_text: str) -> Dict[str, Any]:
    """
    Extrae y parsea JSON de la respuesta de Claude.
    Implementa múltiples estrategias de extracción con logging detallado.
    """
    print(f"[DEBUG] Respuesta de Claude - longitud: {len(response_text)} chars")
    print(f"[DEBUG] Primeros 500 chars:\n{response_text[:500]}")

    cleaned_text = response_text.strip()

    # Estrategia 1: Buscar bloques markdown ```json o ```
    markdown_patterns = [
        r'```json\s*(\{.+?\})\s*```',  # ```json { ... } ```
        r'```\s*(\{.+?\})\s*```',       # ``` { ... } ```
    ]

    json_text = None
    for pattern in markdown_patterns:
        match = re.search(pattern, cleaned_text, re.DOTALL)
        if match:
            json_text = match.group(1).strip()
            print(f"[DEBUG] JSON extraído con patrón markdown")
            break

    # Estrategia 2: Buscar desde primera { hasta última } que coincida
    if not json_text:
        # Buscar el primer { y hacer matching de llaves para encontrar su cierre
        first_brace = cleaned_text.find('{')
        if first_brace != -1:
            brace_count = 0
            start = first_brace
            end = -1

            for i in range(first_brace, len(cleaned_text)):
                if cleaned_text[i] == '{':
                    brace_count += 1
                elif cleaned_text[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end = i + 1
                        break

            if end != -1:
                json_text = cleaned_text[start:end]
                print(f"[DEBUG] JSON extraído con matching de llaves (pos {start} a {end})")

    if not json_text:
        raise ValueError(
            f"No se encontró JSON válido en la respuesta de Claude. "
            f"Respuesta (primeros 1000 chars): {response_text[:1000]}"
        )

    # Parsear JSON
    try:
        result = json.loads(json_text)
        print(f"[DEBUG] JSON parseado exitosamente")
        return result

    except json.JSONDecodeError as e:
        print(f"[ERROR] Error parseando JSON: {str(e)}")
        print(f"[ERROR] JSON que intentamos parsear (primeros 1000 chars):\n{json_text[:1000]}")
        raise ValueError(
            f"JSON inválido en respuesta de Claude: {str(e)}. "
            f"Posición del error: línea {e.lineno}, columna {e.colno}"
        )

@router.post("/parse", response_model=GLSLImportResponse)
async def import_glsl_to_nodes(request: GLSLImportRequest):
    """
    Convierte código GLSL a un grafo de nodos usando IA (MEJORADO).

    Mejoras implementadas:
    - Modelo estable de Claude (claude-3-5-sonnet-20241022)
    - Validación completa de esquema JSON con Pydantic
    - Validación exhaustiva de conectividad de grafo
    - Llamadas asíncronas a API
    - Límites de complejidad (50KB código, 200 nodos, 500 edges)
    - Mensajes de error detallados
    - Warnings informativos
    - **SOPORTE PARA CODE GOLF**: Detecta y pre-procesa código extremadamente compactado
    - Tokens ajustables según complejidad (8K normal, 12K para code golf)
    """

    # Verificar que tenemos API key
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY no configurada. Esta feature requiere API key de Claude."
        )

    try:
        # Verificar que Anthropic SDK esté disponible
        try:
            from anthropic import AsyncAnthropic
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="Paquete 'anthropic' no instalado. Ejecuta: pip install -r requirements.txt"
            )

        print(f"[INFO] Procesando GLSL de {len(request.glsl_code)} caracteres")

        # Pre-procesar código si es code golf
        processed_code, was_preprocessed = preprocess_code_golf(request.glsl_code)
        is_code_golf = was_preprocessed

        if was_preprocessed:
            print(f"[INFO] Code golf pre-procesado: {len(request.glsl_code)} -> {len(processed_code)} chars")

        # Prompt mejorado para Claude con soporte para code golf
        system_prompt = """Eres un experto en GLSL y node-based shader editors.
Tu tarea es analizar código GLSL y convertirlo en un GRAFO COMPLETO Y CONECTADO de nodos.

CRÍTICO: Este es un GRAFO DE FLUJO DE DATOS. TODOS los nodos deben estar conectados formando un flujo continuo desde inputs hasta fragment_output.

## SOPORTE PARA CODE GOLF / CÓDIGO MINIFICADO:

Si el código está extremadamente compactado (code golf):
- **NO TE ASUSTES**: Analiza cuidadosamente cada expresión, incluso si está en una sola línea
- **DESCOMPÓN PASO A PASO**: Cada operación matemática debe ser un nodo separado
- **VARIABLES DE 1 LETRA**: Son válidas (p, c, t, u, v, etc.)
- **EXPRESIONES ENCADENADAS**: Divide "a=b*c+d" en nodos: multiply(b,c) -> add(resultado,d) -> a
- **SIN ESPACIOS**: Es normal en code golf, analiza operadores y paréntesis
- **USA custom_code**: Si una expresión es demasiado compleja, agrúpala en custom_code con su lógica completa

Ejemplo: `c=p.x*p.y+sin(t)` se convierte en:
1. split_vec2(p) -> x, y
2. multiply(x, y) -> temp1
3. sin(t) -> temp2
4. add(temp1, temp2) -> c

## Nodos disponibles:

INPUTS:
- uv_input: Coordenadas UV (vec2)
- time_input: Tiempo iTime (float)
- mouse_input: Mouse (vec2)
- resolution_input: Resolución iResolution (vec3)
- float_constant: Valor constante (usa parameters.value)

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

OUTPUT (OBLIGATORIO):
- fragment_output: Output final (fragColor/gl_FragColor)

CUSTOM:
- custom_code: Para funciones complejas que no tienen nodo específico (usa parameters.code)

## REGLAS CRÍTICAS:

1. **GRAFO CONECTADO**: TODOS los nodos deben estar conectados. NO dejes nodos aislados.
2. **fragment_output OBLIGATORIO**: Debe existir y estar conectado al final del flujo.
3. **FLUJO LÓGICO**: Respeta el orden de evaluación del shader original.
4. **IDs ÚNICOS**: Usa IDs únicos (node-1, node-2, ..., node-N).
5. **EDGES VÁLIDOS**: Cada edge debe referenciar nodos que existen.
6. **HANDLES**:
   - Inputs de nodos matemáticos: "input", "input2", etc.
   - Outputs de todos los nodos: "output"
   - Input de fragment_output: "color"
7. **POSICIONAMIENTO**: X incrementa de izq. a der. (200px), Y para evitar solapamientos.
8. **SIMPLIFICACIÓN**: Agrupa operaciones complejas en custom_code si es necesario.
9. **CODE GOLF**: Si el código es muy compacto, divide cada operación en nodos individuales o usa custom_code para sub-expresiones complejas

## Formato JSON (EXACTO):

{
  "nodes": [
    {
      "id": "node-1",
      "type": "shaderNode",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "UV",
        "type": "uv_input",
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
      "targetHandle": "color"
    }
  ],
  "analysis": "Descripción breve del shader y su conversión a nodos"
}

IMPORTANTE: Devuelve SOLO el JSON válido. Sin texto adicional, sin markdown externo."""

        # Construir user prompt con información sobre code golf
        code_golf_hint = ""
        if is_code_golf:
            code_golf_hint = "\n\n⚠️ NOTA: Este código es CODE GOLF (extremadamente compactado). Analiza cada operación cuidadosamente y descomponla en nodos individuales o usa custom_code para expresiones complejas."

        user_prompt = f"""Analiza y convierte este código GLSL a un grafo de nodos:

```glsl
{processed_code}
```{code_golf_hint}

Recuerda: SOLO JSON válido, sin texto adicional."""

        # Ajustar max_tokens según complejidad (más para code golf)
        max_tokens = 12000 if is_code_golf else 8000

        # Llamar a Claude de manera asíncrona
        print(f"[INFO] Llamando a Claude API (modelo: claude-3-5-sonnet-20241022, max_tokens: {max_tokens})")
        response_text = await call_claude_api_async(
            api_key=anthropic_api_key,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=max_tokens
        )

        # Extraer y parsear JSON
        print(f"[INFO] Extrayendo JSON de respuesta")
        result = extract_json_from_response(response_text)

        # Obtener nodos y edges
        nodes_data = result.get("nodes", [])
        edges_data = result.get("edges", [])
        analysis = result.get("analysis", "Conversión completada")

        print(f"[INFO] Respuesta contiene {len(nodes_data)} nodos y {len(edges_data)} edges")

        # Validar grafo (lanza excepciones si hay errores graves)
        warnings = validate_node_graph(nodes_data, edges_data)

        # Añadir warning si fue code golf
        if is_code_golf:
            warnings.insert(0, "Code golf detectado: El código fue pre-procesado para mejorar el análisis. La conversión podría ser más compleja de lo habitual debido a la alta compactación del código original.")

        # Validar esquema con Pydantic (esto valida tipos, campos requeridos, etc.)
        try:
            validated_nodes = [ShaderNode(**node) for node in nodes_data]
            validated_edges = [ShaderEdge(**edge) for edge in edges_data]
        except Exception as e:
            raise ValueError(
                f"Error validando estructura de nodos/edges: {str(e)}. "
                f"Verifica que la respuesta de Claude cumpla el esquema exacto."
            )

        print(f"[SUCCESS] Conversión exitosa: {len(validated_nodes)} nodos, {len(validated_edges)} edges")
        if warnings:
            print(f"[WARNINGS] {len(warnings)} advertencias generadas")
            for w in warnings:
                print(f"  - {w}")

        return GLSLImportResponse(
            nodes=validated_nodes,
            edges=validated_edges,
            analysis=analysis,
            warnings=warnings
        )

    except HTTPException:
        # Re-lanzar HTTPExceptions directamente
        raise

    except ValueError as e:
        print(f"[ERROR] ValueError: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Error de validación: {str(e)}"
        )

    except json.JSONDecodeError as e:
        print(f"[ERROR] JSONDecodeError: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"La respuesta de Claude no es JSON válido. Línea {e.lineno}, columna {e.colno}: {str(e)}"
        )

    except Exception as e:
        print(f"[ERROR] Exception inesperada: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado procesando GLSL: {type(e).__name__}: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Verifica que la API de Claude esté configurada"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    return {
        "configured": api_key is not None,
        "message": "Claude API configurada" if api_key else "ANTHROPIC_API_KEY no configurada"
    }
