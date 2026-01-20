import {
  AnswerResponse,
  WildcardType,
  AIServiceConfig,
} from "../types/question";
import { AIService } from "./aiService";
import { WildcardService } from "./wildcardService";

export class AnswerGenerator {
  private aiService: AIService;
  private wildcardService: WildcardService;

  constructor(aiConfig: AIServiceConfig) {
    this.aiService = new AIService(aiConfig);
    this.wildcardService = new WildcardService();
  }

  async generateAnswer(
    question: string,
    wildcard?: WildcardType,
    questionId?: string,
  ): Promise<AnswerResponse> {
    // Use provided wildcard or get random one
    const selectedWildcard =
      wildcard || this.wildcardService.getRandomWildcard();

    // Build answer generation prompt
    const systemPrompt = this.buildAnswerSystemPrompt();
    const userPrompt = this.buildAnswerUserPrompt(question, selectedWildcard);

    try {
      const aiResponse = await this.aiService.generateCompletion(
        systemPrompt,
        userPrompt,
      );

      const parsedResponse = JSON.parse(aiResponse);

      const answerResponse: AnswerResponse = {
        answer: parsedResponse.answer,
        sources: parsedResponse.sources || [],
        confidence_score: parsedResponse.confidence_score || 85,
        wildcard_applied: selectedWildcard,
        generated_at: new Date().toISOString(),
        ...(questionId && { question_id: questionId }),
      };

      this.logAnswerGeneration(answerResponse, question);
      return answerResponse;
    } catch (error) {
      console.error("Answer generation failed:", error);
      throw new Error(`Failed to generate answer: ${error}`);
    }
  }

  private buildAnswerSystemPrompt(): string {
    return `You are an expert educator who provides engaging, accurate answers to "Why" questions.

CORE PRINCIPLES:
1. Provide scientifically accurate, well-researched answers
2. Make complex topics accessible and engaging
3. Include credible sources when possible
4. Adapt tone based on wildcard instructions
5. Return ONLY valid JSON in the specified format

RESPONSE FORMAT:
{
  "answer": "Comprehensive, engaging answer to the question",
  "sources": ["Source 1", "Source 2", "Source 3"],
  "confidence_score": 1-100
}

Focus on causality, underlying mechanisms, and fascinating details that spark further curiosity.`;
  }

  private buildAnswerUserPrompt(
    question: string,
    wildcard: WildcardType,
  ): string {
    let prompt = `Question to answer: "${question}"

TONE MODIFIER: ${wildcard.tone}

Provide a comprehensive answer that explains the underlying "why" with fascinating details and scientific accuracy.`;

    return prompt;
  }

  async generateMultipleAnswers(
    question: string,
    count: number = 3,
  ): Promise<AnswerResponse[]> {
    const answers: AnswerResponse[] = [];
    const wildcards = this.wildcardService.getAllWildcards();

    for (let i = 0; i < Math.min(count, wildcards.length); i++) {
      try {
        const answer = await this.generateAnswer(question, wildcards[i]);
        answers.push(answer);
      } catch (error) {
        console.error(`Failed to generate answer ${i + 1}:`, error);
      }
    }

    return answers;
  }

  private logAnswerGeneration(
    response: AnswerResponse,
    originalQuestion: string,
  ): void {
    console.log("Answer Generated:", {
      timestamp: response.generated_at,
      question: originalQuestion,
      answer_length: response.answer.length,
      sources_count: response.sources.length,
      confidence: response.confidence_score,
      wildcard: response.wildcard_applied.name,
      question_id: response.question_id || "none",
    });
  }
}
