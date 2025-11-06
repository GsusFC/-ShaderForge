# ShaderForge - Guía de Deployment

Esta guía cubre el deployment completo de ShaderForge (backend + frontend).

## 📋 Tabla de Contenidos

1. [Backend (Render)](#backend-render)
2. [Frontend (Netlify)](#frontend-netlify)
3. [Variables de Entorno](#variables-de-entorno)
4. [Verificación](#verificación)

---

## 🖥️ Backend (Render)

### Configuración Inicial

El backend ya está configurado en Render usando `render.yaml`.

**Service:** `shaderforge-backend`
**URL:** https://shaderforge.onrender.com
**Branch:** `claude/validate-qie-011CUoTjNiHiUqfPJXN1x7bc`

### Variables de Entorno Requeridas

**⚠️ IMPORTANTE:** Debes configurar estas variables manualmente en el dashboard de Render.

#### Paso 1: Ir al Dashboard

1. Ve a: https://dashboard.render.com/
2. Selecciona el servicio **shaderforge-backend**
3. Ve a la pestaña **Environment**

#### Paso 2: Agregar Variables

Agrega las siguientes variables de entorno:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | **REQUERIDO** - Tu API key de Anthropic |
| `CORS_ORIGINS` | `https://shaderforge.netlify.app,http://localhost:5173` | Orígenes permitidos para CORS |
| `PYTHON_VERSION` | `3.11` | Versión de Python (ya configurada en render.yaml) |

#### Paso 3: Guardar y Redesplegar

1. Haz clic en **Save Changes**
2. El servicio se redesplegará automáticamente
3. Espera ~2-3 minutos para que complete el build

### Cómo Agregar ANTHROPIC_API_KEY

```
1. Dashboard → shaderforge-backend → Environment
2. Click "Add Environment Variable"
3. Key: ANTHROPIC_API_KEY
4. Value: [Tu API key de Anthropic - sk-ant-api03-...]
5. Click "Save Changes"
```

**Nota**: Usa el API key que te proporcionaron por separado. Nunca commitees API keys al repositorio.

### Verificar Deploy

Después del deploy, verifica que el backend esté funcionando:

```bash
curl https://shaderforge.onrender.com/
```

Deberías ver:
```json
{
  "name": "ShaderForge AI API",
  "version": "1.0.0",
  "status": "healthy"
}
```

---

## 🌐 Frontend (Netlify)

### Configuración Inicial

El frontend ya está configurado en Netlify usando `netlify.toml`.

**Site:** `shaderforge.netlify.app`
**Branch:** `claude/validate-qie-011CUoTjNiHiUqfPJXN1x7bc`

### Variables de Entorno Requeridas

#### Paso 1: Ir al Dashboard

1. Ve a: https://app.netlify.com/
2. Selecciona el site **shaderforge**
3. Ve a **Site settings** → **Environment variables**

#### Paso 2: Agregar Variables

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://shaderforge.onrender.com` | URL del backend en Render |
| `NODE_VERSION` | `18` | Versión de Node.js |

#### Paso 3: Redesplegar

1. Ve a **Deploys**
2. Click **Trigger deploy** → **Deploy site**

### Verificar Deploy

Después del deploy, verifica que el frontend esté funcionando:

1. Abre: https://shaderforge.netlify.app
2. Verifica que cargue correctamente
3. Haz clic en "Nodos" → Deberías ver 70+ nodos organizados por categoría
4. Prueba el botón "Importar" → Modal de importar GLSL con IA debería aparecer

---

## 🔐 Variables de Entorno

### Backend (.env)

Para desarrollo local, crea `.env` en la raíz del proyecto:

```bash
# Copiar ejemplo
cp .env.example .env

# Editar valores
ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui
CORS_ORIGINS=http://localhost:5173,https://shaderforge.netlify.app
PORT=8000
```

### Frontend (.env)

Para desarrollo local, crea `src/frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

---

## ✅ Verificación Completa

### Checklist de Deploy

Backend (Render):
- [ ] Variable `ANTHROPIC_API_KEY` configurada
- [ ] Variable `CORS_ORIGINS` configurada
- [ ] Deploy exitoso (sin errores)
- [ ] Health check funciona: `curl https://shaderforge.onrender.com/`

Frontend (Netlify):
- [ ] Variable `VITE_API_URL` configurada
- [ ] Deploy exitoso (sin errores TypeScript)
- [ ] Site carga correctamente
- [ ] Palette muestra 70+ nodos

Funcionalidades:
- [ ] Ejemplo shader funciona (UV → Perlin Noise → Output)
- [ ] Custom Code node visible en palette (Utility category)
- [ ] Botón "Importar" visible en toolbar
- [ ] Modal de importar GLSL se abre correctamente

### Probar Integración Completa

1. **LYGIA Support**:
   - Agregar Custom Code node
   - Escribir:
     ```glsl
     #include "lygia/generative/random.glsl"
     float output = random(input1);
     ```
   - Compilar → Debería resolver el include automáticamente

2. **GLSL Import con IA**:
   - Click en "Importar"
   - Pegar código GLSL de ejemplo
   - Click "Importar con IA"
   - Verificar que genera nodos correctamente

---

## 🐛 Troubleshooting

### Backend no compila (Render)

**Error**: `pydantic_core requires Rust compilation`

**Solución**:
```bash
# Ya resuelto en commit 049de77
# requirements-prod.txt usa pydantic>=2.6.0 con wheels precompilados
```

### Frontend: TypeScript errors

**Error**: `Type '"text"' is not assignable to type 'ParameterType'`

**Solución**:
```bash
# Ya resuelto en commit a544377
# src/frontend/src/types/nodeDefinitions.ts incluye 'text'
```

### GLSL Import no funciona

**Causa**: API key no configurada o incorrecta

**Verificar**:
```bash
# En Render dashboard, verificar que ANTHROPIC_API_KEY está configurada
# Ver logs: Dashboard → Logs
```

### LYGIA includes no resuelven

**Causa**: Backend no tiene `requests` instalado o red bloqueada

**Verificar**:
```bash
# requirements-prod.txt debe incluir:
requests>=2.31.0
```

---

## 📊 Stack Actual

### Backend
- **Platform**: Render (Free tier)
- **Runtime**: Python 3.11
- **Framework**: FastAPI 0.110+
- **Features**:
  - Node compilation (70+ nodes)
  - GLSL validation
  - LYGIA resolver (automatic #include)
  - AI-powered GLSL import (Anthropic Claude)

### Frontend
- **Platform**: Netlify
- **Runtime**: Node.js 18
- **Framework**: React + Vite
- **Features**:
  - ReactFlow node editor
  - 70+ nodes en palette dinámico
  - Custom Code con LYGIA support
  - AI-powered GLSL import UI
  - Three.js shader preview

---

## 🔗 Links Útiles

- **Backend**: https://shaderforge.onrender.com
- **Frontend**: https://shaderforge.netlify.app
- **Render Dashboard**: https://dashboard.render.com/
- **Netlify Dashboard**: https://app.netlify.com/
- **LYGIA Library**: https://lygia.xyz
- **Anthropic Console**: https://console.anthropic.com/

---

## 📝 Notas de Seguridad

⚠️ **NUNCA** commitees el archivo `.env` con API keys reales.

✅ `.env` está en `.gitignore` (línea 34)
✅ Usa `.env.example` como template
✅ Configura API keys solo en dashboards de Render/Netlify
