#!/bin/bash
# Test NEV Upload to Mac Studio

echo "🧪 Testing NEV Import Upload..."
echo ""

# Create test file
TEST_FILE="/tmp/test-upload.txt"
echo "Test content $(date)" > "$TEST_FILE"

# Upload to Mac Studio
curl -X POST http://localhost:3200/nev/import \
  -F "files=@$TEST_FILE" \
  -F "brand=BYD" \
  -F "model=Seal" \
  -F "variant=Premium" \
  -H "Content-Type: multipart/form-data" \
  -v

echo ""
echo "✅ Upload completed"
echo ""
echo "📁 Check folder:"
ls -lh /Users/imodteam/Desktop/NEV-Database/Upload/
