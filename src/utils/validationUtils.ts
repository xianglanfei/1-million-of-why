import { ValidationResult, QuestionResponse } from "../types/question";
import { AIService } from "../services/aiService";

export class ValidationUtils {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async performHallucinationCheck(
    questionResponse: QuestionResponse,
  ): Promise<ValidationResult> {
    const validationPrompt = `
You are a fact-checker. Evaluate this question for scientific accuracy and logical coherence:

Question: "${questionResponse.question}"
Category: ${questionResponse.category}
Complexity: ${questionResponse.complexity_score}

Respond with JSON:
{
  "is_valid": boolean,
  "confidence_score": 0-100,
  "issues": ["list of any factual or logical problems"]
}

Focus on:
1. Scientific accuracy of underlying assumptions
2. Logical coherence of the causal relationship
3. Appropriateness of complexity score
4. Category classification accuracy
`;

    try {
      const response = await this.aiService.generateCompletion(
        "You are a scientific fact-checker focused on accuracy and logic.",
        validationPrompt,
      );

      const validation = JSON.parse(response);
      return {
        is_valid: validation.is_valid,
        confidence_score: validation.confidence_score,
        issues: validation.issues || [],
      };
    } catch (error) {
      console.error("Hallucination check failed:", error);
      // Return conservative validation on error
      return {
        is_valid: false,
        confidence_score: 0,
        issues: ["Validation service unavailable"],
      };
    }
  }

  validateQuestionStructure(response: any): ValidationResult {
    const issues: string[] = [];
    let isValid = true;

    // Check required fields
    if (!response.question || typeof response.question !== "string") {
      issues.push("Missing or invalid question field");
      isValid = false;
    }

    if (
      !response.complexity_score ||
      typeof response.complexity_score !== "number"
    ) {
      issues.push("Missing or invalid complexity_score field");
      isValid = false;
    }

    if (!response.category || typeof response.category !== "string") {
      issues.push("Missing or invalid category field");
      isValid = false;
    }

    if (!response.hook_line || typeof response.hook_line !== "string") {
      issues.push("Missing or invalid hook_line field");
      isValid = false;
    }

    // Validate "Why" constraint
    if (
      response.question &&
      !response.question.toLowerCase().trim().startsWith("why")
    ) {
      issues.push('Question must start with "Why"');
      isValid = false;
    }

    // Validate complexity score range
    if (
      response.complexity_score &&
      (response.complexity_score < 1 || response.complexity_score > 10)
    ) {
      issues.push("Complexity score must be between 1 and 10");
      isValid = false;
    }

    // Validate category
    const validCategories = [
      "biological",
      "physical",
      "psychological",
      "social",
      "philosophical",
    ];
    if (
      response.category &&
      !validCategories.includes(response.category.toLowerCase())
    ) {
      issues.push(`Category must be one of: ${validCategories.join(", ")}`);
      isValid = false;
    }

    return {
      is_valid: isValid,
      confidence_score: isValid ? 100 : 0,
      issues,
    };
  }

  async validateInputSafety(input: string): Promise<ValidationResult> {
    // Check for potentially harmful or inappropriate content
    const harmfulPatterns = [
      /\b(suicide|self-harm|violence|illegal)\b/i,
      /\b(hate|discrimination|offensive)\b/i,
      /<script|javascript:|data:/i, // Basic XSS protection
    ];

    const issues: string[] = [];
    let isValid = true;

    for (const pattern of harmfulPatterns) {
      if (pattern.test(input)) {
        issues.push(
          "Input contains potentially harmful or inappropriate content",
        );
        isValid = false;
        break;
      }
    }

    // Check input length
    if (input.length > 5000) {
      issues.push("Input too long (max 5000 characters)");
      isValid = false;
    }

    if (input.trim().length === 0) {
      issues.push("Input cannot be empty");
      isValid = false;
    }

    return {
      is_valid: isValid,
      confidence_score: isValid ? 100 : 0,
      issues,
    };
  }

  combineValidationResults(results: ValidationResult[]): ValidationResult {
    const allValid = results.every((r) => r.is_valid);
    const avgConfidence =
      results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length;
    const allIssues = results.flatMap((r) => r.issues);

    return {
      is_valid: allValid,
      confidence_score: Math.round(avgConfidence),
      issues: allIssues,
    };
  }
}
