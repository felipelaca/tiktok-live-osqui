# 🎰 TikTok Live Ruleta

Aplicación de ruleta interactiva en tiempo real para streams de TikTok Live con panel de administración completo.

## 🚀 Características

- ✅ **Ruleta interactiva** con canvas HTML5
- ✅ **Sincronización en tiempo real** via WebSockets
- ✅ **Panel de administración** responsivo
- ✅ **Gestión completa de opciones** (CRUD)
- ✅ **Persistencia de datos** en archivos JSON
- ✅ **Audio integrado** con Web Audio API
- ✅ **Diseño responsivo** para móvil y desktop
- ✅ **Auto-desactivación** de ganadores
- ✅ **Sistema de backups**

## 📱 Páginas

- `/admin` - Panel de administración completo
- `/ruleta` - Vista de ruleta para overlay de streaming

## 🐳 Despliegue con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Opción 2: Docker Manual

```bash
# Construir imagen
docker build -t tiktok-ruleta .

# Ejecutar contenedor
docker run -d -p 3000:3000 -v ruleta-data:/app/data --name tiktok-ruleta tiktok-ruleta
```

## 🔧 Portainer

### Para subir a Portainer:

1. **Comprimir el proyecto:**
   ```bash
   # Desde la carpeta del proyecto
   tar -czf tiktok-ruleta.tar.gz .
   ```

2. **En Portainer:**
   - Ve a "Stacks" → "Add stack"
   - Nombre: `tiktok-ruleta`
   - Selecciona "Upload" 
   - Sube el archivo `docker-compose.yml`
   - O copia/pega el contenido del docker-compose.yml
   - Click "Deploy the stack"

3. **Variables de entorno (opcional):**
   - `NODE_ENV=production`

## 🌐 Acceso

Una vez desplegado:
- **Aplicación:** `http://tu-servidor:3000`
- **Admin:** `http://tu-servidor:3000/admin`
- **Ruleta:** `http://tu-servidor:3000/ruleta`

## 💾 Datos Persistentes

Los datos se guardan en el volumen `ruleta-data:/app/data` que incluye:
- Opciones de la ruleta
- Historial de resultados
- Backups automáticos

## 🔧 Desarrollo Local

```bash
npm install
npm run dev
```

## 📋 Tecnologías

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Express.js, Socket.IO
- **Containerización:** Docker, Docker Compose
- **Persistencia:** JSON files
- **Audio:** Web Audio API
