import {
  QuestionResponse,
  WildcardType,
  UserHistory,
  AIServiceConfig,
} from "../types/question";
import { AIService } from "./aiService";
import { WildcardService } from "./wildcardService";
import { ValidationUtils } from "../utils/validationUtils";
import { ImageProcessor } from "./imageProcessor";
import { OfflineService } from "./offlineService";
import {
  SYSTEM_PROMPT,
  getRandomArchetype,
  WHY_CONSTRAINT_PROMPT,
} from "../utils/promptLibrary";

export class QuestionGenerator {
  private aiService: AIService;
  private wildcardService: WildcardService;
  private validationUtils: ValidationUtils;
  private imageProcessor: ImageProcessor;
  private offlineService: OfflineService;
  private userHistories: Map<string, UserHistory> = new Map();

  constructor(aiConfig: AIServiceConfig) {
    this.aiService = new AIService(aiConfig);
    this.wildcardService = new WildcardService();
    this.validationUtils = new ValidationUtils(this.aiService);
    this.imageProcessor = new ImageProcessor();
    this.offlineService = new OfflineService();
  }

  async generateQuestion(
    input: string,
    wildcardName?: string,
    userId?: string,
    userContext?: { age?: number; interests?: string[] },
    inputType: "text" | "image" | "sentence" = "text",
  ): Promise<QuestionResponse> {
    // Check if offline and handle accordingly
    if (!this.offlineService.isOnline()) {
      console.log("Device is offline, using cached content");
      return this.generateOfflineQuestion(input, wildcardName);
    }

    let processedInput = input;

    // Handle image input processing
    if (inputType === "image") {
      try {
        const imageResult = await this.imageProcessor.processImage(input);
        processedInput =
          this.imageProcessor.convertToQuestionInput(imageResult);
        console.log("Image processed:", {
          method: imageResult.processing_method,
          confidence: imageResult.confidence_score,
          result_length: processedInput.length,
        });
      } catch (error) {
        console.error("Image processing failed:", error);
        throw new Error(`Image processing failed: ${error}`);
      }
    }

    // Phase 1: Strategic Alignment - Input validation and safety check
    const inputValidation =
      await this.validationUtils.validateInputSafety(processedInput);
    if (!inputValidation.is_valid) {
      throw new Error(`Invalid input: ${inputValidation.issues.join(", ")}`);
    }

    // Phase 2: Resource Assembly - Gather context and select wildcard
    const wildcard = wildcardName
      ? this.wildcardService.getWildcardByName(wildcardName)
      : this.wildcardService.getRandomWildcard();

    const archetype = getRandomArchetype();
    const userHistory = userId ? this.getUserHistory(userId) : null;

    // Phase 3: Modular Execution - Generate question with AI OS architecture
    const enhancedPrompt = this.buildEnhancedPrompt(
      processedInput,
      wildcard,
      archetype,
      userContext,
    );

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const aiResponse = await this.aiService.generateCompletion(
          SYSTEM_PROMPT,
          enhancedPrompt,
        );
        const parsedResponse = JSON.parse(aiResponse);

        // Validate structure
        const structureValidation =
          this.validationUtils.validateQuestionStructure(parsedResponse);
        if (!structureValidation.is_valid) {
          console.warn(
            `Structure validation failed (attempt ${attempts + 1}):`,
            structureValidation.issues,
          );
          attempts++;
          continue;
        }

        // Check for duplicates
        if (
          userHistory &&
          this.isDuplicateQuestion(parsedResponse.question, userHistory)
        ) {
          console.warn(
            `Duplicate question detected (attempt ${attempts + 1}), regenerating...`,
          );
          attempts++;
          continue;
        }

        // Build final response
        const questionResponse: QuestionResponse = {
          question: parsedResponse.question,
          complexity_score: parsedResponse.complexity_score,
          category: parsedResponse.category,
          hook_line: parsedResponse.hook_line,
          wildcard_applied: wildcard,
          generated_at: new Date().toISOString(),
          ...(userId && { user_id: userId }),
        };

        // Perform hallucination check (lightweight validation)
        const hallucinationCheck =
          await this.validationUtils.performHallucinationCheck(
            questionResponse,
          );
        if (
          !hallucinationCheck.is_valid &&
          hallucinationCheck.confidence_score < 70
        ) {
          console.warn(
            `Hallucination check failed (attempt ${attempts + 1}):`,
            hallucinationCheck.issues,
          );
          attempts++;
          continue;
        }

        // Integration Assurance - Log to history and cache for offline use
        if (userId) {
          this.updateUserHistory(userId, questionResponse.question, wildcard);
        }

        // Cache the question for offline use
        this.offlineService.cacheQuestionAnswer(questionResponse);

        this.logQuestionGeneration(
          questionResponse,
          processedInput,
          attempts + 1,
        );
        return questionResponse;
      } catch (error) {
        console.error(
          `Question generation attempt ${attempts + 1} failed:`,
          error,
        );
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error(
            `Failed to generate valid question after ${maxAttempts} attempts: ${error}`,
          );
        }
      }
    }

    throw new Error("Max attempts exceeded without generating valid question");
  }

  private buildEnhancedPrompt(
    input: string,
    wildcard: WildcardType,
    archetype: any,
    userContext?: { age?: number; interests?: string[] },
  ): string {
    let prompt = `${WHY_CONSTRAINT_PROMPT}\n\nInput to transform: "${input}"\n\nArchetype: ${archetype.prompt_template.replace("{input}", input)}`;

    // Apply wildcard tone
    prompt = this.wildcardService.applyWildcardToPrompt(prompt, wildcard);

    // Inject user context
    prompt = this.wildcardService.injectUserContext(prompt, userContext);

    return prompt;
  }

  private getUserHistory(userId: string): UserHistory | null {
    return this.userHistories.get(userId) || null;
  }

  private updateUserHistory(
    userId: string,
    question: string,
    wildcard: WildcardType,
  ): void {
    const existing = this.userHistories.get(userId);

    if (existing) {
      existing.previous_questions.push(question);
      existing.last_updated = new Date().toISOString();

      // Keep only last 50 questions to prevent memory bloat
      if (existing.previous_questions.length > 50) {
        existing.previous_questions = existing.previous_questions.slice(-50);
      }

      // Update preferred wildcards
      const wildcardIndex = existing.preferred_wildcards.findIndex(
        (w) => w.name === wildcard.name,
      );
      if (wildcardIndex === -1) {
        existing.preferred_wildcards.push(wildcard);
      }
    } else {
      this.userHistories.set(userId, {
        user_id: userId,
        previous_questions: [question],
        preferred_wildcards: [wildcard],
        last_updated: new Date().toISOString(),
      });
    }
  }

  private isDuplicateQuestion(
    newQuestion: string,
    userHistory: UserHistory,
  ): boolean {
    const normalizedNew = newQuestion.toLowerCase().trim();
    return userHistory.previous_questions.some((prevQuestion) => {
      const normalizedPrev = prevQuestion.toLowerCase().trim();
      // Check for exact match or high similarity
      return (
        normalizedNew === normalizedPrev ||
        this.calculateSimilarity(normalizedNew, normalizedPrev) > 0.8
      );
    });
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation - could be enhanced with more sophisticated algorithms
    const words1 = str1.split(" ");
    const words2 = str2.split(" ");
    const commonWords = words1.filter((word) => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private logQuestionGeneration(
    response: QuestionResponse,
    originalInput: string,
    attempts: number,
  ): void {
    console.log("Question Generated:", {
      timestamp: response.generated_at,
      input: originalInput,
      question: response.question,
      category: response.category,
      complexity: response.complexity_score,
      wildcard: response.wildcard_applied.name,
      attempts_required: attempts,
      user_id: response.user_id || "anonymous",
    });
  }

  // Public method to get user statistics
  getUserStats(userId: string): {
    totalQuestions: number;
    favoriteWildcards: string[];
    categories: string[];
  } | null {
    const history = this.getUserHistory(userId);
    if (!history) return null;

    const wildcardCounts = history.preferred_wildcards.reduce(
      (acc, wildcard) => {
        acc[wildcard.name] = (acc[wildcard.name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const favoriteWildcards = Object.entries(wildcardCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    return {
      totalQuestions: history.previous_questions.length,
      favoriteWildcards,
      categories: [], // Could be enhanced to track categories from question history
    };
  }

  // Generate offline question when no internet connection
  private generateOfflineQuestion(
    input: string,
    wildcardName?: string,
  ): QuestionResponse {
    // Try to get a cached question first
    const cachedQuestion = this.offlineService.getRandomCachedQuestion();
    if (cachedQuestion) {
      return {
        question: cachedQuestion.question,
        complexity_score: cachedQuestion.complexity_score,
        category: cachedQuestion.category,
        hook_line: "From your offline collection",
        wildcard_applied: cachedQuestion.wildcard_applied,
        generated_at: new Date().toISOString(),
      };
    }

    // Fallback to simple offline generation
    const offlineQuestion = this.offlineService.generateOfflineQuestion(input);

    // Apply specific wildcard if requested
    if (wildcardName) {
      const requestedWildcard =
        this.wildcardService.getWildcardByName(wildcardName);
      offlineQuestion.wildcard_applied = requestedWildcard;
    }

    return offlineQuestion;
  }

  // Get offline cache statistics
  getOfflineCacheStats(): {
    questions: number;
    answers: number;
    expiredItems: number;
  } {
    return this.offlineService.getCacheStats();
  }

  // Clear expired offline cache
  clearExpiredOfflineCache(): void {
    this.offlineService.clearExpiredCache();
  }
}
