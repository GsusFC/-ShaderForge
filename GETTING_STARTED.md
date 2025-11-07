# 🚀 Comenzar con ShaderForge AI

Bienvenido a **ShaderForge AI**. Esta guía te ayudará a levantar el proyecto localmente en menos de 15 minutos.

## 📋 Prerequisitos

Antes de empezar, asegúrate de tener instalado:

```bash
# Node.js 18+
node --version

# Python 3.11+
python --version

# Docker & Docker Compose
docker --version
docker-compose --version
```

## 🎯 Quick Start (5 minutos)

### Paso 1: Levantar Servicios con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que todo está corriendo
docker-compose ps

# Logs de PostgreSQL
docker-compose logs postgres
```

**Lo que se levanta:**
- ✅ PostgreSQL (puerto 5432)
- ✅ Redis (puerto 6379)
- ✅ PgAdmin (puerto 5050)

### Paso 2: Configurar Backend

```bash
cd src/backend

# Crear virtual environment
python -m venv venv

# Activar (macOS/Linux)
source venv/bin/activate

# Activar (Windows)
# venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn main:app --reload
```

Backend corriendo en: http://localhost:8000

**Endpoints disponibles:**
- 🏥 Health: http://localhost:8000/api/v1/health
- 📚 Swagger Docs: http://localhost:8000/docs
- 🔍 Search Shaders: http://localhost:8000/api/v1/search/shaders

### Paso 3: Configurar Frontend

En otra terminal:

```bash
cd src/frontend

# Instalar dependencias
npm install

# Ejecutar dev server
npm run dev
```

Frontend corriendo en: http://localhost:5173

## 🧪 Testear la Integración

Una vez que todo está corriendo, prueba esto:

### 1. Verificar Backend
```bash
curl http://localhost:8000/api/v1/health
# Deberías ver: {"status": "healthy"}
```

### 2. Buscar Shaders
```bash
curl "http://localhost:8000/api/v1/search/shaders?q=noise&limit=5"
```

### 3. Obtener Estadísticas
```bash
curl http://localhost:8000/api/v1/search/stats
```

### 4. Visitar Frontend
Abre http://localhost:5173 en tu navegador

## 📁 Estructura Creada

```
shaderforge-ai/
├── docker-compose.yml          # Servicios (PostgreSQL, Redis, PgAdmin)
├── .env.example                # Variables de entorno template
├── src/
│   ├── backend/
│   │   ├── main.py             # FastAPI app principal
│   │   ├── requirements.txt    # Dependencias Python
│   │   ├── .env                # Variables de entorno local
│   │   └── api/
│   │       ├── __init__.py
│   │       └── search.py       # Endpoints de búsqueda
│   ├── frontend/
│   │   ├── package.json        # Dependencias Node
│   │   ├── vite.config.ts      # Configuración Vite
│   │   ├── tsconfig.json       # Configuración TypeScript
│   │   └── .env.local          # Variables de entorno local
│   └── scraper/
│       └── shadertoy.py        # Scraper de Shadertoy
└── data/
    ├── raw/                    # Datos sin procesar
    ├── processed/              # Datos procesados
    └── enriched/               # Datos enriquecidos
```

## 🔧 Comandos Útiles

### Backend
```bash
# Ver logs
docker-compose logs -f postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver estructura del proyecto
tree -L 3 -I node_modules
```

### Frontend
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Build para producción
npm run build

# Linting
npm run lint
```

### Scraper
```bash
cd src/scraper
python shadertoy.py
```

### Testing
```bash
# Backend tests
cd src/backend
pytest test_compiler.py -v

# Frontend tests
cd src/frontend
npm run test

# E2E tests with Chrome DevTools MCP
cd tests/e2e
npm run test:all

# Ver guía completa de testing
cat tests/TESTING_GUIDE.md
```

## 📝 Próximos Pasos

1. **Obtener API Keys** (opcional para testing completo):
   - Shadertoy: https://www.shadertoy.com/myapps
   - Anthropic: https://console.anthropic.com
   - OpenAI: https://platform.openai.com
   - Pinecone: https://www.pinecone.io

2. **Actualizar .env** con tus keys:
   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

3. **Explorar la documentación**:
   - [README.md](./files/README.md) - Visión general
   - [ARCHITECTURE.md](./files/ARCHITECTURE.md) - Arquitectura técnica
   - [API.md](./files/API.md) - Especificación de APIs
   - [ROADMAP.md](./files/ROADMAP.md) - Plan de desarrollo
   - [TESTING_GUIDE.md](./tests/TESTING_GUIDE.md) - Guía de testing completa

4. **Primeras features a implementar**:
   - [ ] Scraper de Shadertoy masivo
   - [ ] Pipeline de procesamiento de shaders
   - [ ] Generación con IA
   - [ ] Node Editor básico

## 🆘 Troubleshooting

### Puerto en uso
```bash
# Encontrar proceso usando puerto 8000
lsof -ti:8000 | xargs kill -9

# Encontrar proceso usando puerto 5173
lsof -ti:5173 | xargs kill -9
```

### PostgreSQL no conecta
```bash
# Reiniciar y ver logs
docker-compose restart postgres
docker-compose logs postgres
```

### npm install falla
```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Virtual environment problems
```bash
# Recrear venv
rm -rf src/backend/venv
python -m venv src/backend/venv
source src/backend/venv/bin/activate  # macOS/Linux
pip install -r src/backend/requirements.txt
```

## 📊 API Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Info de la API |
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/search/shaders` | Buscar shaders |
| `GET` | `/api/v1/search/popular` | Shaders populares |
| `GET` | `/api/v1/search/stats` | Estadísticas |
| `GET` | `/docs` | Swagger UI |

## 📞 Ayuda

- **Documentación**: Ver carpeta `files/` para docs completas
- **Issues**: Crear issue en GitHub
- **Discord**: [Únete al servidor](https://discord.gg/shaderforge)

---

**¡Estás listo para desarrollar!** 🎉

Próximo paso: Lee [ARCHITECTURE.md](./files/ARCHITECTURE.md) para entender la arquitectura del proyecto.
