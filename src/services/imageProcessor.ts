import { ImageProcessingResult } from "../types/question";

export class ImageProcessor {
  async extractTextFromImage(imageData: string): Promise<string> {
    // Mock implementation - in real app, use Google Vision API
    // Validate input format
    if (!imageData.includes("base64,")) {
      throw new Error("Invalid image format");
    }

    // Simulate text extraction based on common image content
    const mockTexts = [
      "The quick brown fox jumps over the lazy dog",
      "Welcome to our restaurant - Today's special: Fish and Chips",
      "Speed limit 25 mph",
      "No parking between 8am-6pm",
      "Fresh organic vegetables for sale",
      "Meeting room A - Conference at 2pm",
    ];

    // Return random mock text
    return mockTexts[Math.floor(Math.random() * mockTexts.length)]!;
  }

  async generateImageDescription(imageData: string): Promise<string> {
    // Mock implementation - in real app, use Google Vision API or OpenAI Vision
    // Validate input format
    if (!imageData.includes("base64,")) {
      throw new Error("Invalid image format");
    }

    // Simulate image description based on common scenarios
    const mockDescriptions = [
      "A beautiful sunset over a mountain landscape with orange and pink clouds",
      "A busy city street with cars, pedestrians, and tall buildings",
      "A close-up photo of a cat sitting on a windowsill looking outside",
      "A plate of delicious food with colorful vegetables and garnishes",
      "A group of friends laughing and having fun at a party",
      "A peaceful forest scene with tall trees and dappled sunlight",
      "A modern office space with computers, desks, and office supplies",
      "A child playing with toys in a bright, colorful playroom",
    ];

    return mockDescriptions[
      Math.floor(Math.random() * mockDescriptions.length)
    ]!;
  }

  async processImage(imageData: string): Promise<ImageProcessingResult> {
    try {
      // Validate image data format
      if (!this.isValidImageData(imageData)) {
        throw new Error("Invalid image data format");
      }

      // Try text extraction first
      const extractedText = await this.extractTextFromImage(imageData);

      if (extractedText && extractedText.length > 10) {
        // If we found meaningful text, use it
        return {
          extracted_text: extractedText,
          description: `Image contains text: "${extractedText}"`,
          confidence_score: 85,
          processing_method: "text_extraction",
          processed_at: new Date().toISOString(),
        };
      } else {
        // If no meaningful text, generate description
        const description = await this.generateImageDescription(imageData);
        return {
          description,
          confidence_score: 80,
          processing_method: "image_description",
          processed_at: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("Image processing failed:", error);
      throw new Error(`Image processing failed: ${error}`);
    }
  }

  private isValidImageData(imageData: string): boolean {
    // Check if it's a valid base64 image data URL
    const imageDataRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    return imageDataRegex.test(imageData) && imageData.length > 100;
  }

  async batchProcessImages(
    imageDataArray: string[],
  ): Promise<ImageProcessingResult[]> {
    const results: ImageProcessingResult[] = [];

    for (const imageData of imageDataArray) {
      try {
        const result = await this.processImage(imageData);
        results.push(result);
      } catch (error) {
        console.error("Failed to process image in batch:", error);
        // Continue processing other images even if one fails
      }
    }

    return results;
  }

  // Helper method to convert processing result to question input
  convertToQuestionInput(result: ImageProcessingResult): string {
    if (result.extracted_text) {
      return result.extracted_text;
    } else {
      return result.description;
    }
  }
}
