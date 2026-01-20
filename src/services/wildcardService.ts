import { WildcardType } from "../types/question";
import { WILDCARD_TONES, getWildcardByName } from "../utils/promptLibrary";

export class WildcardService {
  getRandomWildcard(): WildcardType {
    const randomIndex = Math.floor(Math.random() * WILDCARD_TONES.length);
    return WILDCARD_TONES[randomIndex]!;
  }

  getWildcardByName(name: string): WildcardType {
    const wildcard = getWildcardByName(name);
    if (!wildcard) {
      console.warn(`Wildcard '${name}' not found, using random wildcard`);
      return this.getRandomWildcard();
    }
    return wildcard;
  }

  applyWildcardToPrompt(basePrompt: string, wildcard: WildcardType): string {
    const wildcardInstruction = `\n\nTONE MODIFIER: ${wildcard.tone}\n\nMaintain the "Why" constraint while applying this tone.`;
    return basePrompt + wildcardInstruction;
  }

  injectUserContext(
    prompt: string,
    userContext?: { age?: number; interests?: string[] },
  ): string {
    if (!userContext) return prompt;

    let contextInjection = "\n\nUSER CONTEXT:\n";

    if (userContext.age) {
      if (userContext.age < 12) {
        contextInjection += "- Use simple language appropriate for children\n";
      } else if (userContext.age > 65) {
        contextInjection +=
          "- Use clear, respectful language with life experience context\n";
      } else {
        contextInjection += `- User is ${userContext.age} years old\n`;
      }
    }

    if (userContext.interests && userContext.interests.length > 0) {
      contextInjection += `- User interests: ${userContext.interests.join(", ")}\n`;
    }

    return prompt + contextInjection;
  }

  validateWildcardCompatibility(
    wildcard: WildcardType,
    category: string,
  ): boolean {
    // Ensure certain wildcards work well with specific categories
    const incompatibleCombinations = [
      { wildcard: "childlike", category: "philosophical" }, // Too complex for childlike tone
      { wildcard: "funny", category: "philosophical" }, // Humor might undermine deep philosophical questions
    ];

    return !incompatibleCombinations.some(
      (combo) =>
        combo.wildcard === wildcard.name && combo.category === category,
    );
  }

  getAllWildcards(): WildcardType[] {
    return [...WILDCARD_TONES];
  }

  getWildcardsByComplexity(
    minComplexity: number,
    maxComplexity: number,
  ): WildcardType[] {
    // Filter wildcards based on their typical complexity range
    const complexityMap: Record<string, [number, number]> = {
      childlike: [1, 5],
      funny: [2, 7],
      scientific: [5, 10],
      poetic: [3, 8],
      philosophical: [6, 10],
    };

    return WILDCARD_TONES.filter((wildcard) => {
      const [min, max] = complexityMap[wildcard.name] || [1, 10];
      return min <= maxComplexity && max >= minComplexity;
    });
  }
}
