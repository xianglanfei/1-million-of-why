import { AIServiceConfig } from "../types/question";

export class AIService {
  private config: AIServiceConfig;
  private retryAttempts: number = 3;
  private baseDelay: number = 1000;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await this.makeAPICall(systemPrompt, userPrompt);
        return response;
      } catch (error) {
        lastError = error as Error;

        if (this.isRateLimitError(error)) {
          const delay = this.calculateBackoffDelay(attempt);
          console.log(
            `Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryAttempts})`,
          );
          await this.sleep(delay);
          continue;
        }

        if (!this.isRetryableError(error)) {
          throw error;
        }

        if (attempt < this.retryAttempts - 1) {
          const delay = this.calculateBackoffDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error("Max retry attempts exceeded");
  }

  private async makeAPICall(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    // Mock implementation - replace with actual OpenAI/Anthropic calls
    if (this.config.provider === "openai") {
      return this.callOpenAI(systemPrompt, userPrompt);
    } else {
      return this.callAnthropic(systemPrompt, userPrompt);
    }
  }

  private async callOpenAI(
    _systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    // Mock OpenAI API call - detect if it's question or answer generation
    if (userPrompt.includes("Question to answer:")) {
      // Answer generation
      const mockResponse = {
        answer:
          "Cats purr through a complex mechanism involving their laryngeal muscles and neural oscillators. When cats are content, their brain sends signals to muscles in their larynx, causing them to contract and relax rapidly at 20-50 Hz. This creates vibrations in their vocal cords and the hyoid bone, producing the characteristic purring sound. The fascinating part is that purring isn't just for communication - the vibrations actually promote bone healing and reduce pain, which is why cats often purr when injured or stressed.",
        sources: [
          "Journal of Feline Medicine",
          "Veterinary Physiology Research",
          "Animal Behavior Studies",
        ],
        confidence_score: 92,
      };
      return JSON.stringify(mockResponse);
    } else {
      // Question generation
      const mockResponse = {
        question: "Why do cats purr when they're content?",
        complexity_score: 6,
        category: "biological",
        hook_line: "The secret vibration that reveals a cat's emotional state",
      };
      return JSON.stringify(mockResponse);
    }
  }

  private async callAnthropic(
    _systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    // Mock Anthropic API call - detect if it's question or answer generation
    if (userPrompt.includes("Question to answer:")) {
      // Answer generation
      const mockResponse = {
        answer:
          "Humans find certain sounds soothing due to evolutionary and neurological factors. Our brains are wired to respond positively to sounds that historically indicated safety - like gentle water flow, soft wind, or rhythmic patterns similar to a mother's heartbeat. The auditory cortex processes these sounds and triggers the release of neurotransmitters like serotonin and dopamine, while simultaneously reducing cortisol levels. This creates a physiological relaxation response that helped our ancestors identify safe environments.",
        sources: [
          "Neuroscience of Sound",
          "Evolutionary Psychology Review",
          "Auditory Processing Research",
        ],
        confidence_score: 88,
      };
      return JSON.stringify(mockResponse);
    } else {
      // Question generation
      const mockResponse = {
        question: "Why do humans find certain sounds soothing?",
        complexity_score: 7,
        category: "psychological",
        hook_line: "The neurological mystery behind auditory comfort",
      };
      return JSON.stringify(mockResponse);
    }
  }

  private isRateLimitError(error: any): boolean {
    return error?.status === 429 || error?.code === "rate_limit_exceeded";
  }

  private isRetryableError(error: any): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error?.status);
  }

  private calculateBackoffDelay(attempt: number): number {
    return this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async validateResponse(response: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(response);
      return (
        typeof parsed.question === "string" &&
        parsed.question.toLowerCase().startsWith("why") &&
        typeof parsed.complexity_score === "number" &&
        parsed.complexity_score >= 1 &&
        parsed.complexity_score <= 10 &&
        typeof parsed.category === "string" &&
        typeof parsed.hook_line === "string"
      );
    } catch {
      return false;
    }
  }
}
