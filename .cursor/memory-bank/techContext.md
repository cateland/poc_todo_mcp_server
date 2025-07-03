# Technical Context: EffectTS MCP Todo Server

## Current Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: @modelcontextprotocol/sdk (v1.12.1)
- **Validation**: Zod (v3.22.0)
- **Build**: TypeScript compiler (tsc)
- **Development**: tsx for hot reload

## Target Technology Stack
- **Runtime**: Node.js 18+ (unchanged)
- **Language**: TypeScript 5.0+ (unchanged)
- **Framework**: @modelcontextprotocol/sdk (unchanged)
- **Functional Programming**: Effect (new)
- **Schema/Validation**: @effect/schema (replaces Zod)
- **Platform Utilities**: @effect/platform (new)
- **Build**: TypeScript compiler (unchanged)

## Dependencies Migration
### Remove
```json
{
  "zod": "^3.22.0"  // Replace with @effect/schema
}
```

### Add
```json
{
  "effect": "^3.x",
  "@effect/schema": "^0.x",
  "@effect/platform": "^0.x"
}
```

## Development Environment
- **IDE**: Cursor with TypeScript support
- **Package Manager**: npm
- **Testing**: MCP Inspector (@modelcontextprotocol/inspector)
- **Build Target**: ES2022 modules
- **Module System**: ES modules (type: "module")

## Technical Constraints
- **MCP Compatibility**: Must maintain full MCP protocol compliance
- **Backward Compatibility**: Existing MCP clients must continue working
- **Memory Storage**: Continue using in-memory storage for simplicity
- **Single File Distribution**: Build to single dist/index.js for deployment

## Build Configuration
```json
// tsconfig.json requirements
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Effect-Specific Technical Requirements
- **Effect Version**: Use Effect v3.x (stable)
- **Schema Integration**: Full integration with @effect/schema
- **Error Handling**: Leverage Effect's typed error system
- **Dependency Injection**: Use Effect's Layer system
- **Testing**: Effect's test utilities for pure testing

## Performance Considerations
- **Bundle Size**: EffectTS adds ~200KB to bundle (acceptable for server)
- **Runtime Performance**: Effect's lazy evaluation may improve performance
- **Memory Usage**: Similar to current implementation (in-memory storage)
- **Cold Start**: Minimal impact expected for server startup

## Integration Points
- **MCP SDK**: Continue using existing SDK, wrap in Effect
- **File System**: Use @effect/platform for future file operations
- **Process Management**: Effect's interrupt model for graceful shutdown
- **Configuration**: Environment-based config with Effect's Config

## Development Workflow
1. **Build**: `npm run build` (TypeScript compilation)
2. **Development**: `npm run dev` (tsx hot reload)
3. **Testing**: `npm test` (MCP Inspector)
4. **Deployment**: `npm start` (run compiled JS)

## Tool Usage Patterns
- **Effect Pipe**: Prefer pipe operator for composability
- **Schema First**: Define schemas before implementations
- **Layer Composition**: Build dependency layers incrementally
- **Error Boundaries**: Use Effect's error handling at service boundaries 