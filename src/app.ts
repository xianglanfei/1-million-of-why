import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import questionEndpoints from "./api/questionEndpoints";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env["PORT"] || 3000;

// Security middleware
app.use(helmet());

// CORS configuration for mobile app
app.use(
  cors({
    origin: process.env["ALLOWED_ORIGINS"]?.split(",") || [
      "http://localhost:3000",
      "exp://localhost:19000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Request parsing middleware
app.use(express.json({ limit: "10mb" })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan(process.env["NODE_ENV"] === "production" ? "combined" : "dev"));

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.headers["x-request-id"] =
    req.headers["x-request-id"] || Math.random().toString(36).substring(2, 15);
  res.setHeader("X-Request-ID", req.headers["x-request-id"]);
  next();
});

// API routes
app.use("/api", questionEndpoints);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "1 Million of Why - AI Question Generation API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      generate_question: "POST /api/generate-question",
      wildcards: "GET /api/wildcards",
      user_stats: "GET /api/user/:userId/stats",
    },
    documentation: "https://github.com/your-repo/1-million-of-why",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env["NODE_ENV"] === "development"
          ? error.message
          : "Something went wrong",
      request_id: req.headers["x-request-id"],
    });
  },
);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 1 Million of Why API server running on port ${PORT}`);
    console.log(`📱 Ready to generate curious questions!`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📚 API docs: http://localhost:${PORT}/`);
  });
}

export default app;
