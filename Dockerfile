# A3 FOR YOU — production image of the shop + admin panel.
# Build:  docker build -t a3-site .
# Run:    docker run -p 3000:3000 -v a3-data:/data -e ADMIN_PASSWORD=... a3-site
# The /data volume keeps everything edited in the admin panel (catalogue JSON + uploaded photos).

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    BUILD_TARGET=docker
ARG NEXT_PUBLIC_SITE_URL=https://a3.kg
ARG NEXT_PUBLIC_PLANNER_URL=https://a3-foryou-3d.netlify.app
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_PLANNER_URL=$NEXT_PUBLIC_PLANNER_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data
RUN addgroup -S app && adduser -S app -G app && mkdir -p /data && chown app:app /data
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
