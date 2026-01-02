# Backend Dockerfile - multi-stage

FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install build dependencies (curl, ca-certificates, and postgresql-client) for tooling
RUN apt-get update && apt-get install -y curl ca-certificates postgresql-client --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* ./
# Copy Prisma schema so postinstall (prisma generate) can run
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Final image
FROM node:18-bullseye-slim
WORKDIR /app

# Install curl and postgresql-client for healthchecks
RUN apt-get update && apt-get install -y curl ca-certificates postgresql-client --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r app && useradd -r -g app app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chown -R app:app /app && chmod +x ./entrypoint.sh
USER app

EXPOSE 5000
ENV NODE_ENV=production
CMD ["./entrypoint.sh"]
