import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { QuestionGenerator } from '../src/services/questionGenerator';
import { AnswerGenerator } from '../src/services/answerGenerator';

const app = express();

app.use(cors());
app.use(express.json());

const aiConfig = {
  provider: 'openai' as const,
  model: 'gpt-4',
  max_tokens: 500,
  temperature: 0.7
};

const questionGenerator = new QuestionGenerator(aiConfig);
const answerGenerator = new AnswerGenerator(aiConfig);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Generate question
app.post('/api/generate-question', async (req, res) => {
  try {
    const { input, wildcard, type = 'text' } = req.body;
    const result = await questionGenerator.generateQuestion(input, wildcard, undefined, undefined, type);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Generate answer
app.post('/api/generate-answer', async (req, res) => {
  try {
    const { question, wildcard } = req.body;
    const { WildcardService } = await import('../src/services/wildcardService');
    const wildcardService = new WildcardService();
    const selectedWildcard = wildcard ? wildcardService.getWildcardByName(wildcard) : undefined;
    const result = await answerGenerator.generateAnswer(question, selectedWildcard);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get wildcards
app.get('/api/wildcards', async (req, res) => {
  try {
    const { WildcardService } = await import('../src/services/wildcardService');
    const wildcardService = new WildcardService();
    const wildcards = wildcardService.getAllWildcards();
    res.json({ success: true, data: wildcards });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default app;
