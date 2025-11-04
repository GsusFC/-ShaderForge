# ShaderForge AI

> Sistema de creación de shaders con IA y editor node-based

## 🎯 Visión del Proyecto

ShaderForge AI es una plataforma que combina inteligencia artificial con un editor visual node-based para democratizar la creación de shaders. El sistema aprende de repositorios masivos como Shadertoy, GLSL Sandbox y GitHub para generar shaders personalizados mediante lenguaje natural.

## ✨ Características Principales

- **Generación con IA**: Describe en lenguaje natural y obtén shaders optimizados
- **Editor Node-Based**: Interfaz visual intuitiva inspirada en Weavy/Shader Graph
- **Multi-plataforma**: Exporta a GLSL, HLSL, Metal, WGSL
- **Búsqueda Semántica**: Encuentra shaders similares en base de datos masiva
- **Aprendizaje Continuo**: Mejora con cada shader creado

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Web UI)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Node Editor  │  │ Code Preview │  │ Live Preview │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                     API LAYER (FastAPI)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  AI Engine   │  │  Converter   │  │   Storage    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Vector DB    │  │  Shader DB   │  │  LLM Model   │  │
│  │ (Pinecone)   │  │ (PostgreSQL) │  │  (Claude)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
shaderforge-ai/
├── docs/                      # Documentación técnica
│   ├── ARCHITECTURE.md        # Arquitectura detallada
│   ├── API.md                 # Especificación API
│   ├── DATA_PIPELINE.md       # Pipeline de datos
│   └── DEPLOYMENT.md          # Guía de despliegue
├── src/
│   ├── frontend/              # React + Three.js
│   │   ├── components/
│   │   │   ├── NodeEditor/
│   │   │   ├── ShaderPreview/
│   │   │   └── AIAssistant/
│   │   └── utils/
│   ├── backend/               # FastAPI
│   │   ├── api/
│   │   │   ├── shaders.py
│   │   │   ├── ai.py
│   │   │   └── nodes.py
│   │   ├── core/
│   │   │   ├── ai_engine.py
│   │   │   ├── converter.py
│   │   │   └── parser.py
│   │   └── models/
│   ├── scraper/               # Data collection
│   │   ├── shadertoy.py
│   │   ├── github.py
│   │   └── processors/
│   └── ml/                    # Machine Learning
│       ├── embeddings.py
│       ├── fine_tune.py
│       └── vector_search.py
├── data/
│   ├── raw/                   # Shaders sin procesar
│   ├── processed/             # Shaders procesados
│   └── embeddings/            # Vector embeddings
├── tests/
├── docker/
├── scripts/
├── .env.example
├── requirements.txt
├── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Node Editor**: ReactFlow
- **3D Preview**: Three.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **AI/LLM**: Anthropic Claude API
- **Vector DB**: Pinecone / Weaviate
- **Database**: PostgreSQL + SQLAlchemy
- **Cache**: Redis

### ML/AI
- **Embeddings**: OpenAI text-embedding-3
- **Fine-tuning**: Claude / GPT-4
- **Vector Search**: FAISS / Pinecone

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend) + Railway (Backend)
- **Monitoring**: Sentry + LogRocket

## 📊 Pipeline de Datos

### Fase 1: Recolección (Data Collection)
```python
Sources:
├── Shadertoy API (~60,000 shaders)
├── GitHub Repos (Open-Shaders, LYGIA)
├── GLSL Sandbox
└── Tutoriales (Book of Shaders, IQ)

Output: data/raw/
```

### Fase 2: Procesamiento (Data Processing)
```python
Pipeline:
├── Parse GLSL/HLSL code
├── Extract functions & techniques
├── Categorize by type
├── Generate metadata
└── Create embeddings

Output: data/processed/
```

### Fase 3: Indexación (Vector Indexing)
```python
Vector DB:
├── Text embeddings (descriptions)
├── Code embeddings (shaders)
└── Similarity search index

Output: Pinecone/Weaviate
```

## 🎯 Roadmap

### Fase 1: MVP (Mes 1-2)
- [ ] Setup proyecto base
- [ ] Scraper de Shadertoy
- [ ] Pipeline de procesamiento básico
- [ ] API REST básica
- [ ] Editor node-based simple
- [ ] Integración Claude API
- [ ] Preview shader en tiempo real

### Fase 2: Core Features (Mes 3-4)
- [ ] Sistema de embeddings completo
- [ ] Búsqueda semántica
- [ ] Conversión GLSL ↔ Node Graph
- [ ] Exportar múltiples formatos
- [ ] Sistema de templates
- [ ] Historial y versiones

### Fase 3: Advanced AI (Mes 5-6)
- [ ] Fine-tuning modelo propio
- [ ] Generación multi-paso
- [ ] Optimización automática
- [ ] Sugerencias contextuales
- [ ] Code completion en nodes

### Fase 4: Platform (Mes 7-8)
- [ ] Sistema de usuarios
- [ ] Compartir shaders
- [ ] Marketplace
- [ ] Colaboración en tiempo real
- [ ] Plugins para Unity/Unreal

## 🛠️ Quick Start

### Prerequisitos
```bash
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
```

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/shaderforge-ai.git
cd shaderforge-ai

# Setup Backend
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configurar variables

# Setup Frontend
cd ../frontend
npm install
cp .env.example .env.local

# Levantar con Docker
cd ../..
docker-compose up -d
```

### Desarrollo

```bash
# Terminal 1: Backend
cd src/backend
uvicorn main:app --reload

# Terminal 2: Frontend
cd src/frontend
npm run dev

# Terminal 3: Scraper (opcional)
cd src/scraper
python shadertoy_scraper.py
```

## 🧪 Testing

```bash
# Backend tests
cd src/backend
pytest

# Frontend tests
cd src/frontend
npm test

# E2E tests
npm run test:e2e
```

## 📝 Variables de Entorno

```env
# Backend (.env)
ANTHROPIC_API_KEY=your_key
PINECONE_API_KEY=your_key
DATABASE_URL=postgresql://user:pass@localhost/shaderforge
REDIS_URL=redis://localhost:6379

# Frontend (.env.local)
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## 🤝 Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guidelines.

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Arquitectura**: [Tu nombre]
- **AI/ML**: [Contributor]
- **Frontend**: [Contributor]

## 🔗 Enlaces

- [Documentación Completa](./docs/)
- [API Documentation](https://api.shaderforge.ai/docs)
- [Demo](https://shaderforge.ai)
- [Discord Community](https://discord.gg/shaderforge)

## 📞 Contacto

- **Email**: hello@shaderforge.ai
- **Twitter**: @shaderforge_ai
- **Discord**: [Join Server](https://discord.gg/shaderforge)

---

**Status**: 🚧 En desarrollo activo

**Última actualización**: Noviembre 2025
