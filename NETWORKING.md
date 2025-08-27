# 🔧 TROUBLESHOOTING - NETWORKING & PUERTOS

## 🚨 Problemas Comunes y Soluciones

### **1. La aplicación no es accesible desde fuera del contenedor**

**Síntoma:** El contenedor corre pero no puedes acceder desde tu navegador

**Solución:**
```bash
# Verificar que el contenedor esté corriendo
docker ps

# Ver los puertos mapeados
docker port tiktok-ruleta-app

# Ver logs del contenedor
docker logs tiktok-ruleta-app
```

### **2. Puerto 3000 ya está ocupado**

**Síntoma:** Error "port already in use" o "address already in use"

**Solución 1 - Cambiar puerto externo:**
En `docker-compose.yml` cambia:
```yaml
ports:
  - "8080:3000"  # Usa puerto 8080 en lugar de 3000
```

**Solución 2 - Ver qué está usando el puerto:**
```bash
# En Windows
netstat -ano | findstr :3000

# En Linux/Mac
netstat -tlnp | grep :3000
```

### **3. Problemas de red en Portainer**

**Síntoma:** El stack se despliega pero no es accesible

**Verificaciones:**
1. **Revisar logs en Portainer:**
   - Ve al stack → View logs
   
2. **Verificar network:**
   - En Portainer: Networks → Verificar que `tiktok-network` existe
   
3. **Revisar healthcheck:**
   - Ve al contenedor → Stats → Health status

### **4. Configuración para diferentes entornos**

#### **🔸 Servidor Local (desarrollo)**
```yaml
ports:
  - "3000:3000"
environment:
  - HOSTNAME=0.0.0.0
```
**Acceso:** `http://localhost:3000`

#### **🔸 Servidor Dedicado (producción)**
```yaml
ports:
  - "80:3000"  # Puerto 80 para HTTP estándar
environment:
  - HOSTNAME=0.0.0.0
```
**Acceso:** `http://tu-ip-servidor`

#### **🔸 Con Proxy Reverso (nginx/traefik)**
```yaml
expose:
  - "3000"
# Sin ports: ya que el proxy maneja la exposición
```

### **5. Variables de Entorno Importantes**

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000                    # Puerto interno del contenedor
  - HOSTNAME=0.0.0.0            # Escuchar en todas las interfaces
```

### **6. Comandos Útiles para Debugging**

```bash
# Ver todos los contenedores
docker ps -a

# Logs en tiempo real
docker logs -f tiktok-ruleta-app

# Ejecutar comando dentro del contenedor
docker exec -it tiktok-ruleta-app sh

# Verificar que la app responde internamente
docker exec -it tiktok-ruleta-app wget -O- http://localhost:3000

# Ver configuración de red
docker network ls
docker network inspect tiktok-live-osqui_tiktok-network
```

### **7. Firewall y Seguridad**

Si estás en un servidor VPS/dedicado, asegúrate de:

```bash
# Ubuntu/Debian - Abrir puerto
sudo ufw allow 3000

# CentOS/RHEL - Abrir puerto
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### **8. Testing de Conectividad**

```bash
# Desde el host, probar conexión
curl http://localhost:3000

# Desde otra máquina en la red
curl http://IP-DEL-SERVIDOR:3000

# Verificar que Socket.IO funciona
curl http://localhost:3000/socket.io/
```

## ✅ **Configuración Recomendada Final**

Para la mayoría de casos, esta configuración funciona:

```yaml
version: '3.8'
services:
  tiktok-ruleta:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - HOSTNAME=0.0.0.0
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```
