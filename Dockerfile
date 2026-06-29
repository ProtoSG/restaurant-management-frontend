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

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
