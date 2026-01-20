import express, { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { QuestionGenerator } from "../services/questionGenerator";
import { AnswerGenerator } from "../services/answerGenerator";
import { AIServiceConfig } from "../types/question";

const router = express.Router();

// Initialize question generator with default config
const defaultAIConfig: AIServiceConfig = {
  provider: "openai",
  model: "gpt-4",
  max_tokens: 500,
  temperature: 0.7,
};

const questionGenerator = new QuestionGenerator(defaultAIConfig);
const answerGenerator = new AnswerGenerator(defaultAIConfig);

// Validation schemas
const generateQuestionSchema = Joi.object({
  input: Joi.string().required().min(1).max(5000),
  wildcard: Joi.string()
    .optional()
    .valid("funny", "scientific", "poetic", "childlike", "philosophical"),
  user_id: Joi.string().optional(),
  user_context: Joi.object({
    age: Joi.number().optional().min(1).max(120),
    interests: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  type: Joi.string()
    .optional()
    .valid("text", "image", "sentence")
    .default("text"),
});

const generateAnswerSchema = Joi.object({
  question: Joi.string().required().min(1).max(1000),
  wildcard: Joi.string()
    .optional()
    .valid("funny", "scientific", "poetic", "childlike", "philosophical"),
  question_id: Joi.string().optional(),
});

// Middleware for request validation
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
      return;
    }
    req.body = value;
    next();
  };
};

// Error handling middleware
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// POST /api/generate-question
router.post(
  "/generate-question",
  validateRequest(generateQuestionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { input, wildcard, user_id, user_context, type } = req.body;

      // Handle different input types
      let processedInput = input;
      if (type === "image") {
        // Image processing is now handled within the question generator
        processedInput = input;
      }

      const questionResponse = await questionGenerator.generateQuestion(
        processedInput,
        wildcard,
        user_id,
        user_context,
        type,
      );

      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        data: questionResponse,
        metadata: {
          response_time_ms: responseTime,
          input_type: type,
          processing_timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Question generation failed:", error);

      res.status(500).json({
        success: false,
        error: "Question generation failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }),
);

// POST /api/generate-answer
router.post(
  "/generate-answer",
  validateRequest(generateAnswerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { question, wildcard, question_id } = req.body;

      // Get wildcard if specified
      const wildcardService =
        new (require("../services/wildcardService").WildcardService)();
      const selectedWildcard = wildcard
        ? wildcardService.getWildcardByName(wildcard)
        : undefined;

      const answerResponse = await answerGenerator.generateAnswer(
        question,
        selectedWildcard,
        question_id,
      );

      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        data: answerResponse,
        metadata: {
          response_time_ms: responseTime,
          processing_timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Answer generation failed:", error);

      res.status(500).json({
        success: false,
        error: "Answer generation failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }),
);

// POST /api/generate-multiple-answers
router.post(
  "/generate-multiple-answers",
  validateRequest(
    generateAnswerSchema.keys({
      count: Joi.number().optional().min(1).max(5).default(3),
    }),
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { question, count } = req.body;

      const answers = await answerGenerator.generateMultipleAnswers(
        question,
        count,
      );

      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        data: answers,
        metadata: {
          response_time_ms: responseTime,
          answers_generated: answers.length,
          processing_timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Multiple answers generation failed:", error);

      res.status(500).json({
        success: false,
        error: "Multiple answers generation failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }),
);
router.get("/wildcards", (_req: Request, res: Response) => {
  const wildcardService =
    new (require("../services/wildcardService").WildcardService)();
  const wildcards = wildcardService.getAllWildcards();

  res.json({
    success: true,
    data: wildcards,
  });
});

// GET /api/user/:userId/stats
router.get("/user/:userId/stats", (req: Request, res: Response): void => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({
      success: false,
      error: "User ID is required",
    });
    return;
  }

  const stats = questionGenerator.getUserStats(userId);

  if (!stats) {
    res.status(404).json({
      success: false,
      error: "User not found or no question history",
    });
    return;
  }

  res.json({
    success: true,
    data: stats,
  });
});

// GET /api/offline/cache-stats
router.get("/offline/cache-stats", (_req: Request, res: Response) => {
  const stats = questionGenerator.getOfflineCacheStats();

  res.json({
    success: true,
    data: stats,
  });
});

// POST /api/offline/clear-expired
router.post("/offline/clear-expired", (_req: Request, res: Response) => {
  questionGenerator.clearExpiredOfflineCache();

  res.json({
    success: true,
    message: "Expired cache cleared successfully",
  });
});

// GET /api/health
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "1-million-of-why-api",
  });
});

// Error handling middleware for this router
router.use(
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("API Error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env["NODE_ENV"] === "development"
          ? error.message
          : "Something went wrong",
    });
  },
);

export default router;
