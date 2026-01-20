import {
  OfflineQuestion,
  OfflineAnswer,
  QuestionResponse,
  AnswerResponse,
} from "../types/question";
import { WILDCARD_TONES } from "../utils/promptLibrary";

export class OfflineService {
  private cachedQuestions: OfflineQuestion[] = [];
  private cachedAnswers: OfflineAnswer[] = [];
  private readonly CACHE_SIZE_LIMIT = 100;
  private readonly CACHE_EXPIRY_DAYS = 7;

  constructor() {
    this.loadCachedData();
    this.initializePopularQuestions();
  }

  // Cache popular questions for offline use
  cachePopularQuestions(): void {
    const popularQuestions: OfflineQuestion[] = [
      {
        id: "offline-1",
        question: "Why do cats purr when they're content?",
        category: "biological",
        complexity_score: 6,
        wildcard_applied: WILDCARD_TONES[0]!,
        cached_at: new Date().toISOString(),
      },
      {
        id: "offline-2",
        question: "Why do humans find certain sounds soothing?",
        category: "psychological",
        complexity_score: 7,
        wildcard_applied: WILDCARD_TONES[1]!,
        cached_at: new Date().toISOString(),
      },
      {
        id: "offline-3",
        question: "Why do plants grow towards light?",
        category: "biological",
        complexity_score: 5,
        wildcard_applied: WILDCARD_TONES[2]!,
        cached_at: new Date().toISOString(),
      },
      {
        id: "offline-4",
        question: "Why do stars shine in the night sky?",
        category: "physical",
        complexity_score: 8,
        wildcard_applied: WILDCARD_TONES[3]!,
        cached_at: new Date().toISOString(),
      },
      {
        id: "offline-5",
        question: "Why do people laugh when they're happy?",
        category: "psychological",
        complexity_score: 6,
        wildcard_applied: WILDCARD_TONES[4]!,
        cached_at: new Date().toISOString(),
      },
    ];

    this.cachedQuestions = [...popularQuestions];
    this.cachePopularAnswers();
    this.saveCachedData();
  }

  private cachePopularAnswers(): void {
    const popularAnswers: OfflineAnswer[] = [
      {
        id: "answer-1",
        question_id: "offline-1",
        answer:
          "Cats purr through a fascinating mechanism involving their laryngeal muscles and neural oscillators. When content, their brain sends rapid signals to throat muscles, creating vibrations at 20-50 Hz. These vibrations don't just communicate happiness - they actually promote bone healing and reduce pain, which is why cats purr when injured too!",
        sources: ["Feline Biology Research", "Veterinary Science Journal"],
        wildcard_applied: WILDCARD_TONES[0]!,
        cached_at: new Date().toISOString(),
      },
      {
        id: "answer-2",
        question_id: "offline-2",
        answer:
          "Humans find certain sounds soothing due to evolutionary wiring and neurochemistry. Our brains respond positively to sounds that historically indicated safety - gentle water, soft wind, rhythmic patterns like a heartbeat. The auditory cortex processes these sounds and triggers serotonin and dopamine release while reducing cortisol, creating physiological relaxation.",
        sources: ["Neuroscience Research", "Evolutionary Psychology"],
        wildcard_applied: WILDCARD_TONES[1]!,
        cached_at: new Date().toISOString(),
      },
      {
        id: "answer-3",
        question_id: "offline-3",
        answer:
          "Plants grow towards light through phototropism, a response controlled by auxin hormones. When light hits one side of a plant, auxin concentrates on the shadowed side, causing those cells to elongate faster. This creates the bending motion toward light. It's nature's way of ensuring plants maximize their energy capture for survival!",
        sources: ["Plant Biology Textbook", "Botanical Research"],
        wildcard_applied: WILDCARD_TONES[2]!,
        cached_at: new Date().toISOString(),
      },
    ];

    this.cachedAnswers = [...popularAnswers];
  }

  // Generate offline questions from simple inputs
  generateOfflineQuestion(input: string): QuestionResponse {
    // Simple pattern matching for offline question generation
    const patterns = [
      {
        pattern: /cat|feline|pet/i,
        template: "Why do cats exhibit this behavior?",
      },
      {
        pattern: /plant|flower|tree/i,
        template: "Why do plants develop this characteristic?",
      },
      {
        pattern: /human|people|person/i,
        template: "Why do humans experience this phenomenon?",
      },
      {
        pattern: /water|ocean|sea/i,
        template: "Why does water behave this way?",
      },
      {
        pattern: /sky|cloud|weather/i,
        template: "Why do we observe this in the atmosphere?",
      },
    ];

    let question = "Why does this phenomenon occur?";
    let category = "general";

    for (const { pattern, template } of patterns) {
      if (pattern.test(input)) {
        question = template;
        category = this.getCategoryFromPattern(pattern);
        break;
      }
    }

    const randomWildcard =
      WILDCARD_TONES[Math.floor(Math.random() * WILDCARD_TONES.length)]!;

    return {
      question,
      complexity_score: Math.floor(Math.random() * 5) + 4, // 4-8 range
      category,
      hook_line: "An intriguing question to spark your curiosity",
      wildcard_applied: randomWildcard,
      generated_at: new Date().toISOString(),
    };
  }

  private getCategoryFromPattern(pattern: RegExp): string {
    const patternString = pattern.toString();
    if (patternString.includes("cat|feline|pet")) return "biological";
    if (patternString.includes("plant|flower|tree")) return "biological";
    if (patternString.includes("human|people|person")) return "psychological";
    if (patternString.includes("water|ocean|sea")) return "physical";
    if (patternString.includes("sky|cloud|weather")) return "physical";
    return "general";
  }

  // Get cached questions
  getCachedQuestions(): OfflineQuestion[] {
    return this.cachedQuestions.filter(
      (q) => !this.isCacheExpired(q.cached_at),
    );
  }

  // Get cached answer for a question
  getCachedAnswer(questionId: string): OfflineAnswer | null {
    const answer = this.cachedAnswers.find((a) => a.question_id === questionId);
    if (answer && !this.isCacheExpired(answer.cached_at)) {
      return answer;
    }
    return null;
  }

  // Cache a question-answer pair from online generation
  cacheQuestionAnswer(
    question: QuestionResponse,
    answer?: AnswerResponse,
  ): void {
    const questionId = `cached-${Date.now()}`;

    const offlineQuestion: OfflineQuestion = {
      id: questionId,
      question: question.question,
      category: question.category,
      complexity_score: question.complexity_score,
      wildcard_applied: question.wildcard_applied,
      cached_at: new Date().toISOString(),
    };

    this.cachedQuestions.push(offlineQuestion);

    if (answer) {
      const offlineAnswer: OfflineAnswer = {
        id: `answer-${Date.now()}`,
        question_id: questionId,
        answer: answer.answer,
        sources: answer.sources,
        wildcard_applied: answer.wildcard_applied,
        cached_at: new Date().toISOString(),
      };

      this.cachedAnswers.push(offlineAnswer);
    }

    this.maintainCacheSize();
    this.saveCachedData();
  }

  // Check if device is online
  isOnline(): boolean {
    // In a real mobile app, this would check network connectivity
    // For now, always return true in Node.js environment
    return true;
  }

  // Get random cached question
  getRandomCachedQuestion(): OfflineQuestion | null {
    const validQuestions = this.getCachedQuestions();
    if (validQuestions.length === 0) return null;

    return validQuestions[Math.floor(Math.random() * validQuestions.length)]!;
  }

  private isCacheExpired(cachedAt: string): boolean {
    const cacheDate = new Date(cachedAt);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - this.CACHE_EXPIRY_DAYS);
    return cacheDate < expiryDate;
  }

  private maintainCacheSize(): void {
    // Remove oldest items if cache is too large
    if (this.cachedQuestions.length > this.CACHE_SIZE_LIMIT) {
      this.cachedQuestions.sort(
        (a, b) =>
          new Date(a.cached_at).getTime() - new Date(b.cached_at).getTime(),
      );
      this.cachedQuestions = this.cachedQuestions.slice(-this.CACHE_SIZE_LIMIT);
    }

    if (this.cachedAnswers.length > this.CACHE_SIZE_LIMIT) {
      this.cachedAnswers.sort(
        (a, b) =>
          new Date(a.cached_at).getTime() - new Date(b.cached_at).getTime(),
      );
      this.cachedAnswers = this.cachedAnswers.slice(-this.CACHE_SIZE_LIMIT);
    }
  }

  private loadCachedData(): void {
    // In a real mobile app, this would load from AsyncStorage or similar
    // For now, we'll initialize with empty arrays
    this.cachedQuestions = [];
    this.cachedAnswers = [];
  }

  private saveCachedData(): void {
    // In a real mobile app, this would save to AsyncStorage or similar
    console.log("Cached data saved:", {
      questions: this.cachedQuestions.length,
      answers: this.cachedAnswers.length,
    });
  }

  private initializePopularQuestions(): void {
    if (this.cachedQuestions.length === 0) {
      this.cachePopularQuestions();
    }
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    this.cachedQuestions = this.cachedQuestions.filter(
      (q) => !this.isCacheExpired(q.cached_at),
    );
    this.cachedAnswers = this.cachedAnswers.filter(
      (a) => !this.isCacheExpired(a.cached_at),
    );
    this.saveCachedData();
  }

  // Get cache statistics
  getCacheStats(): {
    questions: number;
    answers: number;
    expiredItems: number;
  } {
    const expiredQuestions = this.cachedQuestions.filter((q) =>
      this.isCacheExpired(q.cached_at),
    ).length;
    const expiredAnswers = this.cachedAnswers.filter((a) =>
      this.isCacheExpired(a.cached_at),
    ).length;

    return {
      questions: this.cachedQuestions.length,
      answers: this.cachedAnswers.length,
      expiredItems: expiredQuestions + expiredAnswers,
    };
  }
}
