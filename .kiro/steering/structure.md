# Project Structure

## Directory Layout
```
1-million-of-why/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── InputHandler.tsx # Multi-modal input component
│   │   ├── QuestionDisplay.tsx
│   │   ├── AnswerDisplay.tsx
│   │   └── StyleSelector.tsx
│   ├── screens/            # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── QuestionScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── services/           # API and business logic
│   │   ├── aiService.ts    # AI integration (OpenAI/Claude)
│   │   ├── imageService.ts # Image processing
│   │   └── wildcardService.ts # Answer style randomization
│   ├── hooks/              # Custom React hooks
│   │   ├── useQuestionGenerator.ts
│   │   └── useAnswerStyles.ts
│   ├── store/              # Redux state management
│   │   ├── slices/
│   │   └── store.ts
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   └── constants/          # App constants and configs
├── assets/                 # Images, fonts, icons
├── __tests__/             # Test files
├── docs/                  # Documentation
├── .expo/                 # Expo configuration
├── app.json               # Expo app configuration
├── package.json
└── .kiro/                 # Kiro CLI configuration
```

## File Naming Conventions
**Components**: PascalCase (UserInput.tsx, QuestionDisplay.tsx)
**Screens**: PascalCase with "Screen" suffix (HomeScreen.tsx)
**Services**: camelCase with "Service" suffix (aiService.ts)
**Hooks**: camelCase with "use" prefix (useQuestionGenerator.ts)
**Types**: PascalCase for interfaces, camelCase for type aliases
**Constants**: UPPER_SNAKE_CASE for values, camelCase for objects

## Module Organization
**Feature-based structure**: Group related components, hooks, and services
**Shared utilities**: Common functions in utils/ directory
**Type safety**: Centralized type definitions in types/ directory
**State management**: Redux slices organized by feature domain
**Service layer**: Separate business logic from UI components

## Configuration Files
**app.json**: Expo app configuration and metadata
**package.json**: Dependencies and scripts
**tsconfig.json**: TypeScript compiler configuration
**babel.config.js**: Babel transpilation settings
**.env**: Environment variables (API keys, endpoints)
**metro.config.js**: Metro bundler configuration

## Documentation Structure
**README.md**: Project overview and setup instructions
**DEVLOG.md**: Development timeline and decisions
**docs/**: Detailed documentation
- **api.md**: API integration documentation
- **components.md**: Component usage guide
- **deployment.md**: Build and deployment guide

## Asset Organization
**assets/images/**: App icons, logos, illustrations
**assets/fonts/**: Custom typography
**assets/sounds/**: Audio feedback (if applicable)
**Organized by category**: Group similar assets together
**Optimized formats**: Use appropriate formats for mobile (WebP, optimized PNGs)

## Build Artifacts
**dist/**: Compiled JavaScript bundles
**.expo/**: Expo build cache and metadata
**android/**: Android-specific build files (if ejected)
**ios/**: iOS-specific build files (if ejected)
**web-build/**: Web build output (if using Expo Web)

## Environment-Specific Files
**.env.development**: Development environment variables
**.env.staging**: Staging environment configuration
**.env.production**: Production environment settings
**app.config.js**: Dynamic configuration based on environment
**Environment switching**: Use Expo's environment management
