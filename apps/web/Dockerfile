FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_UPLOAD_API_URL
ENV NEXT_PUBLIC_UPLOAD_API_URL=$NEXT_PUBLIC_UPLOAD_API_URL
ARG NEXT_PUBLIC_SITE_DOMAIN
ENV NEXT_PUBLIC_SITE_DOMAIN=$NEXT_PUBLIC_SITE_DOMAIN

RUN npm run build --workspace=web

FROM node:20-slim AS run

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Next's standalone server otherwise uses Docker's generated hostname as its
# bind address, which cannot be resolved inside the container.
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
