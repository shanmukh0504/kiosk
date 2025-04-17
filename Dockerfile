# 1. Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Enable Corepack and install the correct Yarn version
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

# Create .yarnrc.yml file with node-modules linker
RUN echo "nodeLinker: node-modules" > .yarnrc.yml

# Copy package.json and yarn.lock first
COPY package.json yarn.lock ./

# Install dependencies using Yarn 4
RUN yarn install

# Copy the rest of the files (including all TypeScript configs)
COPY . .

# Make sure TypeScript is accessible in the path
ENV PATH="/app/node_modules/.bin:${PATH}"

# Build the project
RUN yarn build

# 2. Serve using nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]