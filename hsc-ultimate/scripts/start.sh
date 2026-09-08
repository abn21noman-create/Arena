#!/bin/sh
# Optional self-hosted release helper. In managed production, run migrations
# in the deployment platform's release phase and start `node server.js` only.
set -eu

echo "🔄 Applying database migrations..."
npx prisma migrate deploy

echo "🚀 Starting HSC Ultimate..."
exec node server.js
