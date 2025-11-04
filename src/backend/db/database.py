"""
Database connection and initialization for ShaderForge AI
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

from .models import Base

# Database URL from environment or default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./shaderforge.db"  # Fallback to SQLite for development
)

# Create engine
# Use NullPool for SQLite and others that don't handle connections well
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    poolclass=NullPool if "sqlite" in DATABASE_URL else None,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """
    Dependency injection for database session
    
    Usage in FastAPI:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize database - create all tables
    
    Should be called once on startup
    """
    Base.metadata.create_all(bind=engine)

def drop_db():
    """
    Drop all tables - for development/testing only
    """
    Base.metadata.drop_all(bind=engine)

def reset_db():
    """
    Reset database - drop and recreate all tables
    """
    drop_db()
    init_db()
