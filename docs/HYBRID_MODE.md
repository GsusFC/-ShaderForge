# 🎨 Modo Híbrido: Editor de Nodos + Editor de Código

## 📋 Resumen

ShaderForge AI ahora soporta **dos modos de edición complementarios**:

1. **🟢 Modo Nodos** - Editor visual con sistema de nodos (ideal para shaders educativos y visualización)
2. **🟢 Modo Código** - Editor de código GLSL profesional con Monaco (ideal para shaders complejos y code golf)

Este enfoque híbrido reconoce que **no todos los shaders se benefician del sistema de nodos**, especialmente los shaders ultra-compactos (code golf) que usan técnicas avanzadas sin representación directa en nodos.

---

## 🎯 ¿Cuándo usar cada modo?

### Modo Nodos ✨
**Mejor para:**
- ✅ Shaders educativos simples
- ✅ Visualización del flujo de datos
- ✅ Aprender GLSL de manera visual
- ✅ Shaders que usan 5-20 nodos básicos

**Limitaciones:**
- ❌ Solo 31 tipos de nodos disponibles
- ❌ Faltan nodos críticos: `mix`, `atan`, `sign`, `exp`, loops, ternarios
- ❌ No soporta swizzling avanzado (`color.xxy`)
- ❌ No soporta estructuras complejas

**Ejemplo perfecto:** Gradiente animado simple
```glsl
vec3 color = vec3(uv.x, uv.y, 0.5);
```

---

### Modo Código 💻
**Mejor para:**
- ✅ Shaders de Shadertoy/GLSL Sandbox
- ✅ Code golf (shaders ultra-compactos)
- ✅ Shaders con loops, ternarios, funciones custom
- ✅ Uso de funciones avanzadas (atan, mix, sign, etc.)
- ✅ Importación directa de código GLSL

**Ventajas:**
- ✅ Syntax highlighting profesional (Monaco Editor)
- ✅ Autocompletado de funciones GLSL
- ✅ Ligaduras de fuente (font ligatures)
- ✅ Minimap de código
- ✅ Pantalla completa
- ✅ Copia con un click

**Ejemplo perfecto:** Plasma compacto
```glsl
void main() {
  vec2 p = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(
    sin(p.x*10.+u_time)+sin(p.y*10.),
    cos(p.x*5.+u_time*2.),
    sin(length(p)*20.-u_time*3.),
    1.
  );
}
```

---

## 🔄 Conversión Inteligente: Código → Nodos

El sistema incluye un botón **"Convertir a Nodos"** que usa IA (Claude) para intentar convertir código GLSL a nodos automáticamente.

### ¿Cómo funciona?

1. Escribes o pegas código GLSL en modo código
2. Haces click en **"Convertir a Nodos"**
3. El backend analiza el código con Claude API
4. Si el shader es simple, genera nodos equivalentes
5. Si el shader es complejo, te sugiere quedarte en modo código

### Limitaciones de la conversión

La conversión **funciona bien** para:
- ✅ Shaders con operaciones básicas (`add`, `multiply`, `sin`, `cos`)
- ✅ Construcción de vectores simple
- ✅ Texturas básicas
- ✅ UV transformations simples

La conversión **falla o es subóptima** para:
- ❌ Code golf con trucos compactos
- ❌ Loops (for, while)
- ❌ Operadores ternarios (`? :`)
- ❌ Swizzling complejo (`color.xxy.yzx`)
- ❌ Funciones que no tienen nodo (`mix`, `atan`, `sign`, etc.)

### Ejemplo de resultado

**Entrada (código simple):**
```glsl
vec2 uv = gl_FragCoord.xy / u_resolution;
vec3 color = vec3(uv.x, uv.y, 0.5);
gl_FragColor = vec4(color, 1.0);
```

**Salida:** ✅ **5 nodos** (UV Input → Vec3 Construct → Fragment Output)

---

**Entrada (code golf complejo):**
```glsl
void main() {
  vec2 p = (gl_FragCoord.xy*2.-u_resolution)/u_resolution.y;
  for(int i=0;i<5;i++)
    p=abs(p)/dot(p,p)-.9;
  gl_FragColor=vec4(p,0,1);
}
```

**Salida:** ⚠️ **Demasiado complejo para nodos** → Usar modo código

---

## 🎨 Galería Educativa con Code Golf

La galería ahora incluye **4 categorías**:

1. **Beginner** (🟢 5-8 nodos) - Gradientes, círculos, patrones básicos
2. **Intermediate** (🟡 10-15 nodos) - Texturas procedurales, efectos animados
3. **Advanced** (🔴 18-20 nodos) - Iluminación, múltiples texturas
4. **Code Golf** (🟣 Modo código) - Plasma, túneles, fractales ultra-compactos

Los ejemplos de **Code Golf** automáticamente:
- Abren en modo código
- Incluyen código GLSL optimizado
- NO tienen representación en nodos

---

## 🚀 Flujo de trabajo recomendado

### Para aprender GLSL:
1. Empieza con **Modo Nodos** y ejemplos Beginner
2. Experimenta conectando nodos y viendo el código generado
3. Gradualmente salta a **Modo Código** para shaders más complejos

### Para shaders profesionales:
1. Empieza en **Modo Código** directamente
2. Pega código de Shadertoy/GLSL Sandbox
3. Prueba la conversión a nodos solo si es simple
4. Quédate en modo código para shaders complejos

### Para code golf:
1. **Usa Modo Código exclusivamente**
2. Aprovecha el syntax highlighting y autocompletado
3. Usa pantalla completa para enfocarte
4. Copia el resultado fácilmente

---

## 🛠️ Tecnologías usadas

- **Monaco Editor** - El mismo editor de VS Code
- **ReactFlow** - Sistema de nodos visual
- **Claude API** - Conversión inteligente GLSL → Nodos
- **Three.js** - Renderizado en tiempo real

---

## 📊 Hallazgos de la validación

Durante el desarrollo del modo híbrido, validamos el sistema existente:

### ✅ **El sistema SÍ funciona correctamente**
- Backend llama a Claude API y obtiene JSON con nodos
- Frontend renderiza nodos reales con ReactFlow
- Funciona perfectamente para shaders simples y educativos

### ❌ **Limitaciones identificadas**
1. Solo **31 tipos de nodos** disponibles (`glsl_import.py:112-130`)
2. Faltan nodos críticos: `mix`, `atan`, `sign`, `exp`, loops, ternarios
3. Code golf usa trucos que no tienen representación en nodos

### 💡 **Solución implementada: Modo Híbrido**
- 🟢 Editor de código para shaders complejos y code golf
- 🟢 Editor de nodos para shaders educativos y visualización
- 🟢 Conversión inteligente entre ambos cuando es posible

---

## 📝 Ejemplos de uso

### Ejemplo 1: Shader simple con nodos

```
1. Modo Nodos
2. Agregar: UV Input → Vec3 Construct → Fragment Output
3. Compilar → Ver código GLSL generado
```

### Ejemplo 2: Importar shader de Shadertoy

```
1. Copiar código de Shadertoy
2. Modo Código
3. Pegar código
4. Ver preview en tiempo real
5. (Opcional) Convertir a Nodos si es simple
```

### Ejemplo 3: Code golf

```
1. Modo Código
2. Escribir shader ultra-compacto
3. Ver preview
4. Copiar resultado
```

---

## 🎓 Recursos de aprendizaje

- **Book of Shaders**: https://thebookofshaders.com/
- **Shadertoy**: https://www.shadertoy.com/
- **GLSL Sandbox**: https://glslsandbox.com/
- **Inigo Quilez Articles**: https://iquilezles.org/articles/

---

## 🤝 Contribuciones

Para expandir los tipos de nodos disponibles, edita:
- `src/backend/core/glsl_import.py` (líneas 112-130)
- Agregar nuevas funciones GLSL como tipos de nodos

---

## 📄 Licencia

Este proyecto es parte de ShaderForge AI.

---

**Creado con ❤️ para la comunidad de shaders**
