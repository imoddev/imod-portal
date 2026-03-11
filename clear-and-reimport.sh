#!/bin/bash
set -e

echo "🧹 Clearing database..."

# Delete all records
npx prisma db execute --stdin << SQL
TRUNCATE TABLE "NevVariant" CASCADE;
TRUNCATE TABLE "NevModel" CASCADE;
TRUNCATE TABLE "NevBrand" CASCADE;
TRUNCATE TABLE "NevAuditLog" CASCADE;
SQL

echo "✅ Database cleared"
echo ""
echo "📦 Importing new data..."

# Run import script
node import-to-supabase.js

echo ""
echo "✅ Import complete!"
