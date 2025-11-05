# 🚀 Guía de Despliegue ShaderForge

## Arquitectura
- **Frontend**: Netlify → `shaderforge.netlify.app`
- **Backend**: Render (Free tier)

---

## Paso 1: Desplegar Backend en Render

### 1.1 Crear cuenta y nuevo servicio
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio GitHub: `GsusFC/-ShaderForge`
4. Branch: `claude/validate-qie-011CUoTjNiHiUqfPJXN1x7bc` (o haz merge a `main` primero)

### 1.2 Configuración del servicio
Render detectará automáticamente el archivo `render.yaml`. Verifica la configuración:

```yaml
Name: shaderforge-backend
Runtime: Python
Region: Oregon (o el más cercano)
Branch: claude/validate-qie-011CUoTjNiHiUqfPJXN1x7bc
Build Command: pip install -r requirements-prod.txt
Start Command: cd src/backend && uvicorn main_prod:app --host 0.0.0.0 --port $PORT
```

### 1.3 Variables de entorno
En la configuración del servicio, agrega:
- `CORS_ORIGINS`: `https://shaderforge.netlify.app,http://localhost:5173`

### 1.4 Deploy
Click en "Create Web Service" y espera a que se despliegue (2-3 minutos)

### 1.5 Obtener URL
Una vez desplegado, copia la URL generada (ejemplo: `https://shaderforge-backend.onrender.com`)

**⚠️ IMPORTANTE**: Guarda esta URL, la necesitarás para el siguiente paso.

---

## Paso 2: Configurar Frontend para usar el Backend

Ahora que tienes la URL del backend, debes configurar el frontend.

### 2.1 Mergear branch a main (recomendado)
```bash
git checkout main
git merge claude/validate-qie-011CUoTjNiHiUqfPJXN1x7bc
git push origin main
```

O continuar usando el branch actual en Netlify.

---

## Paso 3: Desplegar Frontend en Netlify

### 3.1 Crear/Conectar sitio
1. Ve a [netlify.com](https://netlify.com) y accede a tu cuenta
2. Si ya existe `shaderforge.netlify.app`, ve a "Site settings"
3. Si no existe, crea nuevo sitio: "Add new site" → "Import an existing project"

### 3.2 Configuración de Build
Netlify detectará automáticamente el archivo `netlify.toml`:

```toml
Base directory: src/frontend
Build command: npm run build
Publish directory: dist
```

### 3.3 Variables de Entorno (CRÍTICO)
En "Site settings" → "Environment variables" → "Add a variable":

```
Key: VITE_API_URL
Value: https://shaderforge-backend.onrender.com
```

**⚠️ Reemplaza con tu URL real del backend de Render**

### 3.4 Deploy
- Si es nuevo sitio: Click en "Deploy"
- Si es sitio existente: "Deploys" → "Trigger deploy" → "Deploy site"

### 3.5 Configurar dominio personalizado (ya está)
En "Domain settings" verifica que esté configurado: `shaderforge.netlify.app`

---

## Paso 4: Verificación

### 4.1 Verificar Backend
Abre en tu navegador:
```
https://shaderforge-backend.onrender.com
```

Deberías ver:
```json
{
  "message": "ShaderForge AI API",
  "status": "running",
  "version": "0.1.0",
  "docs_url": "/docs"
}
```

### 4.2 Verificar Frontend
Abre: `https://shaderforge.netlify.app`

1. Click en botón "💡 Ejemplo"
2. Deberían aparecer 3 nodos conectados
3. El preview debería mostrar un patrón de ruido Perlin
4. El panel de código debe mostrar GLSL generado

### 4.3 Test de compilación
1. Arrastra nodos desde el panel "Nodos"
2. Conecta algunos nodos
3. Verifica que aparezca código GLSL en el panel inferior
4. Verifica que el preview se actualice automáticamente

---

## Problemas Comunes

### Backend no responde
- Verifica que el servicio en Render esté "Running"
- Revisa los logs en Render Dashboard
- El free tier de Render se duerme después de 15min de inactividad (primera carga puede tardar 30s)

### Frontend muestra errores de CORS
- Verifica que `CORS_ORIGINS` en Render incluya `https://shaderforge.netlify.app`
- Redeploy el backend después de cambiar variables de entorno

### Frontend no se conecta al backend
- Verifica que `VITE_API_URL` en Netlify esté correcta
- Redeploy el frontend después de cambiar variables de entorno
- Abre la consola del navegador (F12) para ver errores específicos

### Shader no compila
- Revisa el panel de errores en la parte inferior
- Verifica que el backend esté respondiendo en `/api/v1/health`

---

## Comandos Útiles

### Ver logs del backend
En Render Dashboard → Tu servicio → "Logs"

### Forzar redeploy del frontend
```bash
# Trigger deploy from CLI
netlify deploy --prod
```

### Test local antes de deploy
```bash
# Backend
cd src/backend
python main_prod.py

# Frontend (en otra terminal)
cd src/frontend
VITE_API_URL=http://localhost:8000 npm run dev
```

---

## URLs Finales

✅ **Frontend**: https://shaderforge.netlify.app
✅ **Backend**: https://[tu-servicio].onrender.com
✅ **API Docs**: https://[tu-servicio].onrender.com/docs

---

¡Listo! 🎉 ShaderForge está desplegado en producción.
