# Stage 1: Build the project using Node.js
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install Corepack and set Yarn version
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

# Copy package files first to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies using Yarn 4.5.1
RUN yarn install --immutable

# Copy the rest of the application files
COPY . .

# Build the project
RUN yarn build

# Stage 2: Serve the built files using Nginx
FROM nginx:alpine AS server

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built files from builder stage
COPY --from=builder /app/dist .

# Copy the updated Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
