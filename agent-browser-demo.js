#!/usr/bin/env node

/**
 * 1 Million of Why - Agent Browser Demo
 * 
 * This script demonstrates the AI Question Generation Service
 * using agent-browser for automated testing and showcasing.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤔 1 Million of Why - Agent Browser Demo');
console.log('==========================================\n');

// Test data for demonstration
const testInputs = [
  { input: "cats purring in the sun", wildcard: "funny", description: "Funny question about cats" },
  { input: "stars twinkling at night", wildcard: "scientific", description: "Scientific explanation of stars" },
  { input: "children laughing at play", wildcard: "poetic", description: "Poetic take on laughter" },
  { input: "plants growing towards light", wildcard: "childlike", description: "Simple wonder about plants" },
  { input: "humans seeking meaning", wildcard: "philosophical", description: "Deep philosophical question" }
];

function runCommand(command, description) {
  console.log(`\n🔧 ${description}`);
  console.log(`Command: ${command}`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Success');
    return result;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

function createDemoHTML() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1 Million of Why - AI Demo</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .header { text-align: center; color: white; margin-bottom: 30px; }
        .demo-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .panel { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .input-group { margin: 15px 0; }
        label { display: block; font-weight: 600; margin-bottom: 5px; color: #333; }
        input, select, textarea { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; }
        button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; margin: 10px 0; }
        button:hover { transform: translateY(-2px); transition: transform 0.2s; }
        .result { background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 8px; min-height: 100px; }
        .loading { opacity: 0.7; }
        .error { border-left-color: #dc3545; background: #f8d7da; color: #721c24; }
        .api-status { position: fixed; top: 20px; right: 20px; padding: 10px 15px; border-radius: 20px; color: white; font-weight: 600; }
        .online { background: #28a745; }
        .offline { background: #dc3545; }
    </style>
</head>
<body>
    <div class="api-status" id="apiStatus">🔄 Checking...</div>
    
    <div class="header">
        <h1>🤔 1 Million of Why</h1>
        <p>AI-Powered Question & Answer Generator</p>
        <p><em>Transform boredom into curiosity with intelligent questions</em></p>
    </div>
    
    <div class="demo-container">
        <div class="panel">
            <h2>🎯 Generate Questions</h2>
            <div class="input-group">
                <label for="questionInput">What's on your mind?</label>
                <input type="text" id="questionInput" placeholder="cats, stars, plants, anything..." value="cats purring in the sun">
            </div>
            
            <div class="input-group">
                <label for="wildcardSelect">Answer Style</label>
                <select id="wildcardSelect">
                    <option value="funny">😄 Funny - Humorous & witty</option>
                    <option value="scientific">🔬 Scientific - Technical & precise</option>
                    <option value="poetic">🎭 Poetic - Lyrical & metaphorical</option>
                    <option value="childlike">👶 Childlike - Simple & wonder-filled</option>
                    <option value="philosophical">🤔 Philosophical - Deep & existential</option>
                </select>
            </div>
            
            <button onclick="generateQuestion()" id="questionBtn">Generate Question</button>
            
            <div id="questionResult" class="result">
                <p>🎯 Your generated question will appear here...</p>
            </div>
        </div>

        <div class="panel">
            <h2>💡 Generate Answers</h2>
            <div class="input-group">
                <label for="answerInput">Enter a "Why" question</label>
                <input type="text" id="answerInput" placeholder="Why do cats purr?" value="Why do cats purr when they're happy?">
            </div>
            
            <button onclick="generateAnswer()" id="answerBtn">Generate Answer</button>
            
            <div id="answerResult" class="result">
                <p>💡 Your generated answer will appear here...</p>
            </div>
        </div>
    </div>

    <script>
        // Use your local test server
        const API_BASE = 'http://localhost:3001';
        
        async function makeRequest(endpoint, data = null) {
            try {
                const options = {
                    method: data ? 'POST' : 'GET',
                    headers: { 'Content-Type': 'application/json' },
                };
                if (data) options.body = JSON.stringify(data);
                
                const response = await fetch(API_BASE + endpoint, options);
                return await response.json();
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        async function generateQuestion() {
            const input = document.getElementById('questionInput').value;
            const wildcard = document.getElementById('wildcardSelect').value;
            const btn = document.getElementById('questionBtn');
            const result = document.getElementById('questionResult');
            
            if (!input.trim()) {
                result.innerHTML = '<p class="error">Please enter some input!</p>';
                return;
            }
            
            btn.disabled = true;
            btn.textContent = 'Generating...';
            result.innerHTML = '<p class="loading">🤔 Generating your curious question...</p>';
            
            const response = await makeRequest('/generate-question', { input, wildcard });
            
            if (response.success) {
                result.innerHTML = \`
                    <h3>✨ Generated Question:</h3>
                    <p style="font-size: 18px; font-weight: 600; color: #333;"><strong>\${response.data.question}</strong></p>
                    <p><em>📂 Category: \${response.data.category} | 🎯 Complexity: \${response.data.complexity_score}/10</em></p>
                    <p><em>🎣 Hook: \${response.data.hook_line}</em></p>
                    <p><em>🎨 Style: \${response.data.wildcard_applied.name}</em></p>
                \`;
            } else {
                result.innerHTML = \`<p class="error">❌ Error: \${response.error}</p>\`;
            }
            
            btn.disabled = false;
            btn.textContent = 'Generate Question';
        }
        
        async function generateAnswer() {
            const question = document.getElementById('answerInput').value;
            const wildcard = document.getElementById('wildcardSelect').value;
            const btn = document.getElementById('answerBtn');
            const result = document.getElementById('answerResult');
            
            if (!question.trim()) {
                result.innerHTML = '<p class="error">Please enter a question!</p>';
                return;
            }
            
            btn.disabled = true;
            btn.textContent = 'Generating...';
            result.innerHTML = '<p class="loading">💡 Generating your enlightening answer...</p>';
            
            const response = await makeRequest('/generate-answer', { question, wildcard });
            
            if (response.success) {
                result.innerHTML = \`
                    <h3>💡 Generated Answer:</h3>
                    <p style="line-height: 1.6;">\${response.data.answer}</p>
                    <p><em>📊 Confidence: \${response.data.confidence_score}% | 📚 Sources: \${response.data.sources.join(', ')}</em></p>
                \`;
            } else {
                result.innerHTML = \`<p class="error">❌ Error: \${response.error}</p>\`;
            }
            
            btn.disabled = false;
            btn.textContent = 'Generate Answer';
        }
        
        // Check API status
        async function checkAPIStatus() {
            const status = document.getElementById('apiStatus');
            const response = await makeRequest('/health');
            
            if (response.status === 'healthy' || response.success) {
                status.textContent = '🟢 API Online';
                status.className = 'api-status online';
            } else {
                status.textContent = '🔴 API Offline';
                status.className = 'api-status offline';
            }
        }
        
        // Initialize
        window.onload = function() {
            checkAPIStatus();
            setInterval(checkAPIStatus, 30000); // Check every 30 seconds
        };
    </script>
</body>
</html>`;

  fs.writeFileSync('/tmp/demo.html', html);
  console.log('✅ Created demo HTML file: /tmp/demo.html');
}

async function runDemo() {
  console.log('🚀 Starting 1 Million of Why Demo with Agent Browser\n');
  
  // Create demo HTML
  createDemoHTML();
  
  console.log('📋 Demo Steps:');
  console.log('1. Start your API server: node test-server.js');
  console.log('2. Install agent-browser: npm install -g agent-browser');
  console.log('3. Run the demo commands below:\n');
  
  console.log('🤖 Agent Browser Commands:');
  console.log('==========================');
  
  // Demo commands
  const commands = [
    'agent-browser install',
    'agent-browser open file:///tmp/demo.html',
    'agent-browser screenshot demo-start.png',
    'agent-browser fill "#questionInput" "dogs wagging their tails"',
    'agent-browser select "#wildcardSelect" "funny"',
    'agent-browser click "#questionBtn"',
    'agent-browser wait 3000',
    'agent-browser screenshot question-generated.png',
    'agent-browser fill "#answerInput" "Why do dogs wag their tails when excited?"',
    'agent-browser click "#answerBtn"',
    'agent-browser wait 3000',
    'agent-browser screenshot answer-generated.png',
    'agent-browser close'
  ];
  
  commands.forEach((cmd, i) => {
    console.log(`${i + 1}. ${cmd}`);
  });
  
  console.log('\n🎯 What This Demo Shows:');
  console.log('- Beautiful web interface for your AI app');
  console.log('- Real-time question generation from any input');
  console.log('- Multiple answer styles (funny, scientific, poetic, etc.)');
  console.log('- Professional UI with gradients and animations');
  console.log('- API status monitoring');
  console.log('- Screenshots of the working application');
  
  console.log('\n📱 Perfect for:');
  console.log('- Hackathon demonstrations');
  console.log('- Automated testing');
  console.log('- Creating promotional screenshots');
  console.log('- Showing investors/judges your working app');
}

// Run the demo
runDemo().catch(console.error);
