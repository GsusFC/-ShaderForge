from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
from pathlib import Path

router = APIRouter(prefix="/api/v1/search", tags=["search"])

def get_demo_shaders() -> List[dict]:
    """Retorna shaders de demostración"""
    return [
        {
            "id": "demo_water_ripple",
            "name": "Water Ripple Effect",
            "description": "Beautiful water ripple shader with realistic wave simulation and reflection effects",
            "views": 15234,
            "likes": 892,
            "author": "ShaderMaster",
            "category": "effects",
            "tags": ["water", "ripple", "waves", "simulation"],
            "code": """// Water Ripple Effect
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    float dist = length(uv - center);

    // Create ripples
    float ripple = sin(dist * 20.0 - iTime * 3.0) * 0.5 + 0.5;
    ripple *= 1.0 - smoothstep(0.0, 0.7, dist);

    // Water color gradient
    vec3 waterColor = mix(
        vec3(0.1, 0.3, 0.6),
        vec3(0.2, 0.6, 0.9),
        ripple
    );

    fragColor = vec4(waterColor, 1.0);
}"""
        },
        {
            "id": "demo_fire",
            "name": "Realistic Fire",
            "description": "Dynamic fire shader with particle-based flames and heat distortion",
            "views": 12567,
            "likes": 743,
            "author": "PyroShader",
            "category": "effects",
            "tags": ["fire", "flames", "particles", "heat"],
            "code": """// Realistic Fire
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;

    // Flame shape
    float flame = (1.0 - uv.y) * 0.8;
    flame *= smoothstep(0.0, 0.3, uv.y);
    flame *= smoothstep(1.0, 0.5, abs(uv.x - 0.5) * 2.0);

    // Add noise for flickering
    float n = noise(uv * 10.0 + iTime);
    flame += n * 0.2 * (1.0 - uv.y);

    // Color gradient
    vec3 col = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 1.0, 0.0), uv.y);
    col = mix(vec3(0.0), col, flame);

    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_fractal",
            "name": "Julia Set Fractal",
            "description": "Interactive Julia set fractal explorer with smooth coloring and zoom",
            "views": 9876,
            "likes": 654,
            "author": "MathArtist",
            "category": "fractal",
            "tags": ["fractal", "julia", "math", "art"],
            "code": """// Julia Set Fractal
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    uv *= 2.0;

    vec2 c = vec2(cos(iTime * 0.2), sin(iTime * 0.3)) * 0.7;
    vec2 z = uv;

    float iter = 0.0;
    for (int i = 0; i < 100; i++) {
        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        if (length(z) > 2.0) break;
        iter += 1.0;
    }

    vec3 col = 0.5 + 0.5*cos(3.0 + iter*0.15 + vec3(0.0,0.6,1.0));
    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_noise",
            "name": "Perlin Noise Clouds",
            "description": "Volumetric cloud rendering using layered Perlin noise",
            "views": 8234,
            "likes": 521,
            "author": "CloudMaker",
            "category": "procedural",
            "tags": ["noise", "clouds", "perlin", "procedural"],
            "code": """// Perlin Noise Clouds
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec3 skyBlue = vec3(0.4, 0.6, 1.0);
    vec3 white = vec3(1.0);

    float cloud = fract(sin(dot(uv * 5.0, vec2(12.9898, 78.233))) * 43758.5453);
    cloud = smoothstep(0.4, 0.6, cloud + sin(iTime * 0.5) * 0.1);

    vec3 col = mix(skyBlue, white, cloud);
    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_galaxy",
            "name": "Spiral Galaxy",
            "description": "Procedurally generated spiral galaxy with stars and nebulae",
            "views": 11453,
            "likes": 876,
            "author": "SpaceShader",
            "category": "space",
            "tags": ["galaxy", "space", "stars", "procedural"],
            "code": """// Spiral Galaxy
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    float d = length(uv);
    float a = atan(uv.y, uv.x) + iTime * 0.1;

    float spiral = sin(a * 3.0 - d * 10.0);
    float glow = exp(-d * 3.0) * (0.5 + 0.5 * spiral);

    vec3 col = vec3(0.5, 0.3, 1.0) * glow;
    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_plasma",
            "name": "Rainbow Plasma",
            "description": "Classic rainbow plasma effect with sine wave interference patterns",
            "views": 7654,
            "likes": 432,
            "author": "RetroFX",
            "category": "effects",
            "tags": ["plasma", "rainbow", "retro", "sine"],
            "code": """// Rainbow Plasma
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float t = iTime;

    float v = sin(uv.x * 10.0 + t) + sin(uv.y * 10.0 + t);
    v += sin((uv.x + uv.y) * 10.0 + t);
    v += sin(sqrt(uv.x*uv.x + uv.y*uv.y) * 10.0 + t);

    vec3 col = 0.5 + 0.5 * cos(v + vec3(0.0, 2.0, 4.0));
    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_vortex",
            "name": "Energy Vortex",
            "description": "Swirling energy vortex with particle trails and glow effects",
            "views": 9234,
            "likes": 612,
            "author": "VortexMaster",
            "category": "effects",
            "tags": ["vortex", "energy", "particles", "glow"],
            "code": """// Energy Vortex
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    float a = atan(uv.y, uv.x);
    float r = length(uv);

    a += iTime * 2.0 + sin(r * 5.0) * 0.5;
    float pattern = sin(a * 5.0 + r * 10.0 - iTime * 3.0);

    vec3 col = vec3(0.0, 0.5, 1.0) * pattern * exp(-r * 2.0);
    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_voronoi",
            "name": "Voronoi Cells",
            "description": "Animated Voronoi diagram with smooth cell boundaries",
            "views": 6543,
            "likes": 398,
            "author": "GeometryFan",
            "category": "procedural",
            "tags": ["voronoi", "cells", "geometry", "procedural"],
            "code": """// Voronoi Cells
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy * 5.0;
    vec2 cell = floor(uv);
    vec2 pos = fract(uv);

    float minDist = 1.0;
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = 0.5 + 0.5 * sin(cell + neighbor + iTime);
            float dist = length(neighbor + point - pos);
            minDist = min(minDist, dist);
        }
    }

    vec3 col = vec3(minDist);
    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_ocean",
            "name": "Ocean Waves",
            "description": "Realistic ocean simulation with foam, reflections and caustics",
            "views": 13890,
            "likes": 945,
            "author": "OceanRenderer",
            "category": "simulation",
            "tags": ["ocean", "waves", "water", "realistic"],
            "code": """// Ocean Waves
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float wave1 = sin(uv.x * 20.0 + iTime * 2.0) * 0.02;
    float wave2 = sin(uv.x * 15.0 - iTime * 1.5) * 0.03;
    float wave = wave1 + wave2;

    vec3 deepWater = vec3(0.0, 0.2, 0.4);
    vec3 shallowWater = vec3(0.2, 0.6, 0.8);
    vec3 col = mix(deepWater, shallowWater, uv.y + wave);

    fragColor = vec4(col, 1.0);
}"""
        },
        {
            "id": "demo_tunnel",
            "name": "Infinite Tunnel",
            "description": "Psychedelic infinite tunnel with rotating patterns and colors",
            "views": 8765,
            "likes": 567,
            "author": "TunnelVision",
            "category": "effects",
            "tags": ["tunnel", "infinite", "psychedelic", "rotation"],
            "code": """// Infinite Tunnel
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    float a = atan(uv.y, uv.x) + iTime;
    float r = length(uv);

    vec2 tuv = vec2(1.0/r, a);
    tuv.y += iTime * 0.5;

    vec3 col = 0.5 + 0.5 * cos(tuv.y * 2.0 + vec3(0.0, 2.0, 4.0));
    col *= smoothstep(0.0, 0.1, r);

    fragColor = vec4(col, 1.0);
}"""
        }
    ]

def load_shaders_from_disk() -> List[dict]:
    """Carga shaders desde disco o retorna demos"""
    shader_dir = Path("../../data/raw/shadertoy")
    shaders = []

    if shader_dir.exists():
        for file in shader_dir.glob("*.json"):
            try:
                with open(file, encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, dict) and 'info' in data:
                        info = data['info']
                        shaders.append({
                            "id": f"shadertoy_{info.get('id', 'unknown')}",
                            "name": info.get('name', 'Unknown'),
                            "description": info.get('description', ''),
                            "views": info.get('viewed', 0),
                            "likes": info.get('likes', 0),
                            "author": info.get('username', 'Anonymous'),
                            "category": "general",
                            "tags": info.get('tags', [])
                        })
            except Exception as e:
                print(f"Error loading {file.name}: {e}")

    # Si no hay shaders en disco, usar demos
    if not shaders:
        shaders = get_demo_shaders()

    return shaders

@router.get("/shaders")
def search_shaders(
    q: str = Query("", description="Search query"),
    limit: int = Query(10, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """
    Búsqueda simple de shaders por texto
    
    - **q**: Término de búsqueda (vacío retorna todos)
    - **limit**: Máximo de resultados (1-100)
    - **offset**: Paginación
    
    Returns:
        - query: Término buscado
        - results: Lista de shaders
        - total: Total de shaders encontrados
        - pagination: Info de paginación
    """
    try:
        shaders = load_shaders_from_disk()
        
        # Filtrar por búsqueda
        if q:
            q_lower = q.lower()
            filtered = [
                s for s in shaders 
                if (q_lower in s['name'].lower() or 
                    q_lower in s['description'].lower() or
                    any(q_lower in tag.lower() for tag in s.get('tags', [])))
            ]
        else:
            filtered = shaders
        
        # Ordenar por views
        filtered.sort(key=lambda x: x['views'], reverse=True)
        
        # Paginar
        total = len(filtered)
        paginated = filtered[offset:offset + limit]
        
        return {
            "success": True,
            "query": q,
            "results": paginated,
            "pagination": {
                "total": total,
                "limit": limit,
                "offset": offset,
                "hasMore": (offset + limit) < total
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/shaders/{shader_id}")
def get_shader(shader_id: str):
    """Obtiene un shader específico por ID"""
    try:
        shaders = load_shaders_from_disk()
        
        for shader in shaders:
            if shader['id'] == shader_id:
                return {
                    "success": True,
                    "shader": shader
                }
        
        raise HTTPException(status_code=404, detail="Shader not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching shader: {str(e)}")

@router.get("/popular")
def get_popular_shaders(limit: int = Query(10, ge=1, le=50)):
    """Obtiene shaders populares"""
    try:
        shaders = load_shaders_from_disk()
        
        # Ordenar por views + likes
        shaders.sort(
            key=lambda x: (x['views'] + x['likes'] * 10), 
            reverse=True
        )
        
        return {
            "success": True,
            "results": shaders[:limit],
            "total": len(shaders)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching popular shaders: {str(e)}")

@router.get("/stats")
def get_search_stats():
    """Obtiene estadísticas de los shaders disponibles"""
    try:
        shaders = load_shaders_from_disk()
        
        if not shaders:
            return {
                "success": True,
                "stats": {
                    "total_shaders": 0,
                    "total_views": 0,
                    "total_likes": 0,
                    "avg_views": 0,
                    "avg_likes": 0
                }
            }
        
        total_views = sum(s['views'] for s in shaders)
        total_likes = sum(s['likes'] for s in shaders)
        
        return {
            "success": True,
            "stats": {
                "total_shaders": len(shaders),
                "total_views": total_views,
                "total_likes": total_likes,
                "avg_views": total_views / len(shaders),
                "avg_likes": total_likes / len(shaders),
                "top_shader": max(shaders, key=lambda x: x['views']) if shaders else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
