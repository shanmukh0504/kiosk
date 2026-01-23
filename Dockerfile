# syntax=docker/dockerfile:1

# --- Builder: Node 24 base with Bun installed for package management ---
FROM node:24-bullseye-slim AS builder

WORKDIR /app

# Install minimal build dependencies and curl for installing Bun
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    python3 \
    ca-certificates \
    unzip \
    git && rm -rf /var/lib/apt/lists/*

# Install Bun (pinned) and ensure it's on PATH
RUN curl -fsSL https://bun.com/install | bash

# Add Bun's bin directory to the PATH environment variable for all subsequent commands
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

# Increase Node.js heap size to prevent out-of-memory errors during build
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Copy package manifests first to leverage Docker cache (include bun.lock if present)
COPY package.json bun.lock ./

# Install dependencies with Bun (frozen lock for reproducibility when bun.lock exists)
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .
 
# Copy source and run the build using Bun command
RUN bun run build


# --- Production: serve built assets with nginx ---
FROM nginx:stable-alpine AS production

# Clean default content and copy built assets
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx for SPA
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    \n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # Enable gzip compression\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;\n\
    \n\
    location / {\n\
        try_files $uri $uri.html $uri/ /index.html;\n\
    }\n\
    \n\
    # Cache static assets\n\
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|otf|wasm)$ {\n\
        expires 1m;\n\
        access_log off;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    \n\
    # Security headers\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header Content-Security-Policy "frame-ancestors *;" always;\n\
}\n' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]