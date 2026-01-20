export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;

  if (url === '/api/health') {
    return res.json({ 
      success: true, 
      status: 'healthy', 
      app: '1 Million of Why',
      timestamp: new Date().toISOString()
    });
  }

  if (url === '/api/generate-question' && method === 'POST') {
    const questions = [
      "Why do cats purr when they're happy?",
      "Why does the sky appear blue?",
      "Why do we dream at night?",
      "Why do flowers smell good?",
      "Why does music make us emotional?"
    ];
    
    return res.json({
      success: true,
      data: {
        question: questions[Math.floor(Math.random() * questions.length)],
        input: req.body?.input || "sample input",
        wildcard: req.body?.wildcard || "random"
      }
    });
  }

  if (url === '/api/generate-answer' && method === 'POST') {
    const answers = {
      funny: "Because they're basically tiny vibrating happiness machines! 🐱",
      scientific: "Purring occurs through rapid muscle contractions creating 20-50 Hz vibrations.",
      poetic: "Like gentle thunder in velvet, purring sings contentment's song.",
      childlike: "Cats purr because they're super duper happy!",
      philosophical: "Perhaps purring expresses the ineffable joy of existence."
    };
    
    const wildcard = req.body?.wildcard || 'funny';
    return res.json({
      success: true,
      data: {
        answer: answers[wildcard] || answers.funny,
        question: req.body?.question || "Why do cats purr?",
        wildcard
      }
    });
  }

  if (url === '/api/wildcards') {
    return res.json({
      success: true,
      data: ["funny", "scientific", "poetic", "childlike", "philosophical"]
    });
  }

  res.status(404).json({ success: false, error: 'Not found' });
}
