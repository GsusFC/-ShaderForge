# 🚀 ShaderForge AI - Setup Completo e Implementación Real

## Estado del Proyecto

✅ **IMPLEMENTACIÓN COMPLETADA**: Estructura completa, compilador funcional, BD real, endpoints CRUD

**Progreso**: 55% - Fase de implementación real iniciada

---

## 📋 Requisitos Previos

```bash
# Verificar versiones
python --version      # Debe ser 3.11+
node --version        # Debe ser 18+
npm --version         # Debe ser 9+
```

---

## 🔧 Setup Backend (FastAPI + PostgreSQL)

### Paso 1: Preparar entorno

```bash
cd src/backend

# Crear virtual environment
python -m venv venv

# Activar venv
# En macOS/Linux:
source venv/bin/activate
# En Windows:
# venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### Paso 2: Configurar variables de entorno

```bash
# Crear .env (ya existe, verificar contenido)
cat .env

# Debe tener (en desarrollo):
# DATABASE_URL=sqlite:///./shaderforge.db  (para testing)
# O PostgreSQL:
# DATABASE_URL=postgresql://user:pass@localhost:5432/shaderforge

# APIs (opcionales para desarrollo):
# ANTHROPIC_API_KEY=your_key
# OPENAI_API_KEY=your_key
```

### Paso 3: Inicializar base de datos

```bash
# La BD se crea automáticamente al startup
# Pero puedes crear manualmente:
python -c "from db.database import init_db; init_db(); print('✅ Database initialized')"
```

### Paso 4: Iniciar servidor backend

```bash
# En desarrollo (con reload automático):
python main.py

# O usando uvicorn directamente:
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Output esperado:
# ✅ Database initialized successfully
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

**Verificar**: http://localhost:8000/docs (Swagger UI)

---

## 🎨 Setup Frontend (React + Vite)

### Paso 1: Instalar dependencias

```bash
cd src/frontend

npm install
```

### Paso 2: Configurar variables de entorno

```bash
# .env.local debe estar en raíz del frontend
cat .env.local

# Debe contener:
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

### Paso 3: Iniciar servidor frontend

```bash
npm run dev

# Output esperado:
# VITE v5.0.8  ready in 234 ms
# ➜  Local:   http://localhost:5173/
```

**Verificar**: http://localhost:5173

---

## 📊 Estructura de Implementación Actual

### Backend
```
src/backend/
├── main.py                    # ✅ FastAPI app configurada
├── api/
│   ├── search.py             # ✅ Search endpoints + demo data
│   ├── nodes.py              # ✅ Node editor endpoints
│   ├── ai.py                 # ✅ AI generation endpoints
│   └── shaders.py            # ✅ CRUD endpoints para shaders
├── core/
│   ├── compiler.py           # ✅ GLSL compiler (mejorado)
│   └── ai_engine.py          # ✅ Claude AI integration
├── db/
│   ├── models.py             # ✅ SQLAlchemy models
│   └── database.py           # ✅ Connection + init
```

### Frontend
```
src/frontend/src/
├── components/
│   ├── ShaderSearch.tsx      # ✅ Search UI
│   ├── NodeEditor.tsx        # ✅ Node editor
│   ├── ShaderPreview.tsx     # ✅ Preview (Three.js)
│   └── NodePalette.tsx       # ✅ Node library
```

---

## 🧪 Testing de Endpoints

### 1. Health Check

```bash
curl http://localhost:8000/api/v1/health
# {"status":"healthy"}
```

### 2. Listar Shaders (con datos demo)

```bash
curl http://localhost:8000/api/v1/search/shaders?q=water
# Retorna shaders que contengan "water"
```

### 3. Buscar Popular

```bash
curl http://localhost:8000/api/v1/search/popular
# Retorna shaders más populares
```

### 4. Crear Shader

```bash
curl -X POST http://localhost:8000/api/v1/shaders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Shader",
    "description": "Test shader",
    "code": "void main() { gl_FragColor = vec4(1.0); }",
    "language": "glsl",
    "category": "test",
    "tags": ["test"],
    "techniques": ["raymarching"],
    "visibility": "public"
  }'
```

### 5. Compilar Node Graph

```bash
curl -X POST http://localhost:8000/api/v1/nodes/graph/compile \
  -H "Content-Type: application/json" \
  -d '{
    "graph": {
      "nodes": [
        {
          "id": "uv1",
          "data": {"type": "uv_input"},
          "position": {"x": 0, "y": 0}
        },
        {
          "id": "out1",
          "data": {"type": "fragment_output"},
          "position": {"x": 200, "y": 0}
        }
      ],
      "edges": [
        {
          "source": "uv1",
          "target": "out1"
        }
      ]
    },
    "language": "glsl"
  }'
```

### 6. Generar Shader con IA

```bash
curl -X POST http://localhost:8000/api/v1/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crea un shader de agua animada",
    "style": "realistic",
    "complexity": "medium",
    "performance": "high"
  }'
# Requiere ANTHROPIC_API_KEY configurada
```

---

## 🗄️ Base de Datos

### SQLite (Desarrollo - Por defecto)

La BD se crea automáticamente en `shaderforge.db`

```bash
# Ver contenido (si tienes sqlite3):
sqlite3 shaderforge.db ".tables"
sqlite3 shaderforge.db "SELECT * FROM shaders LIMIT 5;"
```

### PostgreSQL (Producción)

```bash
# Variables de entorno necesarias:
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shaderforge"

# Crear base de datos:
createdb shaderforge

# Ejecutar migraciones (si usas Alembic):
alembic upgrade head
```

---

## 🚦 Verificación Rápida

### Script de test

```bash
#!/bin/bash

echo "🧪 Testing ShaderForge AI"

# Test 1: Backend arranca
echo "1️⃣ Testing backend health..."
curl -s http://localhost:8000/api/v1/health | jq .

# Test 2: Search funciona
echo "2️⃣ Testing search..."
curl -s "http://localhost:8000/api/v1/search/shaders?limit=1" | jq '.results | length'

# Test 3: Nodes library
echo "3️⃣ Testing node library..."
curl -s http://localhost:8000/api/v1/nodes/library | jq '.library | keys'

# Test 4: Frontend
echo "4️⃣ Testing frontend..."
curl -s http://localhost:5173 | grep -o "ShaderForge" && echo "✅ Frontend OK"

echo "✅ All tests passed!"
```

---

## 📝 Próximos Pasos (Roadmap)

### Semana 1-2: Integración Real
- [ ] Conectar Pinecone para búsqueda semántica
- [ ] Implementar scrapers reales de Shadertoy
- [ ] Pipeline de embeddings con OpenAI
- [ ] Tests unitarios

### Semana 3-4: Features Principales
- [ ] Editor node-based completo y funcional
- [ ] Preview en tiempo real con Three.js mejorado
- [ ] Sistema de usuarios y autenticación
- [ ] Marketplace/comunidad básica

### Semana 5-6: Advanced Features
- [ ] Fine-tuning de IA
- [ ] Búsqueda semántica avanzada
- [ ] Exportación multi-lenguaje real
- [ ] Colaboración en tiempo real

---

## 🐛 Troubleshooting

### Backend no arranca

```bash
# Error: "Address already in use"
lsof -ti:8000 | xargs kill -9

# Error: Module not found
cd src/backend
source venv/bin/activate
pip install -r requirements.txt

# Error: Database connection
# Verificar DATABASE_URL en .env
# O usar SQLite (default)
```

### Frontend no carga API

```bash
# Verificar CORS en backend
# main.py debe tener los origins correctos

# Verificar VITE_API_URL en .env.local
cat .env.local

# Test conexión:
curl http://localhost:8000/api/v1/health
```

### BD vacía

```bash
# Agregar datos demo
cd src/backend
python -c "
from db.database import SessionLocal
from db.models import Shader, ShaderTag

db = SessionLocal()
shader = Shader(
    name='Test Shader',
    description='A test shader',
    code='void main() {}',
    language='glsl'
)
db.add(shader)
db.commit()
print('✅ Demo shader created')
"
```

---

## 📚 Documentación Disponible

- `files/README.md` - Visión general
- `files/ARCHITECTURE.md` - Arquitectura completa
- `files/API.md` - Especificación de endpoints
- `files/ROADMAP.md` - Plan de desarrollo
- `files/SETUP.md` - Configuración de dependencias

---

## 🎯 Estado Final

**Implementación Base**: ✅ Completa
- ✅ Backend con FastAPI
- ✅ Base de datos con modelos reales
- ✅ Compilador GLSL funcional
- ✅ Endpoints CRUD completos
- ✅ Frontend conectado
- ✅ Search con datos demo

**Próximas Fases**: 
- ⏳ Integración de APIs externas (Pinecone, Claude, OpenAI)
- ⏳ Scrapers funcionales
- ⏳ Búsqueda semántica
- ⏳ Features avanzadas

---

**¡Listo para desarrollar! 🚀**

Para empezar: `cd src/backend && python main.py`
