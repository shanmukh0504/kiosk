FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# First, copy only the files needed for installation
COPY package.json yarn.lock .yarnrc.yml* ./


# Enable Corepack and install correct Yarn version
RUN corepack enable \
    && corepack prepare yarn@4.5.1 --activate

# Install dependencies
RUN yarn install --frozen-lockfile

# Now copy the source code, excluding node_modules
COPY . .

# Build the project
RUN yarn build

# Use Nginx for the final image
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]