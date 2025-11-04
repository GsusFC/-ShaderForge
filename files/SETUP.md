# Setup Files for ShaderForge AI

## Frontend Package (package.json)

```json
{
  "name": "shaderforge-ai-frontend",
  "version": "0.1.0",
  "private": true,
  "description": "Node-based shader editor powered by AI",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.93.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "react-router-dom": "^6.20.1",
    "@tanstack/react-query": "^5.14.2",
    "monaco-editor": "^0.45.0",
    "@monaco-editor/react": "^4.6.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "framer-motion": "^10.16.16",
    "react-hot-toast": "^2.4.1",
    "react-markdown": "^9.0.1",
    "socket.io-client": "^4.6.0",
    "prismjs": "^1.29.0",
    "react-syntax-highlighter": "^15.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/three": "^0.160.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "prettier": "^3.1.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## Backend Requirements (requirements.txt)

```txt
# Core Framework
fastapi==0.108.0
uvicorn[standard]==0.25.0
python-multipart==0.0.6
pydantic==2.5.3
pydantic-settings==2.1.0

# Database
asyncpg==0.29.0
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9

# Vector Database
pinecone-client==3.0.0
# Alternative: weaviate-client==3.25.3

# AI/ML
anthropic==0.8.0
openai==1.6.1
tiktoken==0.5.2

# Data Processing
numpy==1.26.2
pandas==2.1.4

# Web Scraping
aiohttp==3.9.1
beautifulsoup4==4.12.2
requests==2.31.0

# Parsing
pygments==2.17.2
lark-parser==0.12.0

# Caching
redis==5.0.1
hiredis==2.3.2

# Auth & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0

# Testing
pytest==7.4.3
pytest-asyncio==0.23.2
pytest-cov==4.1.0
httpx==0.26.0

# Development
black==23.12.1
isort==5.13.2
mypy==1.7.1
pylint==3.0.3

# Monitoring
sentry-sdk==1.39.1
python-json-logger==2.0.7

# Utils
python-dateutil==2.8.2
pytz==2023.3.post1
```

## Python Version

```
Python 3.11+
```

## Docker Setup

### Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Backend API
  backend:
    build:
      context: ./src/backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src/backend:/app
    command: uvicorn main:app --reload --host 0.0.0.0 --port 8000

  # Frontend
  frontend:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./src/frontend:/app
      - /app/node_modules
    command: npm run dev -- --host

  # PostgreSQL
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

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # PgAdmin (optional)
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
```

## Environment Variables

### Backend (.env)

```env
# Application
APP_NAME=ShaderForge AI
APP_ENV=development
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shaderforge

# Redis
REDIS_URL=redis://localhost:6379

# AI APIs
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# Vector Database
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX=shaderforge-embeddings

# Shadertoy
SHADERTOY_API_KEY=your_shadertoy_key

# GitHub
GITHUB_TOKEN=your_github_token

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_FREE=100
RATE_LIMIT_PRO=1000

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=ShaderForge AI
VITE_SENTRY_DSN=your_sentry_dsn
```

## Installation Instructions

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/shaderforge-ai.git
cd shaderforge-ai

# Start with Docker Compose
docker-compose up -d

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# PgAdmin: http://localhost:5050
```

### Manual Setup

#### Backend

```bash
cd src/backend

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
createdb shaderforge
alembic upgrade head

# Run development server
uvicorn main:app --reload
```

#### Frontend

```bash
cd src/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add users table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Testing

```bash
# Backend tests
cd src/backend
pytest

# Frontend tests
cd src/frontend
npm test

# Coverage report
pytest --cov=. --cov-report=html
```

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/node-editor

# Make changes...

# Run tests
npm test  # Frontend
pytest    # Backend

# Commit
git add .
git commit -m "feat: add node editor component"

# Push
git push origin feature/node-editor

# Create Pull Request
```

### Code Quality

```bash
# Format Python code
black src/backend
isort src/backend

# Lint Python
pylint src/backend
mypy src/backend

# Format TypeScript
cd src/frontend
npm run format
npm run lint
```

## Production Deployment

### Environment Setup

```bash
# Production environment variables
export APP_ENV=production
export DEBUG=False
# ... other vars
```

### Build Frontend

```bash
cd src/frontend
npm run build
# Output: dist/
```

### Deploy Backend

```bash
cd src/backend
# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Hosting Options

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, AWS ECS, Google Cloud Run
- **Database**: Supabase, Neon, AWS RDS
- **Vector DB**: Pinecone Cloud, Weaviate Cloud

## Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Database connection error**:
```bash
# Check PostgreSQL is running
pg_isready

# Reset database
dropdb shaderforge
createdb shaderforge
alembic upgrade head
```

**npm install fails**:
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## VS Code Setup

### Recommended Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens"
  ]
}
```

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

---

**Ready to code!** 🚀

Next steps:
1. Clone repository
2. Run `docker-compose up`
3. Start coding!
