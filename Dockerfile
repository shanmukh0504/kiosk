# 1. Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache \
    make \
    g++ \
    python3 \
    py3-pip \
    libusb-dev \
    libudev-zero-dev \
    linux-headers \
    pkgconfig \
    git

# Set environment variables for native builds
ENV PYTHON=/usr/bin/python3
ENV MAKE=/usr/bin/make
ENV CC=gcc
ENV CXX=g++

ARG VITE_AUTH_URL
ARG VITE_ENVIRONMENT
ARG VITE_INFO_URL
ARG VITE_NETWORK
ARG VITE_RELAYER_URL
ARG VITE_REWARD_URL
ARG VITE_ORDERBOOK_URL
ARG VITE_QUOTE_URL
ARG VITE_STAKING_URL
ARG VITE_STARKNET_URL
ARG VITE_EXPLORER_URL

ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_INFO_URL=$VITE_INFO_URL
ENV VITE_NETWORK=$VITE_NETWORK
ENV VITE_RELAYER_URL=$VITE_RELAYER_URL
ENV VITE_REWARD_URL=$VITE_REWARD_URL
ENV VITE_ORDERBOOK_URL=$VITE_ORDERBOOK_URL
ENV VITE_QUOTE_URL=$VITE_QUOTE_URL
ENV VITE_STAKING_URL=$VITE_STAKING_URL
ENV VITE_STARKNET_URL=$VITE_STARKNET_URL
ENV VITE_EXPLORER_URL=$VITE_EXPLORER_URL

RUN corepack enable && corepack prepare yarn@4.5.1 --activate
RUN echo "nodeLinker: node-modules" > .yarnrc.yml && \
    echo "enableGlobalCache: false" >> .yarnrc.yml && \
    echo "preferInteractive: false" >> .yarnrc.yml

COPY package.json yarn.lock ./

# Install dependencies with fallback strategy
RUN yarn install --ignore-optional --frozen-lockfile || \
    yarn install --frozen-lockfile || \
    yarn install --no-lockfile

COPY . .
ENV PATH="/app/node_modules/.bin:${PATH}"
RUN yarn build

# 2. Serve using nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config: MPA + redirect to root on 404
RUN printf "server {\n\
    listen 80;\n\
    server_name _;\n\
\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files \$uri \$uri.html \$uri/ =404;\n\
    }\n\
\n\
    error_page 404 = @redirect_to_root;\n\
    location @redirect_to_root {\n\
        return 302 /;\n\
    }\n\
\n\
    location ~* \\\\.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|otf)\$ {\n\
        expires 6M;\n\
        access_log off;\n\
        add_header Cache-Control \"public\";\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
