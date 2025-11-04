import os
from typing import Optional, Dict, Any, List
from anthropic import Anthropic
from dataclasses import dataclass

@dataclass
class GeneratedShader:
    code: str
    explanation: str
    uniforms: List[str]
    techniques: List[str]
    error: Optional[str] = None

class AIShaderGenerator:
    """Genera shaders usando Claude API"""
    
    SYSTEM_PROMPT = """Eres un experto en shaders GLSL. Tu trabajo es generar código GLSL válido basado en descripciones del usuario.

IMPORTANTE:
1. Genera SOLO código GLSL válido que pueda compilarse
2. Usa iTime para animación temporal
3. Usa iResolution para la resolución de pantalla
4. Usa fragCoord para las coordenadas del fragment
5. La función principal debe llamarse 'mainImage(out vec4 fragColor, in vec2 fragCoord)'
6. Optimiza el código para rendimiento
7. Comenta las partes complejas
8. Implementa técnicas reales de shaders

ESTRUCTURA ESPERADA:
```glsl
// Comentario con descripción
// Usa estas funciones helper si es necesario

float someFunction(vec2 p) {
    // implementación
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    // Tu código aquí
    fragColor = vec4(resultado, 1.0);
}
```

Después del código, explica brevemente:
- Qué hace el shader
- Qué técnicas usa
- Qué uniforms tiene
"""
    
    PROMPT_TEMPLATE = """Genera un shader GLSL que: {prompt}

Características:
- Estilo: {style}
- Complejidad: {complexity}
- Performance: {performance}

Proporciona:
1. Código GLSL completo y funcional
2. Breve explicación de qué hace
3. Lista de técnicas usadas
4. Lista de uniforms (iTime, iResolution, etc.)
"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        
        self.client = Anthropic(api_key=self.api_key)
        self.conversation_history = []
    
    def generate_shader(
        self,
        prompt: str,
        style: str = "realistic",
        complexity: str = "medium",
        performance: str = "high"
    ) -> GeneratedShader:
        """Genera un shader desde una descripción"""
        
        try:
            # Construir mensaje
            user_message = self.PROMPT_TEMPLATE.format(
                prompt=prompt,
                style=style,
                complexity=complexity,
                performance=performance
            )
            
            # Llamar a Claude
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                system=self.SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )
            
            content = response.content[0].text
            
            # Parsear respuesta
            shader = self._parse_response(content)
            
            # Guardar en historial
            self.conversation_history.append({
                "role": "user",
                "content": user_message
            })
            self.conversation_history.append({
                "role": "assistant",
                "content": content
            })
            
            return shader
            
        except Exception as e:
            return GeneratedShader(
                code="",
                explanation="",
                uniforms=[],
                techniques=[],
                error=f"Generation failed: {str(e)}"
            )
    
    def refine_shader(
        self,
        feedback: str,
        previous_code: str
    ) -> GeneratedShader:
        """Refina un shader existente basado en feedback"""
        
        try:
            # Preparar mensajes con contexto
            messages = self.conversation_history + [
                {
                    "role": "user",
                    "content": f"El shader anterior:\n```glsl\n{previous_code}\n```\n\nFeedback: {feedback}\n\nPor favor, ajusta el shader según este feedback."
                }
            ]
            
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                system=self.SYSTEM_PROMPT,
                messages=messages
            )
            
            content = response.content[0].text
            shader = self._parse_response(content)
            
            # Actualizar historial
            self.conversation_history.append({
                "role": "user",
                "content": messages[-1]["content"]
            })
            self.conversation_history.append({
                "role": "assistant",
                "content": content
            })
            
            return shader
            
        except Exception as e:
            return GeneratedShader(
                code="",
                explanation="",
                uniforms=[],
                techniques=[],
                error=f"Refinement failed: {str(e)}"
            )
    
    def explain_code(self, code: str) -> str:
        """Explica código shader línea por línea"""
        
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": f"Explica este código GLSL línea por línea de forma educativa:\n```glsl\n{code}\n```"
                    }
                ]
            )
            
            return response.content[0].text
            
        except Exception as e:
            return f"Explanation failed: {str(e)}"
    
    def optimize_shader(self, code: str) -> Dict[str, Any]:
        """Optimiza un shader para mejor rendimiento"""
        
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": f"""Optimiza este shader GLSL para mejor rendimiento:

```glsl
{code}
```

Proporciona:
1. Código optimizado
2. Cambios realizados
3. Estimado de mejora de rendimiento

Mantén la misma funcionalidad visual."""
                    }
                ]
            )
            
            return {
                "suggestions": response.content[0].text,
                "success": True
            }
            
        except Exception as e:
            return {
                "suggestions": f"Optimization failed: {str(e)}",
                "success": False
            }
    
    def _parse_response(self, content: str) -> GeneratedShader:
        """Parsea la respuesta de Claude"""
        
        # Extraer código GLSL
        import re
        
        code_match = re.search(r'```glsl\n(.*?)\n```', content, re.DOTALL)
        code = code_match.group(1) if code_match else ""
        
        # Extraer explicación (todo lo que no sea código)
        explanation = content
        if code_match:
            explanation = content[:code_match.start()] + content[code_match.end():]
        
        # Extraer uniforms
        uniforms = []
        if "iTime" in code:
            uniforms.append("iTime")
        if "iResolution" in code:
            uniforms.append("iResolution")
        
        # Extraer técnicas
        techniques = []
        techniques_map = {
            "raymarching": "raymarching",
            "sdSphere": "sdf",
            "noise": "noise",
            "fbm": "fbm",
            "perlin": "perlin",
            "voronoi": "voronoi",
            "mix": "lerp",
            "fractal": "fractals"
        }
        
        for keyword, technique in techniques_map.items():
            if keyword in code and technique not in techniques:
                techniques.append(technique)
        
        return GeneratedShader(
            code=code,
            explanation=explanation.strip(),
            uniforms=uniforms,
            techniques=techniques
        )
    
    def clear_history(self):
        """Limpia el historial de conversación"""
        self.conversation_history = []
