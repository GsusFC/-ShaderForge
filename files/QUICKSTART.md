# Quick Start Guide - ShaderForge AI

## 🚀 Get Started in 15 Minutes

Esta guía te llevará desde cero hasta tener el proyecto corriendo localmente.

---

## Prerequisitos

Instala lo siguiente antes de empezar:

```bash
# Node.js 18+
node --version  # Debe ser v18.x o superior

# Python 3.11+
python --version  # Debe ser 3.11.x o superior

# Docker Desktop
docker --version
docker-compose --version

# PostgreSQL (si no usas Docker)
psql --version

# Git
git --version
```

---

## Paso 1: Clonar el Proyecto

```bash
# Crear directorio del proyecto
mkdir shaderforge-ai
cd shaderforge-ai

# Inicializar git
git init

# Crear estructura básica
mkdir -p src/{backend,frontend,scraper,ml}
mkdir -p data/{raw,processed,enriched}
mkdir -p docs tests scripts docker

# Copiar los archivos de documentación que acabas de generar
# (README.md, ARCHITECTURE.md, etc.)
```

---

## Paso 2: Setup Rápido con Docker

### Opción A: Docker Compose (Recomendado)

```bash
# Crear docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: shaderforge
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@shaderforge.ai
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
EOF

# Levantar servicios
docker-compose up -d

# Verificar que todo está corriendo
docker-compose ps
```

---

## Paso 3: Backend Setup

```bash
cd src/backend

# Crear estructura
mkdir -p api/{endpoints} core models db tests

# Crear main.py
cat > main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ShaderForge AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "ShaderForge AI API", "status": "running"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy"}
EOF

# Crear requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.108.0
uvicorn[standard]==0.25.0
python-dotenv==1.0.0
asyncpg==0.29.0
sqlalchemy==2.0.23
aiohttp==3.9.1
anthropic==0.8.0
openai==1.6.1
pinecone-client==3.0.0
redis==5.0.1
pytest==7.4.3
EOF

# Crear virtual environment
python -m venv venv

# Activar venv
# En Linux/Mac:
source venv/bin/activate
# En Windows:
# venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear .env
cat > .env << 'EOF'
APP_NAME=ShaderForge AI
APP_ENV=development
DEBUG=True

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shaderforge
REDIS_URL=redis://localhost:6379

# Añade tus API keys aquí
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
PINECONE_API_KEY=
SHADERTOY_API_KEY=
EOF

# Ejecutar servidor
uvicorn main:app --reload
```

**Verificar**: Abre http://localhost:8000 - deberías ver el mensaje JSON

**API Docs**: http://localhost:8000/docs (Swagger UI automático)

---

## Paso 4: Frontend Setup

```bash
# En otra terminal
cd src/frontend

# Crear proyecto con Vite
npm create vite@latest . -- --template react-ts

# Instalar dependencias base
npm install

# Instalar dependencias adicionales
npm install reactflow three @react-three/fiber @react-three/drei
npm install zustand axios react-router-dom
npm install tailwindcss autoprefixer postcss
npm install lucide-react clsx tailwind-merge

# Setup Tailwind
npx tailwindcss init -p

# Crear estructura
mkdir -p src/{components,hooks,stores,utils,types}

# Modificar src/App.tsx
cat > src/App.tsx << 'EOF'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('Error'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ShaderForge AI</h1>
        <p className="text-xl mb-2">AI-Powered Shader Editor</p>
        <p className="text-sm text-gray-400">
          API Status: <span className="text-green-400">{apiStatus}</span>
        </p>
      </div>
    </div>
  )
}

export default App
EOF

# Modificar tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Añadir Tailwind a CSS
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Ejecutar dev server
npm run dev
```

**Verificar**: Abre http://localhost:5173 - deberías ver "ShaderForge AI"

---

## Paso 5: Primer Feature - Scraper de Shadertoy

```bash
cd src/scraper

# Crear shadertoy.py
cat > shadertoy.py << 'EOF'
import asyncio
import aiohttp
import json
from pathlib import Path

API_KEY = "YOUR_SHADERTOY_KEY"  # Obtener de https://www.shadertoy.com/myapps
BASE_URL = "https://www.shadertoy.com/api/v1"

async def get_shader(session, shader_id):
    url = f"{BASE_URL}/shaders/{shader_id}?key={API_KEY}"
    async with session.get(url) as response:
        if response.status == 200:
            return await response.json()
    return None

async def scrape_shaders(num_shaders=10):
    """Scrape primeros shaders para testing"""
    output_dir = Path("../../data/raw/shadertoy")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # IDs de ejemplo (populares en Shadertoy)
    shader_ids = [
        "MdX3Rr",  # Raymarching Primitives
        "4ssSRl",  # FBM
        "XsX3RB",  # Mandelbrot
        "Ms2SD1",  # Simple Noise
        "lslGzl",  # Voronoi
    ]
    
    async with aiohttp.ClientSession() as session:
        tasks = [get_shader(session, sid) for sid in shader_ids[:num_shaders]]
        shaders = await asyncio.gather(*tasks)
        
        for shader in shaders:
            if shader:
                shader_data = shader.get('Shader')
                if shader_data:
                    shader_id = shader_data['info']['id']
                    filepath = output_dir / f"{shader_id}.json"
                    
                    with open(filepath, 'w') as f:
                        json.dump(shader_data, f, indent=2)
                    
                    print(f"✓ Saved {shader_id}")

if __name__ == "__main__":
    print("Scraping Shadertoy shaders...")
    asyncio.run(scrape_shaders())
    print("Done!")
EOF

# Ejecutar scraper
python shadertoy.py
```

**Verificar**: Deberías tener archivos JSON en `data/raw/shadertoy/`

---

## Paso 6: Primer Endpoint - Search

```bash
cd src/backend

# Crear api/endpoints/search.py
mkdir -p api/endpoints
cat > api/endpoints/search.py << 'EOF'
from fastapi import APIRouter, HTTPException
from typing import List
import json
from pathlib import Path

router = APIRouter(prefix="/api/v1/search", tags=["search"])

def load_shaders():
    """Load shaders from disk"""
    shader_dir = Path("../../data/raw/shadertoy")
    shaders = []
    
    if shader_dir.exists():
        for file in shader_dir.glob("*.json"):
            with open(file) as f:
                data = json.load(f)
                shaders.append({
                    "id": data['info']['id'],
                    "name": data['info']['name'],
                    "description": data['info']['description'],
                    "views": data['info']['viewed'],
                    "likes": data['info']['likes']
                })
    
    return shaders

@router.get("/shaders")
def search_shaders(q: str = "", limit: int = 10):
    """Simple text search"""
    shaders = load_shaders()
    
    if q:
        q_lower = q.lower()
        shaders = [
            s for s in shaders 
            if q_lower in s['name'].lower() or q_lower in s['description'].lower()
        ]
    
    return {
        "query": q,
        "results": shaders[:limit],
        "total": len(shaders)
    }
EOF

# Actualizar main.py
cat > main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import search

app = FastAPI(title="ShaderForge AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)

@app.get("/")
def read_root():
    return {"message": "ShaderForge AI API", "status": "running"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy"}
EOF

# Reiniciar servidor (debería auto-reload)
```

**Verificar**: http://localhost:8000/api/v1/search/shaders?q=noise

---

## Paso 7: Frontend - Conectar con API

```bash
cd src/frontend

# Crear src/components/ShaderSearch.tsx
mkdir -p src/components
cat > src/components/ShaderSearch.tsx << 'EOF'
import { useState } from 'react'

interface Shader {
  id: string
  name: string
  description: string
  views: number
  likes: number
}

export function ShaderSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Shader[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/search/shaders?q=${query}`
      )
      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Shader Search</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search shaders..."
          className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="space-y-4">
        {results.map((shader) => (
          <div key={shader.id} className="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 className="text-xl font-semibold">{shader.name}</h3>
            <p className="text-gray-400 mt-2">{shader.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>👁 {shader.views} views</span>
              <span>❤️ {shader.likes} likes</span>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && query && (
        <p className="text-center text-gray-500">No results found</p>
      )}
    </div>
  )
}
EOF

# Actualizar App.tsx
cat > src/App.tsx << 'EOF'
import { ShaderSearch } from './components/ShaderSearch'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ShaderSearch />
    </div>
  )
}

export default App
EOF
```

**Verificar**: Abre http://localhost:5173 y busca "noise"

---

## ✅ Checkpoint - Qué Tienes Ahora

1. ✅ Backend API corriendo (FastAPI)
2. ✅ Frontend corriendo (React + Vite)
3. ✅ Base de datos (PostgreSQL)
4. ✅ Scraper funcional (Shadertoy)
5. ✅ Endpoint de búsqueda
6. ✅ UI de búsqueda

---

## 🎯 Próximos Pasos Inmediatos

### Día 1-2: Expandir Scraper
```bash
# Modificar scraper para obtener 100 shaders
# Implementar rate limiting
# Agregar retry logic
```

### Día 3-4: Procesamiento de Datos
```bash
# Crear shader processor
# Extraer técnicas y metadata
# Almacenar en PostgreSQL
```

### Día 5-7: Embeddings Básicos
```bash
# Integrar OpenAI API
# Generar embeddings
# Setup Pinecone
```

### Semana 2: Generación con IA
```bash
# Integrar Claude API
# Implementar prompt engineering
# Crear endpoint de generación
```

---

## 🔧 Troubleshooting Rápido

**Error: Puerto 8000 en uso**
```bash
lsof -ti:8000 | xargs kill -9
```

**Error: Base de datos no conecta**
```bash
docker-compose restart postgres
```

**Error: npm install falla**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error: Python module not found**
```bash
pip install -r requirements.txt --force-reinstall
```

---

## 📚 Recursos Útiles

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **ReactFlow**: https://reactflow.dev/
- **Three.js**: https://threejs.org/
- **Shadertoy API**: https://www.shadertoy.com/howto

---

## 🎨 Comandos Útiles

```bash
# Ver logs de Docker
docker-compose logs -f postgres

# Reiniciar todo
docker-compose restart

# Ver estado de servicios
docker-compose ps

# Limpiar todo y empezar de cero
docker-compose down -v

# Ejecutar tests
pytest  # Backend
npm test  # Frontend

# Ver estructura del proyecto
tree -L 3
```

---

## 🚀 Estás Listo!

Ahora tienes una base sólida para empezar a desarrollar. Sigue el [ROADMAP.md](ROADMAP.md) para los próximos pasos.

**Happy coding! 🎉**
