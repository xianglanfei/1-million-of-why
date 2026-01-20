# Feature: AI Question Generation Service

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

An AI-powered service that transforms any user input (text, images, sentences) into engaging "Why" questions using the AI OS architecture. The service prioritizes strategic alignment through Socratic questioning, assembles knowledge resources including prompt libraries and user history, and executes through modular phases with wildcard tone variations.

## User Story

As a bored user
I want to input any content and receive a thought-provoking "Why" question
So that I can satisfy my curiosity and learn something new in an engaging way

## Problem Statement

Users need a way to transform mundane inputs into intellectually stimulating questions that spark curiosity and learning. The challenge is generating non-obvious, scientifically grounded questions while avoiding "how-to" answers and maintaining variety through tone wildcards.

## Solution Statement

Implement a Node.js backend service with AI integration that follows the AI OS architecture: Strategic Alignment (filtering for causality-focused questions), Resource Assembly (prompt libraries, user history, tone playbooks), and Modular Execution (structured JSON responses with validation and memory).

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Backend API, AI Integration, Database
**Dependencies**: OpenAI/Anthropic API, Firebase, Node.js, Express

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE BEFORE IMPLEMENTING!

- `.kiro/steering/tech.md` (lines 1-50) - Why: Contains AI integration architecture and Node.js backend setup
- `.kiro/steering/structure.md` (lines 15-30) - Why: Shows services directory structure and naming conventions
- `.kiro/steering/product.md` (lines 25-40) - Why: Defines wildcard system and answer style requirements

### New Files to Create

- `src/services/aiService.ts` - Core AI integration service
- `src/services/questionGenerator.ts` - Question generation logic with AI OS architecture
- `src/services/wildcardService.ts` - Tone and style variation management
- `src/types/question.ts` - TypeScript interfaces for question data
- `src/utils/promptLibrary.ts` - Question archetype templates
- `src/utils/validationUtils.ts` - Hallucination check and validation
- `tests/services/questionGenerator.test.ts` - Unit tests for question generation

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/chat)
  - Specific section: Chat Completions with system prompts
  - Why: Required for implementing Socratic Polymath system prompt
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/messages)
  - Specific section: Message structure and system prompts
  - Why: Alternative AI provider for question generation
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions/typescript)
  - Specific section: TypeScript cloud functions
  - Why: Backend deployment and scaling

### Patterns to Follow

**Naming Conventions:**
- Services: camelCase with "Service" suffix (questionGeneratorService.ts)
- Types: PascalCase interfaces (QuestionResponse, WildcardType)
- Utils: camelCase descriptive names (promptLibrary.ts)

**Error Handling:**
- Try-catch blocks with specific error types
- Graceful degradation for AI service failures
- Rate limit handling with exponential backoff

**Logging Pattern:**
- Structured logging with context (user ID, input type, timestamp)
- Error logging with stack traces
- Performance metrics for AI response times

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Strategic Alignment)

Set up core service architecture and AI integration foundation with strategic filtering for causality-focused questions.

**Tasks:**
- Create TypeScript interfaces for question data structures
- Set up AI service client with retry logic
- Implement system prompt for Socratic Polymath behavior
- Create Why-Constraint validation logic

### Phase 2: Resource Assembly

Build knowledge bank components including prompt libraries, user history tracking, and tone playbooks.

**Tasks:**
- Develop question archetype prompt library
- Implement user history tracking and deduplication
- Create wildcard tone mapping system
- Build context injection for user preferences

### Phase 3: Core Implementation (Modular Execution)

Implement the main question generation service with structured JSON responses and validation.

**Tasks:**
- Build question generation service with AI OS architecture
- Implement JSON schema validation for responses
- Add hallucination check routine
- Create integration assurance logging

### Phase 4: Integration & Testing

Connect service to existing architecture and implement comprehensive testing.

**Tasks:**
- Integrate with Firebase backend
- Add API endpoints for mobile app consumption
- Implement comprehensive test suite
- Add performance monitoring and analytics

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE src/types/question.ts

- **IMPLEMENT**: TypeScript interfaces for question data structures
- **PATTERN**: Follow React Native TypeScript patterns from tech.md
- **IMPORTS**: No external dependencies needed
- **GOTCHA**: Ensure compatibility with mobile app JSON parsing
- **VALIDATE**: `npx tsc --noEmit src/types/question.ts`

```typescript
export interface QuestionResponse {
  question: string;
  complexity_score: number;
  category: string;
  hook_line: string;
  wildcard_applied: WildcardType;
  generated_at: string;
  user_id?: string;
}

export interface WildcardType {
  name: string;
  tone: string;
  description: string;
}

export interface QuestionArchetype {
  name: string;
  prompt_template: string;
  category: string;
  complexity_range: [number, number];
}

export interface UserHistory {
  user_id: string;
  previous_questions: string[];
  preferred_wildcards: WildcardType[];
  last_updated: string;
}
```

### CREATE src/utils/promptLibrary.ts

- **IMPLEMENT**: Question archetype templates and system prompts
- **PATTERN**: Utility module pattern with exported constants
- **IMPORTS**: Import QuestionArchetype from types
- **GOTCHA**: Ensure prompts enforce "Why" constraint strictly
- **VALIDATE**: `node -e "console.log(require('./src/utils/promptLibrary.ts').SYSTEM_PROMPT)"`

### CREATE src/services/aiService.ts

- **IMPLEMENT**: AI client with retry logic and error handling
- **PATTERN**: Service class pattern with async methods
- **IMPORTS**: OpenAI SDK, Anthropic SDK, error handling utilities
- **GOTCHA**: Handle rate limits with exponential backoff
- **VALIDATE**: `npm test src/services/aiService.test.ts`

### CREATE src/services/wildcardService.ts

- **IMPLEMENT**: Wildcard tone mapping and context injection
- **PATTERN**: Service module with wildcard management functions
- **IMPORTS**: WildcardType interface, prompt utilities
- **GOTCHA**: Ensure tone modifiers don't override Why-constraint
- **VALIDATE**: `npm test src/services/wildcardService.test.ts`

### CREATE src/utils/validationUtils.ts

- **IMPLEMENT**: Hallucination check and question validation
- **PATTERN**: Utility functions with validation logic
- **IMPORTS**: AI service for validation calls
- **GOTCHA**: Keep validation lightweight to avoid double API costs
- **VALIDATE**: `npm test src/utils/validationUtils.test.ts`

### CREATE src/services/questionGenerator.ts

- **IMPLEMENT**: Main question generation service with AI OS architecture
- **PATTERN**: Service class with strategic alignment, resource assembly, execution phases
- **IMPORTS**: All previous services and utilities
- **GOTCHA**: Ensure JSON schema validation before returning responses
- **VALIDATE**: `npm test src/services/questionGenerator.test.ts`

### UPDATE package.json

- **IMPLEMENT**: Add required dependencies for AI integration
- **PATTERN**: Standard npm package.json structure
- **IMPORTS**: openai, @anthropic-ai/sdk, firebase-functions, joi for validation
- **GOTCHA**: Pin versions to avoid breaking changes
- **VALIDATE**: `npm install && npm audit`

### CREATE tests/services/questionGenerator.test.ts

- **IMPLEMENT**: Comprehensive unit tests for question generation
- **PATTERN**: Jest testing framework with mocked AI responses
- **IMPORTS**: Jest, question generator service, mock utilities
- **GOTCHA**: Mock AI API calls to avoid test costs
- **VALIDATE**: `npm test tests/services/questionGenerator.test.ts`

### CREATE src/api/questionEndpoints.ts

- **IMPLEMENT**: Express API endpoints for mobile app integration
- **PATTERN**: Express router with async handlers
- **IMPORTS**: Express, question generator service, validation middleware
- **GOTCHA**: Add proper error handling and status codes
- **VALIDATE**: `curl -X POST localhost:3000/api/generate-question -d '{"input":"test"}'`

### UPDATE src/app.ts

- **IMPLEMENT**: Register question endpoints in main Express app
- **PATTERN**: Express app configuration with middleware
- **IMPORTS**: Question endpoints router
- **GOTCHA**: Ensure proper middleware order (auth, validation, routes)
- **VALIDATE**: `npm start && curl localhost:3000/health`

---

## TESTING STRATEGY

### Unit Tests

Design unit tests with fixtures and mocked AI responses following Jest patterns:

- **Question Generation Logic**: Test all wildcard variations
- **Validation Utils**: Test hallucination detection accuracy
- **Prompt Library**: Verify archetype template rendering
- **AI Service**: Test retry logic and error handling

### Integration Tests

- **End-to-End Question Flow**: Input → AI → Validation → Response
- **Database Integration**: User history tracking and deduplication
- **API Endpoints**: Mobile app request/response cycles

### Edge Cases

- Invalid input types (empty strings, malformed images)
- AI service failures and fallback behavior
- Rate limit scenarios and backoff logic
- Duplicate question detection accuracy
- Wildcard tone conflicts and resolution

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
npx tsc --noEmit
npx eslint src/ --ext .ts
npx prettier --check src/
```

### Level 2: Unit Tests

```bash
npm test -- --coverage --testPathPattern=services
npm test -- --coverage --testPathPattern=utils
```

### Level 3: Integration Tests

```bash
npm run test:integration
npm run test:api
```

### Level 4: Manual Validation

```bash
# Test question generation endpoint
curl -X POST localhost:3000/api/generate-question \
  -H "Content-Type: application/json" \
  -d '{"input": "Why do cats purr?", "wildcard": "funny"}'

# Test image input processing
curl -X POST localhost:3000/api/generate-question \
  -H "Content-Type: application/json" \
  -d '{"input": "data:image/jpeg;base64,...", "type": "image"}'
```

### Level 5: Additional Validation

```bash
# Performance testing
npm run test:performance
# AI response quality validation
npm run validate:ai-responses
```

---

## ACCEPTANCE CRITERIA

- [ ] Service generates non-obvious "Why" questions from any input type
- [ ] All wildcard tones (funny, scientific, poetic) work correctly
- [ ] JSON responses match defined schema structure
- [ ] User history prevents duplicate questions for same user
- [ ] Hallucination check validates scientific accuracy
- [ ] API endpoints integrate seamlessly with mobile app
- [ ] Rate limiting and error handling work under load
- [ ] All validation commands pass with zero errors
- [ ] Unit test coverage exceeds 80%
- [ ] Integration tests verify end-to-end workflows
- [ ] Performance meets <5 second response time requirement

---

## COMPLETION CHECKLIST

- [ ] All TypeScript interfaces created and validated
- [ ] Prompt library with question archetypes implemented
- [ ] AI service with retry logic and error handling complete
- [ ] Wildcard service with tone mapping functional
- [ ] Question generator with AI OS architecture working
- [ ] API endpoints integrated and tested
- [ ] Comprehensive test suite passing
- [ ] Manual validation confirms feature works
- [ ] Performance requirements met
- [ ] Documentation updated

---

## NOTES

**Design Decisions:**
- Chose Node.js/TypeScript for consistency with React Native mobile app
- Implemented AI OS architecture for systematic question generation
- Used Firebase for scalable backend deployment
- Added hallucination check to ensure scientific accuracy

**Trade-offs:**
- Double AI calls (generation + validation) increase costs but improve quality
- User history storage adds complexity but prevents repetitive content
- Wildcard system adds variety but requires careful prompt engineering

**Security Considerations:**
- API key protection through environment variables
- Input sanitization to prevent prompt injection
- Rate limiting to prevent abuse
- User data encryption for privacy compliance
