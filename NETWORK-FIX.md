# 🔥 FIX URGENTE - PROBLEMAS DE RED EN PORTAINER

## 🚨 El contenedor no se conecta a la red

### **SOLUCIÓN 1: Usar configuración simplificada (RECOMENDADO)**

Usa el archivo `docker-compose.yml` principal que ahora está simplificado sin redes personalizadas.

### **SOLUCIÓN 2: Si sigue sin funcionar**

En Portainer, en lugar de usar el `docker-compose.yml`, usa **Web editor** y pega esto:

```yaml
version: '3.8'

services:
  tiktok-ruleta:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ruleta-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
    restart: unless-stopped
    network_mode: "bridge"

volumes:
  ruleta-data:
```

### **SOLUCIÓN 3: Modo Host (para casos desesperados)**

Si nada funciona, usa **modo host**:

```yaml
version: '3.8'

services:
  tiktok-ruleta:
    build: .
    network_mode: "host"
    volumes:
      - ruleta-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
    restart: unless-stopped

volumes:
  ruleta-data:
```

⚠️ **Nota:** En modo host, el contenedor usa directamente la red del servidor.

### **SOLUCIÓN 4: Puerto alternativo**

Si el puerto 3000 está ocupado:

```yaml
version: '3.8'

services:
  tiktok-ruleta:
    build: .
    ports:
      - "8080:3000"  # Accede vía puerto 8080
    volumes:
      - ruleta-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
    restart: unless-stopped

volumes:
  ruleta-data:
```

## 🔍 DEBUGGING RÁPIDO

### En Portainer:

1. **Ve al Stack** → **Containers** → Click en tu contenedor
2. **Logs**: Verifica que diga `> Ready on http://0.0.0.0:3000`
3. **Inspect**: Busca la sección "NetworkSettings" → "Ports"
4. **Stats**: Ve si el contenedor está consumiendo CPU/RAM

### Comandos desde terminal del servidor:

```bash
# Ver si el contenedor está corriendo
docker ps | grep tiktok

# Ver puertos mapeados
docker port tiktok-ruleta-app

# Ver logs
docker logs tiktok-ruleta-app

# Probar conexión local
curl http://localhost:3000

# Ver qué está usando el puerto
netstat -tlnp | grep :3000
```

## 🎯 PASO A PASO PARA ARREGLAR

1. **Detén el stack actual** en Portainer
2. **Borra el stack** completamente
3. **Crea un nuevo stack** con el nombre `tiktok-ruleta-v2`
4. **Usa la configuración simplificada** (docker-compose.yml actual)
5. **Deploy**

Si sigue sin funcionar:
1. **Intenta con modo bridge** (docker-compose.bridge.yml)
2. **Como último recurso usa modo host** (docker-compose.host.yml)

## ✅ VERIFICACIÓN FINAL

Una vez que funcione, deberías ver:

- **En logs**: `> Ready on http://0.0.0.0:3000`
- **En browser**: `http://TU-IP-SERVIDOR:3000` debe cargar la página
- **Admin panel**: `http://TU-IP-SERVIDOR:3000/admin`
- **Ruleta**: `http://TU-IP-SERVIDOR:3000/ruleta`
