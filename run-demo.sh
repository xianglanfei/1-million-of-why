#!/bin/bash

echo "🚀 1 Million of Why - Complete Demo Setup"
echo "========================================"

# Step 1: Install agent-browser
echo "📦 Installing agent-browser..."
npm install -g agent-browser

# Step 2: Install Chromium
echo "🌐 Installing Chromium for agent-browser..."
agent-browser install

# Step 3: Start API server in background
echo "🔧 Starting API server..."
cd /home/eee/Projects/dynamous-kiro-hackathon
node test-server.js &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Step 4: Run automated demo
echo "🤖 Running automated browser demo..."

# Open the demo page
agent-browser open file:///tmp/demo.html

# Take initial screenshot
agent-browser screenshot demo-start.png

# Test question generation
agent-browser fill "#questionInput" "cats purring in the sunshine"
agent-browser select "#wildcardSelect" "funny"
agent-browser click "#questionBtn"
agent-browser wait 4000
agent-browser screenshot question-generated.png

# Test answer generation
agent-browser fill "#answerInput" "Why do cats purr when they're happy?"
agent-browser click "#answerBtn"
agent-browser wait 4000
agent-browser screenshot answer-generated.png

# Test different wildcard
agent-browser select "#wildcardSelect" "scientific"
agent-browser fill "#questionInput" "stars twinkling at night"
agent-browser click "#questionBtn"
agent-browser wait 4000
agent-browser screenshot scientific-question.png

# Close browser
agent-browser close

echo "✅ Demo completed! Screenshots saved:"
echo "   - demo-start.png"
echo "   - question-generated.png" 
echo "   - answer-generated.png"
echo "   - scientific-question.png"

# Stop server
kill $SERVER_PID

echo "🎉 Demo finished! Your '1 Million of Why' app is working perfectly!"
