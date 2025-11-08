#!/usr/bin/env python3
"""
Script de prueba para verificar si el sistema de importación GLSL
realmente funciona con code golf.
"""

import os
import json
import asyncio
from anthropic import AsyncAnthropic

# Ejemplos reales de code golf de Shadertoy
CODE_GOLF_EXAMPLES = {
    "simple": """
void mainImage(out vec4 c,vec2 p){
p/=iResolution.xy;
c=vec4(p,0,1);
}
""",

    "medium": """
void mainImage(out vec4 c,vec2 p){
p=p/iResolution.xy*2.-1.;
c=vec4(sin(p.x*10.+iTime),cos(p.y*10.+iTime),0,1);
}
""",

    "hard": """
void mainImage(out vec4 c,vec2 p){
p=p/iResolution.xy*2.-1.;
float t=iTime,d=length(p);
c=vec4(sin(d*10.-t*2.)*0.5+0.5);
}
""",

    "extreme": """
void mainImage(out vec4 c,vec2 p){
p=p/iResolution.xy-.5;c.rgb=vec3(length(p+vec2(sin(iTime),cos(iTime))*.3));
}
"""
}

async def test_code_golf_conversion(code: str, name: str):
    """Prueba la conversión de code golf a nodos"""

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ ANTHROPIC_API_KEY no configurada")
        return None

    # Este es el mismo prompt del sistema real
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

IMPORTANTE: Devuelve SOLO el JSON válido. Sin texto adicional, sin markdown externo."""

    user_prompt = f"""Analiza y convierte este código GLSL a un grafo de nodos:

```glsl
{code}
```

⚠️ NOTA: Este código es CODE GOLF (extremadamente compactado). Analiza cada operación cuidadosamente y descomponla en nodos individuales o usa custom_code para expresiones complejas.

Recuerda: SOLO JSON válido, sin texto adicional."""

    print(f"\n{'='*60}")
    print(f"🧪 PRUEBA: {name}")
    print(f"{'='*60}")
    print(f"Código:\n{code}")
    print(f"\n⏳ Llamando a Claude API...")

    try:
        client = AsyncAnthropic(api_key=api_key)

        message = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=12000,
            temperature=0.3,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )

        response_text = message.content[0].text

        # Extraer JSON
        import re
        json_text = None

        # Buscar bloques markdown
        markdown_patterns = [
            r'```json\s*(\{.+?\})\s*```',
            r'```\s*(\{.+?\})\s*```',
        ]

        for pattern in markdown_patterns:
            match = re.search(pattern, response_text, re.DOTALL)
            if match:
                json_text = match.group(1).strip()
                break

        # Buscar primer { hasta último }
        if not json_text:
            first_brace = response_text.find('{')
            if first_brace != -1:
                brace_count = 0
                for i in range(first_brace, len(response_text)):
                    if response_text[i] == '{':
                        brace_count += 1
                    elif response_text[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            json_text = response_text[first_brace:i+1]
                            break

        if not json_text:
            print("❌ No se encontró JSON en la respuesta")
            print(f"Respuesta completa:\n{response_text[:1000]}")
            return None

        # Parsear JSON
        result = json.loads(json_text)

        nodes = result.get("nodes", [])
        edges = result.get("edges", [])
        analysis = result.get("analysis", "")

        print(f"\n✅ RESPUESTA DE CLAUDE:")
        print(f"   📦 Nodos generados: {len(nodes)}")
        print(f"   🔗 Conexiones: {len(edges)}")
        print(f"   💡 Análisis: {analysis[:200]}...")

        # Análisis detallado
        print(f"\n📊 ANÁLISIS DE NODOS:")
        node_types = {}
        for node in nodes:
            node_type = node.get("data", {}).get("type", "unknown")
            node_types[node_type] = node_types.get(node_type, 0) + 1

        for node_type, count in sorted(node_types.items()):
            print(f"   • {node_type}: {count}")

        # Validar conectividad
        has_output = any(n.get("data", {}).get("type") == "fragment_output" for n in nodes)
        print(f"\n🎯 VALIDACIONES:")
        print(f"   {'✅' if nodes else '❌'} Tiene nodos: {len(nodes)}")
        print(f"   {'✅' if edges else '❌'} Tiene conexiones: {len(edges)}")
        print(f"   {'✅' if has_output else '❌'} Tiene fragment_output")

        # Verificar si es un grafo conectado
        if nodes and edges:
            node_ids = set(n["id"] for n in nodes)
            connected_nodes = set()
            for edge in edges:
                connected_nodes.add(edge["source"])
                connected_nodes.add(edge["target"])

            disconnected = node_ids - connected_nodes
            print(f"   {'✅' if not disconnected else '❌'} Grafo conectado (nodos sueltos: {len(disconnected)})")

        return {
            "nodes": nodes,
            "edges": edges,
            "analysis": analysis,
            "success": len(nodes) > 0 and has_output
        }

    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║  PRUEBA DE CONVERSIÓN DE CODE GOLF A NODOS                  ║
║  Verificando si Claude puede convertir GLSL compactado       ║
╚══════════════════════════════════════════════════════════════╝
""")

    results = {}

    for difficulty, code in CODE_GOLF_EXAMPLES.items():
        result = await test_code_golf_conversion(code, difficulty.upper())
        results[difficulty] = result

        # Pausa entre pruebas
        await asyncio.sleep(2)

    # Resumen final
    print(f"\n{'='*60}")
    print("📈 RESUMEN DE RESULTADOS")
    print(f"{'='*60}")

    for difficulty, result in results.items():
        if result:
            success_icon = "✅" if result["success"] else "⚠️"
            print(f"{success_icon} {difficulty.upper()}: {len(result['nodes'])} nodos, {len(result['edges'])} edges")
        else:
            print(f"❌ {difficulty.upper()}: FALLÓ")

    # Conclusión
    successful = sum(1 for r in results.values() if r and r["success"])
    total = len(results)

    print(f"\n{'='*60}")
    print(f"Tasa de éxito: {successful}/{total} ({successful*100//total}%)")

    if successful == total:
        print("✅ CONCLUSIÓN: El sistema funciona bien con code golf")
    elif successful > 0:
        print("⚠️ CONCLUSIÓN: El sistema funciona parcialmente con code golf")
    else:
        print("❌ CONCLUSIÓN: El sistema NO funciona con code golf")
    print(f"{'='*60}")

if __name__ == "__main__":
    asyncio.run(main())
