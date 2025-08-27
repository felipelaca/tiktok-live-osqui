# 🚨 DIAGNÓSTICO DE PROBLEMAS - CHECKLIST

## ❓ PREGUNTAS PARA DIAGNOSTICAR:

### 1. ¿Qué mensaje de error ves?
- [ ] El stack no se despliega (error en build)
- [ ] El contenedor no arranca (error en runtime)
- [ ] El contenedor arranca pero no responde (error de conectividad)
- [ ] Página no carga (error de red/puerto)

### 2. ¿En qué paso falla?
- [ ] Al hacer build de la imagen Docker
- [ ] Al crear el contenedor
- [ ] Al mapear puertos
- [ ] Al acceder desde el navegador

### 3. ¿Qué ves en Portainer?
- [ ] Stack status: Running/Failed/Building
- [ ] Container status: Running/Exited/Error
- [ ] Logs del contenedor

## 🔧 COMANDOS DE DIAGNÓSTICO

Si tienes acceso SSH a tu servidor, ejecuta estos comandos:

```bash
# 1. Ver todos los contenedores
docker ps -a

# 2. Ver el estado específico del contenedor
docker ps | grep tiktok

# 3. Ver logs del contenedor
docker logs tiktok-ruleta-app

# 4. Ver puertos en uso
netstat -tlnp | grep :3005

# 5. Verificar que Docker funciona
docker --version

# 6. Ver imágenes disponibles
docker images | grep tiktok

# 7. Probar conexión local
curl http://localhost:3005
```

## 🎯 SOLUCIONES COMUNES

### PROBLEMA 1: Build falla
```yaml
# Solución: Build más simple
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:docker
EXPOSE 3005
CMD ["node", "server.js"]
```

### PROBLEMA 2: Puerto ocupado
```bash
# Ver qué usa el puerto
sudo lsof -i :3005
# o cambiar a otro puerto como 8080
```

### PROBLEMA 3: Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 3005

# CentOS/RHEL  
sudo firewall-cmd --permanent --add-port=3005/tcp
sudo firewall-cmd --reload
```

### PROBLEMA 4: Portainer específico
- Usar "Web editor" en lugar de Repository
- Recrear el stack desde cero
- Usar docker-compose directo en terminal

## 🔥 CONFIGURACIÓN DE EMERGENCIA

Si nada funciona, usa esta configuración mínima:

```yaml
version: '3.8'
services:
  tiktok-ruleta:
    image: node:18-alpine
    ports:
      - "3005:3005"
    volumes:
      - .:/app
    working_dir: /app
    command: sh -c "npm install && npm run build:docker && node server.js"
    environment:
      - NODE_ENV=production
      - PORT=3005
      - HOSTNAME=0.0.0.0
    restart: unless-stopped
```
