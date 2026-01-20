import { ImageProcessor } from "../../src/services/imageProcessor";

describe("ImageProcessor", () => {
  let imageProcessor: ImageProcessor;

  beforeEach(() => {
    imageProcessor = new ImageProcessor();
  });

  describe("processImage", () => {
    it("should process valid image data", async () => {
      const validImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A";
      
      const result = await imageProcessor.processImage(validImageData);
      
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("confidence_score");
      expect(result).toHaveProperty("processing_method");
      expect(result).toHaveProperty("processed_at");
      expect(result.confidence_score).toBeGreaterThan(0);
    });

    it("should reject invalid image data", async () => {
      const invalidImageData = "not-an-image";
      
      await expect(imageProcessor.processImage(invalidImageData)).rejects.toThrow("Invalid image data format");
    });
  });

  describe("extractTextFromImage", () => {
    it("should extract text from image", async () => {
      const imageData = "data:image/jpeg;base64,validbase64data";
      
      const text = await imageProcessor.extractTextFromImage(imageData);
      
      expect(typeof text).toBe("string");
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe("generateImageDescription", () => {
    it("should generate description for image", async () => {
      const imageData = "data:image/jpeg;base64,validbase64data";
      
      const description = await imageProcessor.generateImageDescription(imageData);
      
      expect(typeof description).toBe("string");
      expect(description.length).toBeGreaterThan(10);
    });
  });
});
