const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Import our services
const { QuestionGenerator } = require('./dist/services/questionGenerator');
const { AnswerGenerator } = require('./dist/services/answerGenerator');

const aiConfig = {
  provider: 'openai',
  model: 'gpt-4',
  max_tokens: 500,
  temperature: 0.7
};

const questionGenerator = new QuestionGenerator(aiConfig);
const answerGenerator = new AnswerGenerator(aiConfig);

// Test endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/generate-question', async (req, res) => {
  try {
    const { input, wildcard, type = 'text' } = req.body;
    const result = await questionGenerator.generateQuestion(input, wildcard, undefined, undefined, type);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/generate-answer', async (req, res) => {
  try {
    const { question, wildcard } = req.body;
    const wildcardService = new (require('./dist/services/wildcardService').WildcardService)();
    const selectedWildcard = wildcard ? wildcardService.getWildcardByName(wildcard) : undefined;
    const result = await answerGenerator.generateAnswer(question, selectedWildcard);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/wildcards', (req, res) => {
  const wildcardService = new (require('./dist/services/wildcardService').WildcardService)();
  const wildcards = wildcardService.getAllWildcards();
  res.json({ success: true, data: wildcards });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📱 Ready to test "1 Million of Why" features!`);
});
