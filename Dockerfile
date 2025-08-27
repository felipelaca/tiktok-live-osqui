# Usar Node.js 18 como base - Dockerfile simplificado
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Copiar package files
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Crear directorio para datos
RUN mkdir -p /app/data

# Construir la aplicación Next.js
RUN npm run build:docker

# Exponer puerto
EXPOSE 3005

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3005
ENV HOSTNAME=0.0.0.0

# Comando de inicio
CMD ["node", "server.js"]
