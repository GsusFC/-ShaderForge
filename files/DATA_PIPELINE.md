# Data Pipeline - ShaderForge AI

## Visión General

El pipeline de datos es el corazón del sistema de aprendizaje. Recolecta, procesa y indexa shaders de múltiples fuentes para alimentar el motor de IA.

## Pipeline Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1: COLLECTION                        │
├─────────────────────────────────────────────────────────────┤
│  Shadertoy API → GitHub Repos → GLSL Sandbox → Tutorials    │
│                  ↓                                           │
│              data/raw/shaders/                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   FASE 2: PROCESSING                         │
├─────────────────────────────────────────────────────────────┤
│  Parse → Extract → Categorize → Validate → Deduplicate      │
│                  ↓                                           │
│           data/processed/shaders/                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   FASE 3: ENRICHMENT                         │
├─────────────────────────────────────────────────────────────┤
│  Generate Embeddings → Extract Techniques → Add Metadata    │
│                  ↓                                           │
│            data/enriched/shaders/                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FASE 4: INDEXING                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (metadata) + Pinecone (vectors) + Redis (cache) │
└─────────────────────────────────────────────────────────────┘
```

## Fase 1: Data Collection

### 1.1 Shadertoy Scraper

**Archivo**: `src/scraper/shadertoy.py`

```python
import asyncio
import aiohttp
from typing import List, Dict, Optional
from dataclasses import dataclass
import json
from pathlib import Path

@dataclass
class ShadertoyCo config:
    api_key: str
    base_url: str = "https://www.shadertoy.com/api/v1"
    rate_limit: int = 100  # requests per hour
    batch_size: int = 50
    output_dir: Path = Path("data/raw/shadertoy")

class ShadertoyScrap er:
    """
    Scraper para Shadertoy con rate limiting y reintentos
    """
    
    def __init__(self, config: ShadertoyCo config):
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        self.request_count = 0
        self.start_time = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        self.start_time = asyncio.get_event_loop().time()
        return self
        
    async def __aexit__(self, *args):
        await self.session.close()
    
    async def _rate_limit_check(self):
        """Implementa rate limiting"""
        if self.request_count >= self.config.rate_limit:
            elapsed = asyncio.get_event_loop().time() - self.start_time
            if elapsed < 3600:  # 1 hora
                sleep_time = 3600 - elapsed
                print(f"Rate limit alcanzado. Esperando {sleep_time:.0f}s")
                await asyncio.sleep(sleep_time)
            self.request_count = 0
            self.start_time = asyncio.get_event_loop().time()
    
    async def get_shader_ids(
        self, 
        query: str = "",
        sort: str = "popular",
        from_: int = 0,
        num: int = 100
    ) -> List[str]:
        """
        Obtiene lista de IDs de shaders
        
        Args:
            query: Búsqueda (vacío = todos)
            sort: popular, newest, love, hot
            from_: Offset
            num: Cantidad (max 100)
        """
        await self._rate_limit_check()
        
        url = f"{self.config.base_url}/shaders/query/{query}"
        params = {
            'key': self.config.api_key,
            'sort': sort,
            'from': from_,
            'num': num
        }
        
        async with self.session.get(url, params=params) as resp:
            self.request_count += 1
            if resp.status == 200:
                data = await resp.json()
                return data.get('Results', [])
            else:
                print(f"Error {resp.status}: {await resp.text()}")
                return []
    
    async def get_shader(self, shader_id: str) -> Optional[Dict]:
        """
        Obtiene detalles completos de un shader
        """
        await self._rate_limit_check()
        
        url = f"{self.config.base_url}/shaders/{shader_id}"
        params = {'key': self.config.api_key}
        
        try:
            async with self.session.get(url, params=params) as resp:
                self.request_count += 1
                if resp.status == 200:
                    data = await resp.json()
                    return data.get('Shader')
                else:
                    print(f"Error obteniendo shader {shader_id}: {resp.status}")
                    return None
        except Exception as e:
            print(f"Excepción obteniendo shader {shader_id}: {e}")
            return None
    
    async def scrape_batch(
        self,
        shader_ids: List[str],
        save: bool = True
    ) -> List[Dict]:
        """
        Scrape un lote de shaders en paralelo
        """
        tasks = [self.get_shader(sid) for sid in shader_ids]
        shaders = await asyncio.gather(*tasks)
        shaders = [s for s in shaders if s is not None]
        
        if save and shaders:
            self.save_batch(shaders)
        
        return shaders
    
    def save_batch(self, shaders: List[Dict]):
        """Guarda lote en disco"""
        self.config.output_dir.mkdir(parents=True, exist_ok=True)
        
        for shader in shaders:
            shader_id = shader['info']['id']
            filepath = self.config.output_dir / f"{shader_id}.json"
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(shader, f, indent=2, ensure_ascii=False)
    
    async def scrape_all(
        self,
        max_shaders: int = 10000,
        sort: str = "popular"
    ):
        """
        Scrape masivo de Shadertoy
        
        Estrategia:
        1. Obtener lista de IDs (batches de 100)
        2. Scrape detalles en batches de 50
        3. Guardar incrementalmente
        """
        print(f"Iniciando scrape de hasta {max_shaders} shaders...")
        
        all_ids = []
        offset = 0
        
        # Fase 1: Recolectar IDs
        while len(all_ids) < max_shaders:
            ids = await self.get_shader_ids(
                sort=sort,
                from_=offset,
                num=100
            )
            
            if not ids:
                break
                
            all_ids.extend(ids)
            offset += 100
            print(f"Recolectados {len(all_ids)} IDs...")
            
            if len(ids) < 100:
                break
        
        all_ids = all_ids[:max_shaders]
        print(f"Total IDs recolectados: {len(all_ids)}")
        
        # Fase 2: Scrape detalles en batches
        total_scraped = 0
        for i in range(0, len(all_ids), self.config.batch_size):
            batch_ids = all_ids[i:i + self.config.batch_size]
            shaders = await self.scrape_batch(batch_ids)
            total_scraped += len(shaders)
            
            print(f"Progreso: {total_scraped}/{len(all_ids)} shaders")
        
        print(f"Scraping completo: {total_scraped} shaders guardados")

# Script de ejecución
async def main():
    config = ShadertoyCo config(
        api_key="YOUR_API_KEY",  # Obtener de .env
        batch_size=50,
        output_dir=Path("data/raw/shadertoy")
    )
    
    async with ShadertoyScrap er(config) as scraper:
        await scraper.scrape_all(max_shaders=10000, sort="popular")

if __name__ == "__main__":
    asyncio.run(main())
```

### 1.2 GitHub Scraper

**Archivo**: `src/scraper/github.py`

```python
import asyncio
from github import Github
from pathlib import Path
import json

class GitHubShaderScraper:
    """
    Scraper para repositorios de GitHub
    """
    
    TARGET_REPOS = [
        "repalash/Open-Shaders",
        "patriciogonzalezvivo/lygia",
        "libretro/glsl-shaders",
        "QianMo/Awesome-Unity-Shader",
        "GDQuest/godot-shaders"
    ]
    
    SHADER_EXTENSIONS = ['.glsl', '.frag', '.vert', '.hlsl', '.shader']
    
    def __init__(self, github_token: str, output_dir: Path):
        self.gh = Github(github_token)
        self.output_dir = output_dir
    
    def is_shader_file(self, filename: str) -> bool:
        """Verifica si es archivo shader"""
        return any(filename.endswith(ext) for ext in self.SHADER_EXTENSIONS)
    
    async def scrape_repo(self, repo_name: str):
        """Scrape un repositorio completo"""
        print(f"Scraping repo: {repo_name}")
        repo = self.gh.get_repo(repo_name)
        
        contents = repo.get_contents("")
        shader_count = 0
        
        while contents:
            file = contents.pop(0)
            
            if file.type == "dir":
                contents.extend(repo.get_contents(file.path))
            elif self.is_shader_file(file.name):
                await self.save_shader_file(repo_name, file)
                shader_count += 1
        
        print(f"  → {shader_count} shaders encontrados")
    
    async def save_shader_file(self, repo_name: str, file):
        """Guarda archivo shader con metadata"""
        repo_safe = repo_name.replace('/', '_')
        output_dir = self.output_dir / repo_safe
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Guardar código
        code_path = output_dir / file.name
        with open(code_path, 'wb') as f:
            f.write(file.decoded_content)
        
        # Guardar metadata
        metadata = {
            'source': 'github',
            'repo': repo_name,
            'path': file.path,
            'url': file.html_url,
            'size': file.size,
            'sha': file.sha
        }
        
        meta_path = output_dir / f"{file.name}.meta.json"
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    async def scrape_all(self):
        """Scrape todos los repos"""
        for repo in self.TARGET_REPOS:
            try:
                await self.scrape_repo(repo)
            except Exception as e:
                print(f"Error scraping {repo}: {e}")

# Ejecución
async def main():
    scraper = GitHubShaderScraper(
        github_token="YOUR_GITHUB_TOKEN",
        output_dir=Path("data/raw/github")
    )
    await scraper.scrape_all()

if __name__ == "__main__":
    asyncio.run(main())
```

## Fase 2: Processing

### 2.1 Shader Processor

**Archivo**: `src/scraper/processors/shader_processor.py`

```python
import re
from typing import Dict, List, Set
from pathlib import Path
import json
from dataclasses import dataclass, asdict

@dataclass
class ProcessedShader:
    id: str
    name: str
    description: str
    code: str
    language: str  # glsl, hlsl, metal
    category: str
    tags: List[str]
    techniques: List[str]
    uniforms: List[Dict]
    functions: List[str]
    complexity_score: float
    source: str
    source_url: str
    author: str
    license: str
    views: int = 0
    likes: int = 0

class ShaderProcessor:
    """
    Procesa shaders raw y extrae metadata
    """
    
    # Patterns para detección
    TECHNIQUE_PATTERNS = {
        'raymarching': r'(raymarching|raymarch|sphere_trace)',
        'sdf': r'(sdSphere|sdBox|sdTorus|opUnion|opSubtraction)',
        'noise': r'(noise|fbm|turbulence|perlin|simplex|voronoi)',
        'fractals': r'(mandelbrot|julia|ifs|l-system)',
        'pbr': r'(BRDF|metallic|roughness|fresnel)',
        'post_processing': r'(bloom|blur|dof|motion_blur|tonemapping)',
        'particles': r'(particle|emit|velocity)',
        'water': r'(water|ocean|caustics|wave)',
        'fire': r'(fire|flame|smoke)',
        'lighting': r'(phong|blinn|lambert|oren-nayar)'
    }
    
    CATEGORY_KEYWORDS = {
        '2d_effects': ['2d', 'filter', 'distortion'],
        '3d_raymarching': ['3d', 'raymarching', 'sdf'],
        'fractals': ['mandelbrot', 'julia', 'fractal'],
        'simulations': ['physics', 'particles', 'fluid'],
        'materials': ['pbr', 'material', 'texture'],
        'post_processing': ['bloom', 'blur', 'tonemap']
    }
    
    def process_shadertoy(self, raw_data: Dict) -> ProcessedShader:
        """Procesa shader de Shadertoy"""
        info = raw_data['info']
        renderpass = raw_data['renderpass'][0]  # Main pass
        
        code = renderpass['code']
        
        return ProcessedShader(
            id=f"shadertoy_{info['id']}",
            name=info['name'],
            description=info['description'],
            code=code,
            language='glsl',
            category=self.categorize(code, info['description']),
            tags=info.get('tags', []),
            techniques=self.extract_techniques(code),
            uniforms=self.extract_uniforms(code),
            functions=self.extract_functions(code),
            complexity_score=self.calculate_complexity(code),
            source='shadertoy',
            source_url=f"https://www.shadertoy.com/view/{info['id']}",
            author=info['username'],
            license='Shadertoy',
            views=info.get('viewed', 0),
            likes=info.get('likes', 0)
        )
    
    def extract_techniques(self, code: str) -> List[str]:
        """Detecta técnicas usadas en el código"""
        techniques = []
        code_lower = code.lower()
        
        for tech, pattern in self.TECHNIQUE_PATTERNS.items():
            if re.search(pattern, code_lower):
                techniques.append(tech)
        
        return techniques
    
    def extract_uniforms(self, code: str) -> List[Dict]:
        """Extrae uniforms del shader"""
        uniform_pattern = r'uniform\s+(\w+)\s+(\w+);'
        matches = re.findall(uniform_pattern, code)
        
        return [
            {'type': type_, 'name': name}
            for type_, name in matches
        ]
    
    def extract_functions(self, code: str) -> List[str]:
        """Extrae nombres de funciones"""
        func_pattern = r'(?:float|vec2|vec3|vec4|mat3|mat4)\s+(\w+)\s*\('
        functions = re.findall(func_pattern, code)
        return list(set(functions))  # Eliminar duplicados
    
    def categorize(self, code: str, description: str) -> str:
        """Categoriza automáticamente el shader"""
        text = (code + " " + description).lower()
        
        scores = {}
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        return 'other'
    
    def calculate_complexity(self, code: str) -> float:
        """
        Calcula score de complejidad (0-1)
        
        Factores:
        - Líneas de código
        - Número de loops
        - Número de funciones
        - Uso de técnicas avanzadas
        """
        lines = len([l for l in code.split('\n') if l.strip()])
        loops = code.count('for') + code.count('while')
        functions = len(self.extract_functions(code))
        
        # Normalizar
        complexity = (
            min(lines / 500, 1) * 0.4 +
            min(loops / 10, 1) * 0.3 +
            min(functions / 20, 1) * 0.3
        )
        
        return round(complexity, 2)
    
    def save_processed(self, shader: ProcessedShader, output_dir: Path):
        """Guarda shader procesado"""
        output_dir.mkdir(parents=True, exist_ok=True)
        filepath = output_dir / f"{shader.id}.json"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(asdict(shader), f, indent=2, ensure_ascii=False)

# Pipeline de procesamiento
async def process_all_shadertoy():
    """Procesa todos los shaders de Shadertoy"""
    processor = ShaderProcessor()
    input_dir = Path("data/raw/shadertoy")
    output_dir = Path("data/processed/shadertoy")
    
    shader_files = list(input_dir.glob("*.json"))
    print(f"Procesando {len(shader_files)} shaders...")
    
    for i, filepath in enumerate(shader_files):
        with open(filepath, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        
        try:
            processed = processor.process_shadertoy(raw_data)
            processor.save_processed(processed, output_dir)
            
            if (i + 1) % 100 == 0:
                print(f"Procesados: {i + 1}/{len(shader_files)}")
        except Exception as e:
            print(f"Error procesando {filepath.name}: {e}")
    
    print("Procesamiento completo!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(process_all_shadertoy())
```

## Fase 3: Enrichment

### 3.1 Embedding Generator

**Archivo**: `src/ml/embeddings.py`

```python
import openai
from typing import List
import numpy as np
from pathlib import Path
import json

class EmbeddingGenerator:
    """
    Genera embeddings para búsqueda semántica
    """
    
    def __init__(self, api_key: str):
        openai.api_key = api_key
        self.model = "text-embedding-3-large"
        self.dimension = 1536
    
    async def embed_text(self, text: str) -> List[float]:
        """Genera embedding de texto"""
        response = await openai.Embedding.acreate(
            model=self.model,
            input=text
        )
        return response['data'][0]['embedding']
    
    async def embed_shader(self, shader: Dict) -> Dict:
        """
        Genera embeddings de un shader
        
        Returns:
            {
                'description_embedding': [...],
                'code_embedding': [...],
                'combined_embedding': [...]
            }
        """
        # Embed descripción
        desc_text = f"{shader['name']} {shader['description']} {' '.join(shader['tags'])}"
        desc_emb = await self.embed_text(desc_text)
        
        # Embed código (primeras 8000 chars)
        code_text = shader['code'][:8000]
        code_emb = await self.embed_text(code_text)
        
        # Combined (weighted average)
        combined_emb = [
            0.7 * d + 0.3 * c 
            for d, c in zip(desc_emb, code_emb)
        ]
        
        return {
            'description_embedding': desc_emb,
            'code_embedding': code_emb,
            'combined_embedding': combined_emb
        }
    
    async def process_batch(
        self, 
        shader_files: List[Path],
        output_dir: Path
    ):
        """Procesa batch de shaders"""
        output_dir.mkdir(parents=True, exist_ok=True)
        
        for i, filepath in enumerate(shader_files):
            with open(filepath, 'r', encoding='utf-8') as f:
                shader = json.load(f)
            
            try:
                embeddings = await self.embed_shader(shader)
                
                # Guardar embeddings
                output_file = output_dir / f"{shader['id']}_embeddings.json"
                with open(output_file, 'w') as f:
                    json.dump({
                        'shader_id': shader['id'],
                        'embeddings': embeddings
                    }, f)
                
                if (i + 1) % 10 == 0:
                    print(f"Embeddings generados: {i + 1}/{len(shader_files)}")
                    
            except Exception as e:
                print(f"Error con {filepath.name}: {e}")

# Script de ejecución
async def generate_all_embeddings():
    generator = EmbeddingGenerator(api_key="YOUR_OPENAI_KEY")
    
    input_dir = Path("data/processed/shadertoy")
    output_dir = Path("data/enriched/embeddings")
    
    shader_files = list(input_dir.glob("*.json"))
    await generator.process_batch(shader_files, output_dir)

if __name__ == "__main__":
    import asyncio
    asyncio.run(generate_all_embeddings())
```

## Fase 4: Indexing

### 4.1 Database Loader

**Archivo**: `src/ml/db_loader.py`

```python
import asyncio
from pathlib import Path
import json
import asyncpg
from pinecone import Pinecone

class DatabaseLoader:
    """
    Carga shaders procesados en PostgreSQL y Pinecone
    """
    
    def __init__(
        self,
        pg_url: str,
        pinecone_api_key: str,
        pinecone_index: str
    ):
        self.pg_url = pg_url
        self.pc = Pinecone(api_key=pinecone_api_key)
        self.index = self.pc.Index(pinecone_index)
    
    async def load_to_postgres(self, shader: Dict):
        """Carga shader a PostgreSQL"""
        conn = await asyncpg.connect(self.pg_url)
        
        try:
            await conn.execute("""
                INSERT INTO shaders (
                    id, name, description, code, language, category,
                    tags, source, source_url, author, license,
                    views, likes, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                ON CONFLICT (id) DO UPDATE SET
                    views = EXCLUDED.views,
                    likes = EXCLUDED.likes,
                    updated_at = NOW()
            """,
                shader['id'], shader['name'], shader['description'],
                shader['code'], shader['language'], shader['category'],
                shader['tags'], shader['source'], shader['source_url'],
                shader['author'], shader['license'], shader['views'],
                shader['likes'], json.dumps({
                    'techniques': shader['techniques'],
                    'uniforms': shader['uniforms'],
                    'complexity_score': shader['complexity_score']
                })
            )
        finally:
            await conn.close()
    
    def load_to_pinecone(self, shader_id: str, embedding: List[float], metadata: Dict):
        """Carga embedding a Pinecone"""
        self.index.upsert(vectors=[{
            'id': shader_id,
            'values': embedding,
            'metadata': metadata
        }])
    
    async def load_all(self):
        """Carga todos los shaders procesados"""
        shader_dir = Path("data/processed/shadertoy")
        embedding_dir = Path("data/enriched/embeddings")
        
        shader_files = list(shader_dir.glob("*.json"))
        print(f"Cargando {len(shader_files)} shaders...")
        
        for i, shader_file in enumerate(shader_files):
            # Load shader
            with open(shader_file, 'r', encoding='utf-8') as f:
                shader = json.load(f)
            
            # Load embeddings
            emb_file = embedding_dir / f"{shader['id']}_embeddings.json"
            if not emb_file.exists():
                print(f"Sin embeddings: {shader['id']}")
                continue
            
            with open(emb_file, 'r') as f:
                emb_data = json.load(f)
            
            try:
                # PostgreSQL
                await self.load_to_postgres(shader)
                
                # Pinecone
                self.load_to_pinecone(
                    shader_id=shader['id'],
                    embedding=emb_data['embeddings']['combined_embedding'],
                    metadata={
                        'name': shader['name'],
                        'category': shader['category'],
                        'tags': shader['tags'],
                        'techniques': shader['techniques'],
                        'complexity': shader['complexity_score'],
                        'source': shader['source']
                    }
                )
                
                if (i + 1) % 100 == 0:
                    print(f"Cargados: {i + 1}/{len(shader_files)}")
                    
            except Exception as e:
                print(f"Error cargando {shader['id']}: {e}")
        
        print("¡Carga completa!")

# Ejecución
async def main():
    loader = DatabaseLoader(
        pg_url="postgresql://user:pass@localhost/shaderforge",
        pinecone_api_key="YOUR_PINECONE_KEY",
        pinecone_index="shaderforge-embeddings"
    )
    await loader.load_all()

if __name__ == "__main__":
    asyncio.run(main())
```

## Cronograma de Ejecución

### Setup Inicial (Día 1)
```bash
# 1. Crear estructura de directorios
mkdir -p data/{raw,processed,enriched}/{shadertoy,github}
mkdir -p data/enriched/embeddings

# 2. Configurar APIs
export SHADERTOY_API_KEY="..."
export GITHUB_TOKEN="..."
export OPENAI_API_KEY="..."
export PINECONE_API_KEY="..."
```

### Ejecución del Pipeline (Días 2-7)

```bash
# Día 2-3: Scraping (~48 horas con rate limiting)
python src/scraper/shadertoy.py  # ~10,000 shaders
python src/scraper/github.py      # ~5,000 shaders

# Día 4: Processing (~4 horas)
python src/scraper/processors/shader_processor.py

# Día 5-6: Embeddings (~24 horas, batches de 100)
python src/ml/embeddings.py

# Día 7: Database Loading (~2 horas)
python src/ml/db_loader.py
```

## Monitoreo y Métricas

```python
# Stats a trackear:
- Total shaders scraped
- Shaders por fuente
- Shaders por categoría
- Técnicas más comunes
- Complejidad promedio
- Tiempo de procesamiento
- Errores por fase
```

## Mantenimiento

### Updates Incrementales
```python
# Cron job diario para nuevos shaders
# Solo scrap nuevos desde última ejecución
# Delta processing + incremental loading
```

### Data Quality
```python
# Validaciones:
- Código GLSL válido
- Sin duplicados
- Metadata completa
- Embeddings generados
```

---

**Próximos pasos**: Ver [API.md](API.md) para especificación de endpoints
