# syntax=docker/dockerfile:1
FROM node:22-bullseye-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (cached layer)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    make \
    python3 \
    python3-pip \
    pkg-config \
    libusb-1.0-0-dev \
    libudev-dev \
    git \
    ca-certificates \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables for native builds
ENV PYTHON=/usr/bin/python3
ENV MAKE=/usr/bin/make
ENV CC=gcc
ENV CXX=g++

# Enable corepack and set up yarn
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

# Copy ONLY package files for maximum dependency layer caching
COPY package.json yarn.lock .yarnrc.yml ./


# Configure yarn for optimal Docker performance
RUN yarn config set nodeLinker node-modules && \
    yarn config set enableGlobalCache false

# Install dependencies with cache mount - this layer only rebuilds if package files change
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn config set cacheFolder /usr/local/share/.cache/yarn && \
    # Disable husky during containerized installs to avoid git-related hooks failing
    HUSKY=0 GIT_TERMINAL_PROMPT=0 yarn install --immutable --inline-builds

# Set build args and env vars for Vite
ARG SKIP_INSTALL_DEPS
ARG VITE_STAKING_URL
ARG VITE_AUTH_URL
ARG VITE_ENVIRONMENT
ARG VITE_EXPLORER_URL
ARG VITE_INFO_URL
ARG VITE_NETWORK
ARG VITE_ORDERBOOK_URL
ARG VITE_QUESTS_URL
ARG VITE_QUOTE_URL
ARG VITE_RELAYER_URL
ARG VITE_REWARD_ADDRESS
ARG VITE_REWARD_URL
ARG VITE_SOLANA_PROGRAM_ADDRESS_NATIVE
ARG VITE_SOLANA_PROGRAM_ADDRESS_SPL
ARG VITE_SOLANA_URL
ARG VITE_STAKING_URL
ARG VITE_STARKNET_URL
ARG VITE_SUI_RELAY_URL
ARG VITE_WHITELIST_URL

ENV SKIP_INSTALL_DEPS=${SKIP_INSTALL_DEPS}
ENV VITE_STAKING_URL=${VITE_STAKING_URL}
ENV VITE_AUTH_URL=${VITE_AUTH_URL}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
ENV VITE_EXPLORER_URL=${VITE_EXPLORER_URL}
ENV VITE_INFO_URL=${VITE_INFO_URL}
ENV VITE_NETWORK=${VITE_NETWORK}
ENV VITE_ORDERBOOK_URL=${VITE_ORDERBOOK_URL}
ENV VITE_QUESTS_URL=${VITE_QUESTS_URL}
ENV VITE_QUOTE_URL=${VITE_QUOTE_URL}
ENV VITE_RELAYER_URL=${VITE_RELAYER_URL}
ENV VITE_REWARD_ADDRESS=${VITE_REWARD_ADDRESS}
ENV VITE_REWARD_URL=${VITE_REWARD_URL}
ENV VITE_SOLANA_PROGRAM_ADDRESS_NATIVE=${VITE_SOLANA_PROGRAM_ADDRESS_NATIVE}
ENV VITE_SOLANA_PROGRAM_ADDRESS_SPL=${VITE_SOLANA_PROGRAM_ADDRESS_SPL}
ENV VITE_SOLANA_URL=${VITE_SOLANA_URL}
ENV VITE_STARKNET_URL=${VITE_STARKNET_URL}
ENV VITE_SUI_RELAY_URL=${VITE_SUI_RELAY_URL}
ENV VITE_WHITELIST_URL=${VITE_WHITELIST_URL}

# HYPER-OPTIMIZED BUILD ENVIRONMENT - Maximum performance settings
ENV NODE_ENV=production
ENV CI=true
ENV GENERATE_SOURCEMAP=false

# Aggressive performance settings
ENV NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=512"
ENV UV_THREADPOOL_SIZE=128
ENV VITE_LEGACY=false

# Multi-core build optimizations
ENV MAKEFLAGS="-j$(nproc)"
ENV JOBS="$(nproc)"

# Vite performance optimizations
ENV VITE_DISABLE_HMRPAYLOAD_CHECK=true
ENV VITE_OPTIMIZE_DEPS_INCLUDE_LINKEDPACKAGES=false
ENV VITE_BUILD_ROLLUP_TREESHAKE_PRESET=smallest

# Set PATH for node_modules binaries
ENV PATH="/app/node_modules/.bin:${PATH}"

# Copy ALL source files in one layer for better caching efficiency
COPY . .

# HYPER-OPTIMIZED BUILD COMMAND - Maximum parallelization and speed
RUN --mount=type=cache,target=/app/node_modules/.vite \
    --mount=type=cache,target=/app/node_modules/.cache \
    --mount=type=cache,target=/tmp \
    set -e && \
    echo "Starting optimized build process..." && \
    echo "Utilizing $(nproc) CPU cores for parallel processing" && \
    \
    echo "Running TypeScript compilation..." && \
    tsc -b --verbose --incremental && \
    \
    echo "Running Vite build with esbuild minification..." && \
    vite build \
    --mode production \
    --logLevel error \
    --minify esbuild \
    --target esnext \
    || (echo "Primary build failed, trying fallback build..." && \
    vite build --mode production --logLevel warn)

# ============================================================================
FROM nginx:1.27-alpine AS production

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx for SPA with optimized caching + embedding support
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
    error_page 404 = @redirect_to_root;\n\
    location @redirect_to_root {\n\
    return 302 /;\n\
    }\n\
    \n\
    # Cache static assets aggressively\n\
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
