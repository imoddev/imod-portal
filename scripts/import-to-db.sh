#!/bin/bash
echo "📤 Importing NEV data to database..."
curl -X POST http://localhost:3002/api/nev/import \
  -H "Content-Type: application/json" \
  -d @data/nev-import.json \
  --max-time 300 \
  -w "\n\nHTTP Status: %{http_code}\n"
