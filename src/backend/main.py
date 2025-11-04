from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from api.search import router as search_router
from api.nodes import router as nodes_router
from api.ai import router as ai_router
from api.shaders import router as shaders_router
from db.database import init_db

# Cargar variables de entorno
load_dotenv()

app = FastAPI(
    title="ShaderForge AI API",
    description="API para ShaderForge AI - Editor de Shaders con IA",
    version="0.1.0"
)

# Configurar CORS
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(search_router)
app.include_router(nodes_router)
app.include_router(ai_router)
app.include_router(shaders_router)

# Inicializar base de datos
@app.on_event("startup")
def startup_event():
    """Inicializar BD al startup"""
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️ Database initialization error: {e}")

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
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
