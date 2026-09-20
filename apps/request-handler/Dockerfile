FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/request-handler/package.json ./apps/request-handler/
RUN npm ci

COPY . .
RUN npm run build --workspace=request-handler

EXPOSE 3001
CMD ["node", "apps/request-handler/dist/index.js"]