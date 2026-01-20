import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock AI responses for Vercel deployment
const mockQuestions = [
  "Why do cats purr when they're happy?",
  "Why does the sky appear blue during the day?",
  "Why do we yawn when we're tired?",
  "Why do flowers have different colors?",
  "Why does music make us feel emotions?"
];

const mockAnswers = {
  funny: "Because they're basically tiny vibrating happiness machines! 🐱",
  scientific: "Purring is caused by rapid muscle contractions in the larynx and diaphragm, creating vibrations at 20-50 Hz.",
  poetic: "Like gentle thunder in a velvet chest, purring is the cat's song of contentment.",
  childlike: "Cats purr because they're super duper happy and want to tell everyone!",
  philosophical: "Perhaps purring is the cat's way of expressing the ineffable joy of existence."
};

const wildcards = ["funny", "scientific", "poetic", "childlike", "philosophical"];

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
      res.json({ 
        success: true, 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        message: "1 Million of Why API is running!"
      });
    }
    else if (url === '/api/generate-question' && req.method === 'POST') {
      const { input, wildcard } = req.body || {};
      const randomQuestion = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
      
      res.json({ 
        success: true, 
        data: {
          question: randomQuestion,
          input: input || "sample input",
          wildcard: wildcard || "random",
          timestamp: new Date().toISOString()
        }
      });
    }
    else if (url === '/api/generate-answer' && req.method === 'POST') {
      const { question, wildcard } = req.body || {};
      const selectedWildcard = wildcard || wildcards[Math.floor(Math.random() * wildcards.length)];
      const answer = mockAnswers[selectedWildcard as keyof typeof mockAnswers] || mockAnswers.funny;
      
      res.json({ 
        success: true, 
        data: {
          answer,
          question: question || "Why do cats purr?",
          wildcard: selectedWildcard,
          sources: ["Mock AI Response", "Vercel Deployment Demo"],
          timestamp: new Date().toISOString()
        }
      });
    }
    else if (url === '/api/wildcards') {
      res.json({ 
        success: true, 
        data: wildcards.map(name => ({ name, description: `${name} style answers` }))
      });
    }
    else {
      res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found',
        availableEndpoints: ['/api/health', '/api/generate-question', '/api/generate-answer', '/api/wildcards']
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
