# apps/upload-service/Dockerfile
FROM node:20-slim AS base
WORKDIR /app
# upload-service clones repos, so it needs git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# install deps using the root lockfile (workspaces)
COPY package.json package-lock.json ./
COPY apps/upload-service/package.json ./apps/upload-service/
RUN npm ci

# build
COPY . .
RUN npm run build --workspace=upload-service

EXPOSE 3000
CMD ["node", "apps/upload-service/dist/index.js"]