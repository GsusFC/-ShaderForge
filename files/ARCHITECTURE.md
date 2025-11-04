# Arquitectura de ShaderForge AI

## Visión General

ShaderForge AI está diseñado como una aplicación web moderna con arquitectura de microservicios, separando claramente las responsabilidades entre frontend, backend, y servicios de IA/ML.

## Componentes Principales

### 1. Frontend Layer

#### 1.1 Node Editor
**Responsabilidad**: Editor visual drag-and-drop para crear grafos de shaders

**Tecnologías**:
- ReactFlow para el grafo visual
- Custom nodes para operaciones shader-specific
- Real-time validation

**Flujo**:
```
Usuario arrastra nodo → Valida conexión → Actualiza grafo → 
→ Genera código → Preview en tiempo real
```

**Nodos Principales**:
```typescript
interface ShaderNode {
  id: string;
  type: 'input' | 'operation' | 'output';
  category: 'math' | 'texture' | 'color' | 'noise' | 'custom';
  inputs: Port[];
  outputs: Port[];
  parameters: Parameter[];
  glslFunction?: string;
}

// Ejemplos de nodos:
- Math: Add, Multiply, Lerp, Clamp
- Texture: Sample, UV Transform
- Noise: Perlin, Simplex, Voronoi
- Color: RGB to HSV, Gradient
- SDF: Sphere, Box, Boolean Operations
```

#### 1.2 AI Assistant Panel
**Responsabilidad**: Interfaz para interactuar con IA

**Features**:
- Chat conversacional
- Generación de shaders por descripción
- Sugerencias contextuales
- Explicación de nodos

#### 1.3 Shader Preview
**Responsabilidad**: Renderizado en tiempo real del shader

**Tecnologías**:
- Three.js para WebGL
- Hot reload del shader
- Stats display (FPS, compile time)

### 2. Backend Layer

#### 2.1 API Gateway (FastAPI)
**Endpoints principales**:

```python
# Shaders
POST   /api/v1/shaders/generate        # Generar shader con IA
POST   /api/v1/shaders/convert         # Convertir código a nodes
GET    /api/v1/shaders/{id}            # Obtener shader
PUT    /api/v1/shaders/{id}            # Actualizar shader
DELETE /api/v1/shaders/{id}            # Eliminar shader

# AI
POST   /api/v1/ai/complete             # Chat con IA
POST   /api/v1/ai/explain              # Explicar código
POST   /api/v1/ai/optimize             # Optimizar shader

# Search
GET    /api/v1/search/semantic         # Búsqueda semántica
GET    /api/v1/search/similar          # Shaders similares

# Nodes
GET    /api/v1/nodes/library           # Librería de nodos
POST   /api/v1/nodes/graph/compile     # Compilar grafo a código

# Export
POST   /api/v1/export/glsl             # Export a GLSL
POST   /api/v1/export/hlsl             # Export a HLSL
POST   /api/v1/export/unity            # Export a Unity
POST   /api/v1/export/unreal           # Export a Unreal
```

#### 2.2 AI Engine

**Core Module**: `src/backend/core/ai_engine.py`

```python
class AIEngine:
    def __init__(self):
        self.llm = AnthropicClient()
        self.embeddings = OpenAIEmbeddings()
        self.vector_db = PineconeClient()
    
    async def generate_shader(
        self, 
        prompt: str,
        style: str = "realistic",
        complexity: str = "medium"
    ) -> ShaderCode:
        """
        Pipeline:
        1. Analizar prompt
        2. Buscar shaders similares en vector DB
        3. Generar código con LLM usando ejemplos
        4. Validar sintaxis
        5. Optimizar
        """
        
    async def explain_code(self, code: str) -> Explanation:
        """Explica un shader línea por línea"""
        
    async def optimize_shader(self, code: str) -> OptimizedShader:
        """Optimiza shader manteniendo comportamiento"""
```

**Prompting Strategy**:
```python
SHADER_GENERATION_PROMPT = """
Eres un experto en shaders GLSL. Genera un shader basado en:

Descripción del usuario: {user_prompt}
Estilo: {style}
Complejidad: {complexity}

Ejemplos similares:
{similar_shaders}

IMPORTANTE:
- Usa solo funciones GLSL estándar
- Optimiza para rendimiento
- Comenta código complejo
- Retorna SOLO código válido GLSL

Shader:
```glsl
// Tu código aquí
```
"""
```

#### 2.3 Code Converter

**Core Module**: `src/backend/core/converter.py`

```python
class ShaderConverter:
    """Convierte entre diferentes formatos"""
    
    def glsl_to_node_graph(self, code: str) -> NodeGraph:
        """
        Parser GLSL → AST → Node Graph
        
        Steps:
        1. Tokenize código GLSL
        2. Build AST
        3. Identificar operaciones
        4. Mapear a nodos
        5. Conectar inputs/outputs
        """
        
    def node_graph_to_glsl(self, graph: NodeGraph) -> str:
        """
        Node Graph → GLSL Code
        
        Steps:
        1. Topological sort de nodos
        2. Generar funciones por nodo
        3. Conectar variables
        4. Optimizar código
        """
        
    def translate_language(
        self, 
        code: str, 
        from_lang: str, 
        to_lang: str
    ) -> str:
        """Traduce GLSL ↔ HLSL ↔ Metal ↔ WGSL"""
```

**Translation Map**:
```python
GLSL_TO_HLSL = {
    'vec2': 'float2',
    'vec3': 'float3',
    'vec4': 'float4',
    'mat3': 'float3x3',
    'mat4': 'float4x4',
    'mix': 'lerp',
    'fract': 'frac',
    'texture': 'tex2D',
    # ... más mappings
}
```

#### 2.4 Parser System

**Core Module**: `src/backend/core/parser.py`

```python
class GLSLParser:
    """Parse GLSL code into structured format"""
    
    def parse(self, code: str) -> ShaderAST:
        """
        Tokenize → Parse → AST
        """
        
    def extract_functions(self, ast: ShaderAST) -> List[Function]:
        """Extrae todas las funciones del shader"""
        
    def extract_uniforms(self, ast: ShaderAST) -> List[Uniform]:
        """Extrae uniforms (parámetros externos)"""
        
    def extract_dependencies(self, ast: ShaderAST) -> Graph:
        """Crea grafo de dependencias entre funciones"""
```

### 3. Data Layer

#### 3.1 PostgreSQL Schema

```sql
-- Tabla principal de shaders
CREATE TABLE shaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL, -- glsl, hlsl, metal
    category VARCHAR(50),
    tags TEXT[],
    source VARCHAR(100), -- shadertoy, github, user
    source_url TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    author VARCHAR(100),
    license VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Índices para búsqueda
CREATE INDEX idx_shaders_category ON shaders(category);
CREATE INDEX idx_shaders_tags ON shaders USING GIN(tags);
CREATE INDEX idx_shaders_created ON shaders(created_at DESC);

-- Tabla de node graphs
CREATE TABLE node_graphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shader_id UUID REFERENCES shaders(id),
    graph_data JSONB NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de embeddings
CREATE TABLE shader_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shader_id UUID REFERENCES shaders(id),
    embedding_type VARCHAR(50), -- text, code
    embedding VECTOR(1536), -- pgvector extension
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para similarity search
CREATE INDEX idx_embeddings_vector 
ON shader_embeddings 
USING ivfflat (embedding vector_cosine_ops);

-- Tabla de usuarios (futuro)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de shaders guardados por usuarios
CREATE TABLE user_shaders (
    user_id UUID REFERENCES users(id),
    shader_id UUID REFERENCES shaders(id),
    saved_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, shader_id)
);
```

#### 3.2 Vector Database (Pinecone)

**Index Structure**:
```python
# Configuración Pinecone
index_config = {
    'name': 'shaderforge-embeddings',
    'dimension': 1536,  # OpenAI embedding dimension
    'metric': 'cosine',
    'pods': 1,
    'pod_type': 'p1.x1'
}

# Metadata almacenada con cada vector
vector_metadata = {
    'shader_id': 'uuid',
    'description': 'texto descriptivo',
    'category': 'raymarching',
    'tags': ['water', '3d', 'procedural'],
    'source': 'shadertoy',
    'complexity': 'medium',
    'performance': 'high'
}
```

**Búsqueda semántica**:
```python
async def semantic_search(
    query: str, 
    top_k: int = 10,
    filters: dict = None
) -> List[Shader]:
    """
    1. Embed query text
    2. Search in Pinecone
    3. Fetch full shader data from PostgreSQL
    4. Return ranked results
    """
    # Embed query
    query_vector = embeddings.embed(query)
    
    # Search
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True,
        filter=filters  # e.g., {'category': 'water'}
    )
    
    # Fetch full data
    shader_ids = [r['id'] for r in results['matches']]
    shaders = await db.get_shaders(shader_ids)
    
    return shaders
```

### 4. ML Pipeline

#### 4.1 Data Collection

**Scraper**: `src/scraper/shadertoy.py`

```python
class ShadertoyAPI:
    """API wrapper para Shadertoy"""
    
    BASE_URL = "https://www.shadertoy.com/api/v1"
    
    async def get_shader(self, shader_id: str) -> dict:
        """Obtiene un shader por ID"""
        
    async def search_shaders(
        self, 
        query: str = "",
        sort: str = "popular",
        limit: int = 100
    ) -> List[dict]:
        """Busca shaders"""
        
    async def scrape_all(
        self,
        batch_size: int = 100,
        max_shaders: int = 10000
    ):
        """
        Scraping masivo con rate limiting
        
        Rate limit: ~100 requests/hour
        Estrategia: 
        - Batch processing
        - Exponential backoff
        - Persistencia incremental
        """
```

#### 4.2 Processing Pipeline

**Processor**: `src/scraper/processors/shader_processor.py`

```python
class ShaderProcessor:
    """Procesa shaders raw"""
    
    def process(self, raw_shader: dict) -> ProcessedShader:
        """
        Pipeline:
        1. Parse GLSL code
        2. Extract metadata
        3. Categorize
        4. Generate embeddings
        5. Store
        """
        
    def extract_techniques(self, code: str) -> List[str]:
        """
        Detecta técnicas usadas:
        - Raymarching
        - SDFs
        - Noise functions
        - Post-processing
        - etc.
        """
        
    def categorize(self, shader: dict) -> str:
        """
        Categoriza automáticamente:
        - 2D Effects
        - 3D Raymarching
        - Fractals
        - Simulations
        - Post-processing
        """
```

#### 4.3 Embeddings Generation

**Embeddings**: `src/ml/embeddings.py`

```python
class EmbeddingGenerator:
    """Genera embeddings para búsqueda semántica"""
    
    def __init__(self):
        self.text_model = OpenAIEmbeddings("text-embedding-3-large")
        self.code_model = CodeEmbeddings()  # Custom o CodeBERT
    
    async def embed_description(self, text: str) -> List[float]:
        """Embed texto descriptivo"""
        return await self.text_model.embed(text)
    
    async def embed_code(self, code: str) -> List[float]:
        """
        Embed código GLSL
        
        Estrategias:
        1. Simple: Embeddings de texto del código
        2. Advanced: Model específico para código (CodeBERT)
        3. Hybrid: Combinar estructura AST + texto
        """
        return await self.code_model.embed(code)
    
    async def embed_shader(self, shader: Shader) -> dict:
        """
        Genera múltiples embeddings:
        - Description embedding
        - Code embedding
        - Combined embedding
        """
        return {
            'text': await self.embed_description(shader.description),
            'code': await self.embed_code(shader.code),
            'combined': self.combine_embeddings(...)
        }
```

## Flujos de Usuario

### Flujo 1: Generar Shader con IA

```
1. Usuario escribe: "water caustics effect with realistic refraction"
   
2. Frontend → POST /api/v1/ai/complete
   
3. Backend:
   a. Analiza prompt
   b. Busca ejemplos similares en Vector DB
   c. Construye prompt con ejemplos
   d. Llama a Claude API
   e. Valida código generado
   f. Retorna shader
   
4. Frontend:
   a. Muestra código
   b. Convierte a node graph
   c. Renderiza preview
   
5. Usuario puede:
   - Editar nodes
   - Ajustar parámetros
   - Regenerar con modificaciones
```

### Flujo 2: Búsqueda Semántica

```
1. Usuario busca: "glass material"
   
2. Frontend → GET /api/v1/search/semantic?q=glass+material
   
3. Backend:
   a. Embed query
   b. Search en Pinecone (top 20)
   c. Fetch full data from PostgreSQL
   d. Rank by relevance + popularity
   e. Return results
   
4. Frontend muestra grid de shaders
   
5. Usuario clickea shader → Preview + Edit
```

### Flujo 3: Código → Node Graph

```
1. Usuario pega código GLSL
   
2. Frontend → POST /api/v1/shaders/convert
   
3. Backend (Converter):
   a. Parse GLSL → AST
   b. Identify operations
   c. Map to nodes
   d. Create connections
   e. Position nodes (layout algorithm)
   f. Return node graph JSON
   
4. Frontend renderiza graph en ReactFlow
```

## Escalabilidad

### Caching Strategy

```python
# Redis cache layers
- Shader metadata: 1 hora
- Search results: 30 minutos  
- Embeddings: Permanent
- API responses: 5 minutos
```

### Rate Limiting

```python
# Por usuario/IP
- AI generation: 10 requests/minute
- API calls: 100 requests/minute
- Search: 30 requests/minute
```

### Database Optimization

```sql
-- Partitioning por fecha
CREATE TABLE shaders_2025_01 PARTITION OF shaders
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Read replicas para búsquedas
-- Write master para updates
```

## Seguridad

### API Authentication

```python
# JWT tokens
# OAuth2 para third-party integrations
# API keys para programmatic access
```

### Rate Limiting & DDoS Protection

```python
# CloudFlare en frontend
# Redis rate limiting en backend
# WAF rules
```

### Data Privacy

```python
# Encriptación en reposo (PostgreSQL)
# HTTPS obligatorio
# No almacenar API keys de usuarios
```

## Monitoreo

### Métricas Clave

```python
- Latency de generación IA
- Cache hit rate
- Vector search performance
- WebGL render FPS
- Error rates por endpoint
```

### Alerting

```python
# Sentry para errores
# DataDog/Grafana para métricas
# PagerDuty para alertas críticas
```

---

**Próximos pasos**: Ver [DATA_PIPELINE.md](DATA_PIPELINE.md) para detalles del pipeline de datos
