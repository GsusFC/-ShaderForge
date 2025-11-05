from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from api.nodes import router as nodes_router
from api.glsl_import import router as glsl_import_router

# Cargar variables de entorno
load_dotenv()

app = FastAPI(
    title="ShaderForge AI API",
    description="API para ShaderForge AI - Editor de Shaders con IA",
    version="0.1.0"
)

# Configurar CORS
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,https://shaderforge.netlify.app")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(nodes_router)
app.include_router(glsl_import_router)

# Rutas básicas
@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "ShaderForge AI API",
        "status": "running",
        "version": "0.1.0",
        "docs_url": "/docs"
    }

@app.get("/api/v1/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_prod:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )
