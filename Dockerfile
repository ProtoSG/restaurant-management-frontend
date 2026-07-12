# ── Etapa 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Instalar dependencias primero (mejor caché de capas)
COPY package*.json ./
RUN npm ci

# Construir (Vite usa .env.production en modo production)
COPY . .
RUN npm run build

# ── Etapa 2: runtime (nginx) ──────────────────────────────────────────────────
FROM nginx:alpine

# Parchar paquetes del SO de la base (p.ej. libexpat, c-ares) a la última versión
# de Alpine. CACHEBUST invalida esta capa en cada build — con cache-to: type=gha
# el resultado de "apk upgrade" quedaba cacheado indefinidamente y nunca traía
# CVEs parchados después del build inicial.
ARG CACHEBUST=1
RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
