# API Specification - ShaderForge AI

## Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://api.shaderforge.ai/api/v1
```

## Authentication

```http
Authorization: Bearer <JWT_TOKEN>
X-API-Key: <API_KEY>
```

## Rate Limiting

```
Free Tier:     100 requests/hour
Pro Tier:      1000 requests/hour
Enterprise:    Unlimited
```

## Endpoints

### 1. AI Generation

#### 1.1 Generate Shader

Genera un shader a partir de descripción en lenguaje natural.

**Endpoint**: `POST /ai/generate`

**Request Body**:
```json
{
  "prompt": "Create a water caustics effect with realistic refraction",
  "style": "realistic",  // realistic, stylized, artistic, retro
  "complexity": "medium", // simple, medium, complex
  "target": "fragment",   // fragment, vertex, compute
  "language": "glsl",     // glsl, hlsl, metal, wgsl
  "constraints": {
    "maxLines": 200,
    "performance": "high",  // low, medium, high
    "compatibility": "webgl2"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "shader": {
    "id": "gen_abc123",
    "code": "// Generated GLSL code...",
    "language": "glsl",
    "metadata": {
      "linesOfCode": 150,
      "estimatedPerformance": "high",
      "techniques": ["raymarching", "sdf", "noise"],
      "uniforms": [
        {"name": "iTime", "type": "float"},
        {"name": "iResolution", "type": "vec2"}
      ]
    },
    "nodeGraph": {
      "nodes": [...],
      "edges": [...]
    },
    "similarShaders": [
      {
        "id": "shadertoy_xyz",
        "name": "Water Simulation",
        "similarity": 0.89
      }
    ]
  },
  "generationTime": 2.3,
  "creditsUsed": 1
}
```

**Error Responses**:
```json
// 400 Bad Request
{
  "error": "Invalid prompt",
  "message": "Prompt must be between 10 and 500 characters"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600,
  "message": "You've exceeded your hourly limit"
}

// 500 Internal Server Error
{
  "error": "Generation failed",
  "message": "AI model temporarily unavailable"
}
```

#### 1.2 Complete Code

Autocompletado de código shader.

**Endpoint**: `POST /ai/complete`

**Request Body**:
```json
{
  "code": "vec3 renderScene(vec3 ro, vec3 rd) {\n  // ",
  "cursor": 45,
  "language": "glsl",
  "context": {
    "functions": ["sdSphere", "opUnion"],
    "uniforms": ["iTime", "iResolution"]
  }
}
```

**Response** (200 OK):
```json
{
  "suggestions": [
    {
      "text": "float t = raycast(ro, rd);",
      "confidence": 0.92,
      "description": "Raycast to find intersection"
    },
    {
      "text": "vec3 col = vec3(0.0);",
      "confidence": 0.85,
      "description": "Initialize color variable"
    }
  ]
}
```

#### 1.3 Explain Code

Explica código shader línea por línea.

**Endpoint**: `POST /ai/explain`

**Request Body**:
```json
{
  "code": "float sdSphere(vec3 p, float r) {\n  return length(p) - r;\n}",
  "language": "glsl",
  "level": "beginner"  // beginner, intermediate, expert
}
```

**Response** (200 OK):
```json
{
  "explanation": {
    "summary": "This is a signed distance function (SDF) for a sphere",
    "lineByLine": [
      {
        "line": 1,
        "code": "float sdSphere(vec3 p, float r) {",
        "explanation": "Function that takes a 3D point 'p' and radius 'r' as inputs"
      },
      {
        "line": 2,
        "code": "  return length(p) - r;",
        "explanation": "Calculates the distance from point p to the sphere surface. Negative inside, positive outside, zero on surface."
      }
    ],
    "concepts": ["sdf", "distance_field", "sphere"],
    "difficulty": "beginner"
  }
}
```

#### 1.4 Optimize Shader

Optimiza código shader manteniendo comportamiento.

**Endpoint**: `POST /ai/optimize`

**Request Body**:
```json
{
  "code": "// Original shader code",
  "target": "mobile",  // desktop, mobile, web
  "priorities": ["performance", "readability"],
  "constraints": {
    "maxInstructions": 100,
    "preserveQuality": true
  }
}
```

**Response** (200 OK):
```json
{
  "original": {
    "code": "...",
    "metrics": {
      "instructions": 250,
      "estimatedFPS": 30,
      "complexity": "high"
    }
  },
  "optimized": {
    "code": "...",
    "metrics": {
      "instructions": 120,
      "estimatedFPS": 60,
      "complexity": "medium"
    }
  },
  "changes": [
    "Replaced expensive sin/cos with lookup table",
    "Removed redundant calculations",
    "Simplified conditionals"
  ],
  "improvement": "52% faster"
}
```

### 2. Shader Management

#### 2.1 Create Shader

**Endpoint**: `POST /shaders`

**Request Body**:
```json
{
  "name": "My Water Shader",
  "description": "Realistic water with caustics",
  "code": "// GLSL code",
  "language": "glsl",
  "category": "materials",
  "tags": ["water", "realistic", "pbr"],
  "visibility": "public",  // public, private, unlisted
  "nodeGraph": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response** (201 Created):
```json
{
  "id": "shd_abc123",
  "name": "My Water Shader",
  "url": "https://shaderforge.ai/shaders/shd_abc123",
  "createdAt": "2025-11-01T10:00:00Z"
}
```

#### 2.2 Get Shader

**Endpoint**: `GET /shaders/{id}`

**Response** (200 OK):
```json
{
  "id": "shd_abc123",
  "name": "My Water Shader",
  "description": "Realistic water with caustics",
  "code": "// GLSL code",
  "language": "glsl",
  "category": "materials",
  "tags": ["water", "realistic", "pbr"],
  "author": {
    "id": "usr_xyz",
    "username": "john_doe"
  },
  "stats": {
    "views": 1250,
    "likes": 89,
    "forks": 12
  },
  "nodeGraph": {...},
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-01T12:00:00Z"
}
```

#### 2.3 Update Shader

**Endpoint**: `PUT /shaders/{id}`

**Request Body**: Same as Create

**Response** (200 OK): Same as Get

#### 2.4 Delete Shader

**Endpoint**: `DELETE /shaders/{id}`

**Response** (204 No Content)

#### 2.5 List Shaders

**Endpoint**: `GET /shaders`

**Query Parameters**:
```
?category=materials
&tags=water,realistic
&sort=popular  // popular, newest, trending, top_rated
&limit=20
&offset=0
```

**Response** (200 OK):
```json
{
  "shaders": [
    {
      "id": "shd_abc123",
      "name": "My Water Shader",
      "thumbnail": "https://cdn.shaderforge.ai/thumbs/shd_abc123.png",
      "author": "john_doe",
      "likes": 89,
      "views": 1250
    },
    // ...
  ],
  "pagination": {
    "total": 1530,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### 3. Search

#### 3.1 Semantic Search

Búsqueda semántica usando embeddings.

**Endpoint**: `GET /search/semantic`

**Query Parameters**:
```
?q=realistic water effect
&limit=10
&filters[category]=materials
&filters[complexity]=medium,high
```

**Response** (200 OK):
```json
{
  "results": [
    {
      "shader": {
        "id": "shadertoy_xyz",
        "name": "Ocean Water Simulation",
        "description": "...",
        "thumbnail": "..."
      },
      "score": 0.94,
      "relevance": "high",
      "matchedTerms": ["water", "realistic", "simulation"]
    },
    // ...
  ],
  "query": "realistic water effect",
  "totalResults": 45,
  "searchTime": 0.12
}
```

#### 3.2 Similar Shaders

Encuentra shaders similares a uno dado.

**Endpoint**: `GET /search/similar/{id}`

**Query Parameters**:
```
?limit=10
&by=code  // code, visual, concept
```

**Response** (200 OK):
```json
{
  "source": {
    "id": "shd_abc123",
    "name": "My Water Shader"
  },
  "similar": [
    {
      "id": "shd_xyz789",
      "name": "Ocean Waves",
      "similarity": 0.89,
      "reason": "Similar SDF techniques and noise functions"
    },
    // ...
  ]
}
```

#### 3.3 Autocomplete

Autocompletado de búsqueda.

**Endpoint**: `GET /search/autocomplete`

**Query Parameters**:
```
?q=wat
```

**Response** (200 OK):
```json
{
  "suggestions": [
    {
      "text": "water caustics",
      "type": "tag",
      "count": 234
    },
    {
      "text": "water simulation",
      "type": "tag",
      "count": 189
    },
    {
      "text": "Water Shader",
      "type": "shader_name",
      "count": 45
    }
  ]
}
```

### 4. Node Graph

#### 4.1 Compile Node Graph

Convierte grafo de nodos a código.

**Endpoint**: `POST /nodes/graph/compile`

**Request Body**:
```json
{
  "graph": {
    "nodes": [
      {
        "id": "node_1",
        "type": "uv_input",
        "position": {"x": 0, "y": 0}
      },
      {
        "id": "node_2",
        "type": "noise",
        "position": {"x": 200, "y": 0},
        "parameters": {
          "scale": 5.0,
          "octaves": 4
        }
      },
      {
        "id": "node_3",
        "type": "output",
        "position": {"x": 400, "y": 0}
      }
    ],
    "edges": [
      {
        "source": "node_1",
        "sourcePort": "uv",
        "target": "node_2",
        "targetPort": "coord"
      },
      {
        "source": "node_2",
        "sourcePort": "value",
        "target": "node_3",
        "targetPort": "color"
      }
    ]
  },
  "language": "glsl",
  "optimize": true
}
```

**Response** (200 OK):
```json
{
  "code": "// Generated GLSL code\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n  vec2 uv = fragCoord/iResolution.xy;\n  float n = noise(uv * 5.0, 4);\n  fragColor = vec4(vec3(n), 1.0);\n}",
  "language": "glsl",
  "uniforms": [
    {"name": "iResolution", "type": "vec2"}
  ],
  "functions": [
    "noise"
  ]
}
```

#### 4.2 Parse Code to Graph

Convierte código a grafo de nodos.

**Endpoint**: `POST /nodes/graph/parse`

**Request Body**:
```json
{
  "code": "void mainImage(out vec4 fragColor, in vec2 fragCoord) {\n  vec2 uv = fragCoord/iResolution.xy;\n  float n = noise(uv * 5.0, 4);\n  fragColor = vec4(vec3(n), 1.0);\n}",
  "language": "glsl"
}
```

**Response** (200 OK):
```json
{
  "graph": {
    "nodes": [...],
    "edges": [...]
  },
  "warnings": [
    "Could not parse complex expression at line 3"
  ]
}
```

#### 4.3 Get Node Library

Obtiene librería de nodos disponibles.

**Endpoint**: `GET /nodes/library`

**Query Parameters**:
```
?category=math
```

**Response** (200 OK):
```json
{
  "categories": [
    {
      "name": "Math",
      "nodes": [
        {
          "type": "add",
          "name": "Add",
          "description": "Adds two values",
          "inputs": [
            {"name": "a", "type": "float"},
            {"name": "b", "type": "float"}
          ],
          "outputs": [
            {"name": "result", "type": "float"}
          ],
          "icon": "➕"
        },
        // ...
      ]
    },
    // ...
  ]
}
```

### 5. Export

#### 5.1 Export to GLSL

**Endpoint**: `POST /export/glsl`

**Request Body**:
```json
{
  "shaderId": "shd_abc123",
  "version": "330",  // 100, 300, 330, 420, etc.
  "optimize": true
}
```

**Response** (200 OK):
```json
{
  "code": "// GLSL code",
  "files": [
    {
      "name": "shader.frag",
      "content": "..."
    },
    {
      "name": "shader.vert",
      "content": "..."
    }
  ],
  "downloadUrl": "https://cdn.shaderforge.ai/exports/shd_abc123.zip"
}
```

#### 5.2 Export to Unity

**Endpoint**: `POST /export/unity`

**Request Body**:
```json
{
  "shaderId": "shd_abc123",
  "renderPipeline": "urp",  // urp, hdrp, builtin
  "shaderModel": "4.5"
}
```

**Response** (200 OK):
```json
{
  "files": [
    {
      "name": "WaterShader.shader",
      "content": "Shader \"Custom/Water\" {\n  ..."
    }
  ],
  "instructions": "1. Copy WaterShader.shader to Assets/Shaders/\n2. ...",
  "downloadUrl": "..."
}
```

#### 5.3 Export to Unreal

**Endpoint**: `POST /export/unreal`

**Request Body**:
```json
{
  "shaderId": "shd_abc123",
  "unrealVersion": "5.3",
  "materialDomain": "surface"  // surface, post_process, ui
}
```

**Response** (200 OK):
```json
{
  "files": [
    {
      "name": "M_Water.uasset",
      "type": "material",
      "content": "..."
    }
  ],
  "instructions": "Import M_Water.uasset into Unreal Engine",
  "downloadUrl": "..."
}
```

### 6. Analytics

#### 6.1 Shader Stats

**Endpoint**: `GET /analytics/shader/{id}/stats`

**Response** (200 OK):
```json
{
  "views": {
    "total": 1250,
    "unique": 890,
    "trend": "+12% this week"
  },
  "likes": 89,
  "forks": 12,
  "comments": 23,
  "performance": {
    "avgFPS": 60,
    "devices": {
      "desktop": 60,
      "mobile": 30
    }
  },
  "topReferrers": [
    {"source": "twitter.com", "views": 450},
    {"source": "reddit.com", "views": 320}
  ]
}
```

#### 6.2 User Stats

**Endpoint**: `GET /analytics/user/stats`

**Response** (200 OK):
```json
{
  "shadersCreated": 15,
  "totalViews": 5400,
  "totalLikes": 234,
  "followers": 89,
  "creditsUsed": 45,
  "creditsRemaining": 55,
  "topShader": {
    "id": "shd_abc123",
    "name": "My Water Shader",
    "views": 1250
  }
}
```

### 7. Community

#### 7.1 Like Shader

**Endpoint**: `POST /shaders/{id}/like`

**Response** (200 OK):
```json
{
  "liked": true,
  "totalLikes": 90
}
```

#### 7.2 Fork Shader

**Endpoint**: `POST /shaders/{id}/fork`

**Request Body**:
```json
{
  "name": "My Forked Water Shader",
  "visibility": "public"
}
```

**Response** (201 Created):
```json
{
  "id": "shd_new123",
  "forkedFrom": "shd_abc123",
  "url": "https://shaderforge.ai/shaders/shd_new123"
}
```

#### 7.3 Comment

**Endpoint**: `POST /shaders/{id}/comments`

**Request Body**:
```json
{
  "text": "Amazing shader! Love the caustics effect.",
  "replyTo": "cmt_xyz"  // Optional, for replies
}
```

**Response** (201 Created):
```json
{
  "id": "cmt_abc123",
  "author": "john_doe",
  "text": "...",
  "createdAt": "2025-11-01T10:00:00Z"
}
```

## WebSocket API

Para live collaboration y real-time updates.

**Connection**: `wss://api.shaderforge.ai/ws`

### Events

#### Client → Server

```json
// Join shader editing session
{
  "type": "join",
  "shaderId": "shd_abc123"
}

// Update node position
{
  "type": "node_update",
  "nodeId": "node_1",
  "position": {"x": 150, "y": 200}
}

// Chat message
{
  "type": "chat",
  "message": "What do you think of this change?"
}
```

#### Server → Client

```json
// User joined
{
  "type": "user_joined",
  "user": {
    "id": "usr_xyz",
    "username": "jane_doe"
  }
}

// Node updated by another user
{
  "type": "node_updated",
  "userId": "usr_xyz",
  "nodeId": "node_1",
  "changes": {...}
}

// Chat message
{
  "type": "chat_message",
  "user": "jane_doe",
  "message": "Looking good!"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid auth |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Maintenance |

## Example: Complete Workflow

```python
import requests

API_URL = "https://api.shaderforge.ai/api/v1"
API_KEY = "your_api_key"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 1. Generate shader with AI
response = requests.post(
    f"{API_URL}/ai/generate",
    headers=headers,
    json={
        "prompt": "realistic water caustics",
        "style": "realistic",
        "complexity": "medium"
    }
)
shader_data = response.json()

# 2. Save shader
response = requests.post(
    f"{API_URL}/shaders",
    headers=headers,
    json={
        "name": "My Water Shader",
        "code": shader_data["shader"]["code"],
        "language": "glsl",
        "category": "materials",
        "tags": ["water", "realistic"]
    }
)
shader_id = response.json()["id"]

# 3. Search similar shaders
response = requests.get(
    f"{API_URL}/search/similar/{shader_id}",
    headers=headers,
    params={"limit": 5}
)
similar = response.json()

# 4. Export to Unity
response = requests.post(
    f"{API_URL}/export/unity",
    headers=headers,
    json={
        "shaderId": shader_id,
        "renderPipeline": "urp"
    }
)
download_url = response.json()["downloadUrl"]

print(f"Shader created: {shader_id}")
print(f"Download Unity package: {download_url}")
```

---

**Rate Limits**: All endpoints respect rate limiting
**Caching**: GET requests cached for 5 minutes
**Pagination**: Use `limit` and `offset` for large result sets
