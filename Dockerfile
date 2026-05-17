# ============================================================
# Dockerfile — Frontend React (Business Pulse)
# Stratégie : Multi-stage Node.js → Nginx
# Stage 1 : Build Vite/React → dist/
# Stage 2 : Nginx Alpine pour servir les statics
# ============================================================

# ─────────────────────────────────────────────
# STAGE 1 : Build Node.js
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

# Variables de build injectées par le CI
ARG VITE_API_URL=https://api.yourdomain.com
ARG VITE_ENV=production
ARG BUILD_VERSION=1.0.0

# Métadonnées
LABEL stage="builder"

# Installation des dépendances OS minimales
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

WORKDIR /app

# ─── Optimisation cache npm ───
# Copie package*.json avant le code source
# Permet de réutiliser le cache si les dépendances n ont pas changé
COPY package.json package-lock.json* ./

# Installation des dépendances avec cache npm
RUN npm ci \
    --prefer-offline \
    --no-audit \
    --progress=false

# Copie du code source
COPY . .

# Variables d environnement pour Vite (exposées au build)
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_ENV=${VITE_ENV} \
    VITE_BUILD_VERSION=${BUILD_VERSION} \
    NODE_ENV=production

# Build de production Vite
RUN npm run build && \
    echo "✅ Build terminé" && \
    ls -la dist/

# ─────────────────────────────────────────────
# STAGE 2 : Serveur Nginx (image finale minimale)
# ~25MB au total vs ~800MB pour Node
# ─────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Métadonnées OCI
LABEL org.opencontainers.image.title="Business Pulse Frontend" \
      org.opencontainers.image.description="Application React — Dashboard Business Intelligence"

# ─── Configuration Nginx custom ───
# Suppression de la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Config Nginx optimisée pour SPA React avec React Router
COPY <<'EOF' /etc/nginx/conf.d/app.conf
# Configuration Nginx pour SPA React
server {
    listen 80;
    listen [::]:80;
    server_name _;

    # Répertoire racine des fichiers statiques
    root /usr/share/nginx/html;
    index index.html;

    # ─── Compression Gzip ───
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        image/svg+xml;

    # ─── Cache-Control par type de fichier ───
    # Assets avec hash → cache long terme (1 an)
    location ~* \.(js|css|woff2?|ttf|svg|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # index.html → pas de cache (toujours récupérer la dernière version)
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # ─── React Router (SPA) ───
    # Toutes les routes renvoient index.html pour le routage côté client
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ─── Healthcheck endpoint ───
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # ─── Sécurité HTTP Headers ───
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

# Copie des fichiers buildés depuis le stage Node
COPY --from=builder /app/dist /usr/share/nginx/html

# Port d écoute
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s \
            --timeout=5s \
            --start-period=10s \
            --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

# Nginx gère lui-même les signaux, pas besoin de CMD custom
CMD ["nginx", "-g", "daemon off;"]