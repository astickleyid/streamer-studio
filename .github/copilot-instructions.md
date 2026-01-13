# GitHub Copilot Instructions for nXcor Streamer Studio

## Project Overview

nXcor Streamer Studio is a professional streaming platform with AI-powered assistance, Twitch integration, and advanced broadcasting tools. This is a React-based web application that provides live streaming capabilities with camera/screen capture, real-time analytics, chat integration, and AI-powered streaming suggestions.

## Tech Stack

- **Frontend Framework**: React 19 with React Router DOM
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (utility-first approach)
- **Testing**: Vitest with React Testing Library
- **AI Integration**: Google Gemini AI (`@google/genai`)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API (see `contexts/StreamManagerContext.tsx`)

## Project Structure

```
/
├── components/         # React components (`.tsx` files)
├── services/          # Service layer (API integrations, business logic)
├── contexts/          # React Context providers
├── types/             # TypeScript type definitions
├── src/
│   └── test/         # Test setup and test files
├── .github/          # GitHub configuration
└── [root files]      # Configuration files and entry points
```

## Development Commands

- **Install dependencies**: `npm install`
- **Development server**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build`
- **Preview production build**: `npm run preview`
- **Run tests**: `npm test` (or `npm run test:watch` for watch mode)

## Code Style and Conventions

### TypeScript

- Use TypeScript for all new code
- Define types explicitly; avoid using `any`
- Use `enum` for status types (see `types.ts` for examples like `StreamStatus`)
- Use type aliases for union types (e.g., `type StreamScene = 'CAMERA' | 'SCREEN' | 'PIP' | ...`)
- Interface naming: Use descriptive names without prefixes (e.g., `StreamerStudioProps`, not `IStreamerStudioProps`)

### React Components

- Use functional components with TypeScript
- Define prop interfaces inline or at the top of the file
- Use React hooks (`useState`, `useEffect`, `useRef`, `useContext`)
- Import React explicitly: `import React from 'react'` (this codebase uses explicit imports)
- Use the `React.FC<PropsType>` pattern for component typing (this is the pattern used in this codebase)

### Imports

- Group imports logically:
  1. React and React-related imports
  2. Third-party libraries
  3. Local types
  4. Local services
  5. Local contexts
  6. Local components
- Use named imports from `lucide-react` for icons
- Use path alias `@/` for root-level imports (configured in tsconfig.json and vite.config.ts)

### State Management

- Use React Context API for global state (see `StreamManagerContext.tsx`)
- Use local component state with `useState` for UI-specific state
- Pass refs down as props when needed for media streams (e.g., `streamRef`, `screenStreamRef`)

### Naming Conventions

- Components: PascalCase (e.g., `StreamerStudio.tsx`)
- Services: camelCase with "Service" suffix (e.g., `geminiService.ts`, `twitchService.ts`)
- Types/Interfaces: PascalCase (e.g., `StreamStatus`, `ChatMessage`)
- Variables/functions: camelCase
- Module-level constants: UPPER_CASE (e.g., `TWITCH_CLIENT_ID`, `SCOPES`)
- Exported functions: camelCase (e.g., `generateStreamAssistance`, `getTwitchEmbedUrl`)
- Enum values: UPPER_CASE (e.g., `StreamStatus.OFFLINE`)

### Environment Variables

- Store sensitive data in `.env` file (never commit)
- Access via `process.env.VARIABLE_NAME` (defined in `vite.config.ts`)
- Required env vars:
  - `GEMINI_API_KEY`: Google Gemini AI API key
  - `TWITCH_CLIENT_ID`: Twitch application client ID
  - `TWITCH_CLIENT_SECRET`: Twitch application client secret
  - `TWITCH_REDIRECT_URI`: OAuth redirect URI for Twitch

## Testing

- Test files located in `src/test/` directory
- Use `.test.tsx` or `.test.ts` extension
- Use Vitest with jsdom environment
- Use React Testing Library for component testing
- Setup file: `src/test/setup.ts`
- Run tests before committing: `npm test`

## Important Patterns and Practices

### API Integration

- **Gemini AI**: Use `generateStreamAssistance()` and `generateStreamTitle()` from `services/geminiService.ts`
  - Always use structured output with `responseSchema` for JSON responses
  - Handle errors gracefully with fallback messages
  - Initialize `GoogleGenAI` inside functions to ensure current API key is used
  
- **Twitch**: Use services from `services/twitchService.ts` and `services/twitchAuthService.ts`
  - Check authentication status before making Twitch API calls
  - Use the Context API to access `twitchUser`, `twitchStream`, and `isAuthenticated`

### Media Handling

- Check for browser API support before using (e.g., `navigator.mediaDevices?.getDisplayMedia`)
- Use refs for MediaStream objects: `streamRef`, `screenStreamRef`
- Always handle errors when requesting camera/microphone/screen permissions

### Component Communication

- Use callbacks for parent-child communication
- Use Context API for deeply nested or global state
- Pass state updaters as props when needed (e.g., `setGlobalState`)

## Security and Privacy

- Never commit API keys or secrets to the repository
- Use `.env` file for local development secrets
- Configure GitHub Secrets for CI/CD (see `GITHUB_SECRETS_SETUP.md`)
- Validate and sanitize user input
- Handle API errors without exposing sensitive information

## Documentation

- Keep README.md up to date with setup instructions
- Document complex logic with inline comments
- Update relevant markdown files when making significant changes:
  - `STATUS_REPORT.md`: Project health and analysis
  - `DEBUGGING_GUIDE.md`: Troubleshooting information
  - `ACTION_ITEMS.md`: Priority tasks

## Dependencies

- Prefer existing dependencies over adding new ones
- Check for security vulnerabilities before adding new packages
- Keep dependencies up to date (especially security patches)
- Use exact versions for critical dependencies

## Build and Bundle Optimization

- Code splitting configured in `vite.config.ts`
- Manual chunks: `react-vendor`, `lucide`, `gemini`
- Chunk size warning limit: 1000KB
- Optimize imports to reduce bundle size

## Browser Compatibility

- Target modern browsers (ES2022)
- Use feature detection for browser APIs (camera, microphone, screen sharing)
- Provide fallbacks for unsupported features

## Additional Notes

- This is a streaming application; performance and real-time features are critical
- Consider UX for streamers (ease of use during live streams)
- Test media features with actual hardware when possible
- Be mindful of bandwidth and performance implications
