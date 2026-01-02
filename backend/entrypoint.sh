#!/bin/sh
set -e

# Build DATABASE_URL
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# Wait for Postgres to be ready
echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
for i in $(seq 1 30); do
  if pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} > /dev/null 2>&1; then
    echo "Database is up"
    break
  fi
  echo "Waiting for database... ($i)"
  sleep 1
done

# Run migrations
echo "Attempting migrations (if any)..."
# Try applying migrations (no-op if none) - ignore non-zero to proceed
npx prisma migrate deploy || true

echo "Ensuring database schema with prisma db push..."
npx prisma db push

# Run seed script
echo "Running seed script..."
node prisma/seed.js

# Start app
echo "Starting server..."
node dist/index.js
