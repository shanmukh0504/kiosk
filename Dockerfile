# syntax=docker/dockerfile:1
FROM oven/bun:1.1.29 AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (skip scripts to avoid native module build issues in Docker)
RUN bun install --ignore-scripts

# Copy source
COPY . .

# Build (disable topLevelAwait plugin due to Bun compatibility issues in Docker)
# See: https://github.com/oven-sh/bun/issues/9860
ENV SKIP_TOP_LEVEL_AWAIT=true
RUN bun run build

FROM nginx:1.27-alpine AS production

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
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

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]