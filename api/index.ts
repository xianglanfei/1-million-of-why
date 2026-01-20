import { VercelRequest, VercelResponse } from '@vercel/node';
import { QuestionGenerator } from '../src/services/questionGenerator';
import { AnswerGenerator } from '../src/services/answerGenerator';
import { WildcardService } from '../src/services/wildcardService';

const aiConfig = {
  provider: 'openai' as const,
  model: 'gpt-4',
  max_tokens: 500,
  temperature: 0.7
};

const questionGenerator = new QuestionGenerator(aiConfig);
const answerGenerator = new AnswerGenerator(aiConfig);
const wildcardService = new WildcardService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req;

  try {
    if (url === '/api/health') {
      res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
    }
    else if (url === '/api/generate-question' && req.method === 'POST') {
      const { input, wildcard, type = 'text' } = req.body;
      const result = await questionGenerator.generateQuestion(input, wildcard, undefined, undefined, type);
      res.json({ success: true, data: result });
    }
    else if (url === '/api/generate-answer' && req.method === 'POST') {
      const { question, wildcard } = req.body;
      const selectedWildcard = wildcard ? wildcardService.getWildcardByName(wildcard) : undefined;
      const result = await answerGenerator.generateAnswer(question, selectedWildcard);
      res.json({ success: true, data: result });
    }
    else if (url === '/api/wildcards') {
      const wildcards = wildcardService.getAllWildcards();
      res.json({ success: true, data: wildcards });
    }
    else {
      res.status(404).json({ success: false, error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
