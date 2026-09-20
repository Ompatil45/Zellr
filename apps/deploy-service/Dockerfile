FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/deploy-service/package.json ./apps/deploy-service/
RUN npm ci

COPY . .
RUN npm run build --workspace=deploy-service

# No EXPOSE — it's a background worker, not an HTTP server
CMD ["node", "apps/deploy-service/dist/index.js"]