#!/bin/bash

echo "🚀 1 Million of Why - Manual Testing Guide"
echo "=========================================="

echo "📋 Step 1: Start the API Server"
echo "cd /home/eee/Projects/dynamous-kiro-hackathon"
echo "node test-server.js"
echo ""

echo "📋 Step 2: Test API Endpoints"
echo ""

echo "🔍 Health Check:"
echo "curl http://localhost:3001/health"
echo ""

echo "🎯 Generate Question:"
echo 'curl -X POST http://localhost:3001/generate-question \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"input": "cats purring in the sun", "wildcard": "funny"}'"'"
echo ""

echo "💡 Generate Answer:"
echo 'curl -X POST http://localhost:3001/generate-answer \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"question": "Why do cats purr when happy?", "wildcard": "scientific"}'"'"
echo ""

echo "🎨 Get Wildcards:"
echo "curl http://localhost:3001/wildcards"
echo ""

echo "📋 Step 3: Open Browser Interface"
echo "Open /tmp/demo.html in your browser"
echo "Or serve it with: python3 -m http.server 8000"
echo ""

echo "🎯 Expected Results:"
echo "- Health check returns: {\"status\": \"healthy\"}"
echo "- Question generation returns structured JSON with 'Why' questions"
echo "- Answer generation returns detailed explanations with sources"
echo "- Wildcards returns 5 different styles"
echo "- Browser interface shows beautiful gradient UI"
echo ""

echo "🎉 Your '1 Million of Why' app is ready for demonstration!"
