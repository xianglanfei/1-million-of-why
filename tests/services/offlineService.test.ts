import { OfflineService } from "../../src/services/offlineService";

describe("OfflineService", () => {
  let offlineService: OfflineService;

  beforeEach(() => {
    offlineService = new OfflineService();
  });

  describe("generateOfflineQuestion", () => {
    it("should generate question from text input", () => {
      const input = "cats are sleeping";
      const result = offlineService.generateOfflineQuestion(input);

      expect(result).toHaveProperty("question");
      expect(result).toHaveProperty("complexity_score");
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("wildcard_applied");
      expect(result.question.toLowerCase()).toContain("why");
    });

    it("should categorize input correctly", () => {
      const plantInput = "flowers are blooming";
      const result = offlineService.generateOfflineQuestion(plantInput);

      expect(result.category).toBe("biological");
    });
  });

  describe("cache management", () => {
    it("should cache popular questions on initialization", () => {
      const cachedQuestions = offlineService.getCachedQuestions();
      expect(cachedQuestions.length).toBeGreaterThan(0);
    });

    it("should get random cached question", () => {
      const randomQuestion = offlineService.getRandomCachedQuestion();
      expect(randomQuestion).toBeTruthy();
      expect(randomQuestion).toHaveProperty("question");
    });

    it("should provide cache statistics", () => {
      const stats = offlineService.getCacheStats();
      expect(stats).toHaveProperty("questions");
      expect(stats).toHaveProperty("answers");
      expect(stats).toHaveProperty("expiredItems");
      expect(typeof stats.questions).toBe("number");
    });
  });

  describe("online/offline detection", () => {
    it("should detect online status", () => {
      const isOnline = offlineService.isOnline();
      expect(typeof isOnline).toBe("boolean");
    });
  });
});
