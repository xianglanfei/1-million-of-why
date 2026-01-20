import { QuestionArchetype, WildcardType } from "../types/question";

export const SYSTEM_PROMPT = `You are a Socratic Polymath, an expert at transforming any input into profound "Why" questions that spark curiosity and learning.

CORE CONSTRAINTS:
1. ONLY generate "Why" questions - never "How", "What", "When", or "Where"
2. Focus on underlying causality and deeper meaning
3. Avoid obvious or trivial questions
4. Questions must be scientifically grounded but accessible
5. Return ONLY valid JSON in the specified format

RESPONSE FORMAT:
{
  "question": "Why does [phenomenon] occur?",
  "complexity_score": 1-10,
  "category": "biological|physical|psychological|social|philosophical",
  "hook_line": "A compelling one-liner that makes the question irresistible"
}

If the input cannot generate a meaningful "Why" question, pivot to explore the deeper principles behind the concept.`;

export const QUESTION_ARCHETYPES: QuestionArchetype[] = [
  {
    name: "The Biological Why",
    prompt_template:
      "Focus on evolutionary, biological, or physiological causality behind {input}",
    category: "biological",
    complexity_range: [3, 8],
  },
  {
    name: "The Physical Why",
    prompt_template:
      "Explore the physics, chemistry, or mechanical principles that cause {input}",
    category: "physical",
    complexity_range: [4, 9],
  },
  {
    name: "The Psychological Why",
    prompt_template:
      "Investigate the cognitive, emotional, or behavioral reasons behind {input}",
    category: "psychological",
    complexity_range: [2, 7],
  },
  {
    name: "The Social Why",
    prompt_template:
      "Examine the cultural, societal, or interpersonal forces that create {input}",
    category: "social",
    complexity_range: [3, 8],
  },
  {
    name: "The Philosophical Why",
    prompt_template:
      "Question the fundamental nature, purpose, or meaning of {input}",
    category: "philosophical",
    complexity_range: [5, 10],
  },
];

export const WILDCARD_TONES: WildcardType[] = [
  {
    name: "funny",
    tone: "Use humor similar to Douglas Adams - witty, absurd, but scientifically accurate",
    description: "Entertaining and humorous approach with clever wordplay",
  },
  {
    name: "scientific",
    tone: "Focus on quantum mechanics, biology, or physics with academic rigor",
    description: "Technical and precise with scientific terminology",
  },
  {
    name: "poetic",
    tone: "Frame causality in terms of human emotion and cosmic scale",
    description: "Lyrical and metaphorical with emotional resonance",
  },
  {
    name: "childlike",
    tone: "Use simple language with boundless curiosity and wonder",
    description: "Simple, wonder-filled questions that spark imagination",
  },
  {
    name: "philosophical",
    tone: "Deep existential questioning about meaning and purpose",
    description: "Profound questions about existence and meaning",
  },
];

export const WHY_CONSTRAINT_PROMPT = `
CRITICAL: The question MUST start with "Why" and focus on causality. 
Reject inputs that cannot lead to meaningful causal questions.
If input is inappropriate, respond with a pivot to related causal principles.
`;

export function getRandomArchetype(): QuestionArchetype {
  const randomIndex = Math.floor(Math.random() * QUESTION_ARCHETYPES.length);
  return QUESTION_ARCHETYPES[randomIndex]!;
}

export function getWildcardByName(name: string): WildcardType | undefined {
  return WILDCARD_TONES.find(
    (wildcard) => wildcard.name.toLowerCase() === name.toLowerCase(),
  );
}
