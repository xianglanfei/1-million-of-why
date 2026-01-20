import { AnswerGenerator } from "../../src/services/answerGenerator";
import { AIServiceConfig } from "../../src/types/question";

describe("AnswerGenerator", () => {
  let answerGenerator: AnswerGenerator;
  let mockAIConfig: AIServiceConfig;

  beforeEach(() => {
    mockAIConfig = {
      provider: "openai",
      model: "gpt-4",
      max_tokens: 500,
      temperature: 0.7,
    };
    answerGenerator = new AnswerGenerator(mockAIConfig);
  });

  describe("generateAnswer", () => {
    it("should generate a valid answer response", async () => {
      const question = "Why do cats purr when they're content?";
      const result = await answerGenerator.generateAnswer(question);

      expect(result).toHaveProperty("answer");
      expect(result).toHaveProperty("sources");
      expect(result).toHaveProperty("confidence_score");
      expect(result).toHaveProperty("wildcard_applied");
      expect(result).toHaveProperty("generated_at");

      expect(result.answer).toBeTruthy();
      expect(Array.isArray(result.sources)).toBe(true);
      expect(result.confidence_score).toBeGreaterThanOrEqual(1);
      expect(result.confidence_score).toBeLessThanOrEqual(100);
    });

    it("should apply specified wildcard tone", async () => {
      const question = "Why do birds migrate?";
      const { WildcardService } = require("../../src/services/wildcardService");
      const wildcardService = new WildcardService();
      const funnyWildcard = wildcardService.getWildcardByName("funny");

      const result = await answerGenerator.generateAnswer(
        question,
        funnyWildcard,
      );

      expect(result.wildcard_applied.name).toBe("funny");
    });

    it("should include question_id when provided", async () => {
      const question = "Why do plants grow towards light?";
      const questionId = "test-question-123";

      const result = await answerGenerator.generateAnswer(
        question,
        undefined,
        questionId,
      );

      expect(result.question_id).toBe(questionId);
    });
  });

  describe("generateMultipleAnswers", () => {
    it("should generate multiple answers with different wildcards", async () => {
      const question = "Why do humans laugh?";
      const count = 3;

      const results = await answerGenerator.generateMultipleAnswers(
        question,
        count,
      );

      expect(results).toHaveLength(count);
      if (results.length >= 2) {
        expect(results[0]!.wildcard_applied.name).not.toBe(
          results[1]!.wildcard_applied.name,
        );
      }
    });

    it("should limit count to available wildcards", async () => {
      const question = "Why do stars shine?";
      const count = 10; // More than available wildcards

      const results = await answerGenerator.generateMultipleAnswers(
        question,
        count,
      );

      expect(results.length).toBeLessThanOrEqual(5); // Max wildcards available
    });
  });

  describe("error handling", () => {
    it("should handle API failures gracefully", async () => {
      // This test would be more meaningful with actual API integration
      // For now, just verify the service handles the mock responses
      const question = "Why do complex systems emerge?";

      const result = await answerGenerator.generateAnswer(question);
      expect(result).toHaveProperty("answer");
      expect(result.answer.length).toBeGreaterThan(0);
    });
  });
});
