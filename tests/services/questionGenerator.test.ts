import { QuestionGenerator } from '../../src/services/questionGenerator';
import { AIServiceConfig } from '../../src/types/question';

describe('QuestionGenerator', () => {
  let questionGenerator: QuestionGenerator;
  let mockAIConfig: AIServiceConfig;

  beforeEach(() => {
    mockAIConfig = {
      provider: 'openai',
      model: 'gpt-4',
      max_tokens: 500,
      temperature: 0.7
    };
    questionGenerator = new QuestionGenerator(mockAIConfig);
  });

  describe('basic functionality', () => {
    it('should create question generator instance', () => {
      expect(questionGenerator).toBeDefined();
      expect(questionGenerator).toBeInstanceOf(QuestionGenerator);
    });

    it('should return null for non-existent user stats', () => {
      const stats = questionGenerator.getUserStats('nonexistent');
      expect(stats).toBeNull();
    });
  });

  describe('wildcard service integration', () => {
    it('should handle wildcard selection', () => {
      // Test that the service can be instantiated and basic methods work
      const { WildcardService } = require('../../src/services/wildcardService');
      const wildcardService = new WildcardService();
      
      const randomWildcard = wildcardService.getRandomWildcard();
      expect(randomWildcard).toBeDefined();
      expect(randomWildcard.name).toBeDefined();
      expect(randomWildcard.tone).toBeDefined();
      
      const funnyWildcard = wildcardService.getWildcardByName('funny');
      expect(funnyWildcard.name).toBe('funny');
    });
  });

  describe('prompt library integration', () => {
    it('should have valid question archetypes', () => {
      const { QUESTION_ARCHETYPES, getRandomArchetype } = require('../../src/utils/promptLibrary');
      
      expect(QUESTION_ARCHETYPES).toBeDefined();
      expect(QUESTION_ARCHETYPES.length).toBeGreaterThan(0);
      
      const archetype = getRandomArchetype();
      expect(archetype).toBeDefined();
      expect(archetype.name).toBeDefined();
      expect(archetype.category).toBeDefined();
    });

    it('should have valid wildcard tones', () => {
      const { WILDCARD_TONES } = require('../../src/utils/promptLibrary');
      
      expect(WILDCARD_TONES).toBeDefined();
      expect(WILDCARD_TONES.length).toBeGreaterThan(0);
      
      const funnyTone = WILDCARD_TONES.find((t: any) => t.name === 'funny');
      expect(funnyTone).toBeDefined();
      expect(funnyTone.tone).toContain('Douglas Adams');
    });
  });

  describe('validation utils', () => {
    it('should validate question structure', () => {
      const { ValidationUtils } = require('../../src/utils/validationUtils');
      const mockAIService = { generateCompletion: jest.fn() };
      const validationUtils = new ValidationUtils(mockAIService);
      
      const validQuestion = {
        question: "Why do cats purr?",
        complexity_score: 5,
        category: "biological",
        hook_line: "The mystery of feline contentment"
      };
      
      const result = validationUtils.validateQuestionStructure(validQuestion);
      expect(result.is_valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject invalid question structure', () => {
      const { ValidationUtils } = require('../../src/utils/validationUtils');
      const mockAIService = { generateCompletion: jest.fn() };
      const validationUtils = new ValidationUtils(mockAIService);
      
      const invalidQuestion = {
        question: "How do cats purr?", // Should start with "Why"
        complexity_score: 15, // Out of range
        category: "invalid_category",
        hook_line: ""
      };
      
      const result = validationUtils.validateQuestionStructure(invalidQuestion);
      expect(result.is_valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('AI service', () => {
    it('should create AI service instance', () => {
      const { AIService } = require('../../src/services/aiService');
      const aiService = new AIService(mockAIConfig);
      
      expect(aiService).toBeDefined();
      expect(aiService).toBeInstanceOf(AIService);
    });

    it('should validate response format', async () => {
      const { AIService } = require('../../src/services/aiService');
      const aiService = new AIService(mockAIConfig);
      
      const validResponse = JSON.stringify({
        question: "Why do birds fly?",
        complexity_score: 6,
        category: "biological",
        hook_line: "The physics of flight"
      });
      
      const isValid = await aiService.validateResponse(validResponse);
      expect(isValid).toBe(true);
    });
  });
});
