# System Patterns: EffectTS MCP Todo Server

## Architecture Overview

### Current Monolithic Structure
```
src/index.ts (544 lines)
├── Interface definitions
├── In-memory storage (Map)
├── MCP tool handlers
├── MCP resource handlers
├── MCP prompt handlers
└── Server startup
```

### Target Layered Architecture
```
src/
├── domain/               # Business logic
│   ├── todo/
│   │   ├── models.ts    # Effect Schema definitions
│   │   ├── errors.ts    # Typed error definitions
│   │   ├── service.ts   # Business operations
│   │   └── repository.ts # Data access interface
│   └── shared/
│       ├── types.ts     # Common types
│       └── errors.ts    # Base error types
├── infrastructure/      # External concerns
│   ├── storage/
│   │   └── memory-repository.ts
│   ├── mcp/
│   │   ├── server.ts    # MCP server setup
│   │   ├── tools.ts     # Tool definitions
│   │   ├── resources.ts # Resource handlers
│   │   └── prompts.ts   # Prompt handlers
│   └── config/
│       └── server-config.ts
└── application/         # Orchestration
    ├── handlers/
    │   ├── todo-handlers.ts
    │   ├── resource-handlers.ts
    │   └── prompt-handlers.ts
    ├── services/
    │   └── app-service.ts
    └── layers/
        └── app-layers.ts
```

## Key Design Patterns

### 1. Effect-Based Error Handling
```typescript
// Replace try-catch with typed effects
class TodoNotFound extends Data.TaggedError("TodoNotFound")<{id: string}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{issues: string[]}> {}

const getTodo: (id: string) => Effect<Todo, TodoNotFound | ValidationError>
```

### 2. Repository Pattern
```typescript
interface TodoRepository {
  readonly save: (todo: Todo) => Effect<void, DatabaseError>
  readonly findById: (id: string) => Effect<Option<Todo>, DatabaseError>
  readonly findAll: (filters: TodoFilters) => Effect<Todo[], DatabaseError>
}
```

### 3. Service Layer Pattern
```typescript
interface TodoService {
  readonly create: (data: CreateTodoRequest) => Effect<Todo, TodoError>
  readonly findById: (id: string) => Effect<Option<Todo>, TodoError>
  readonly update: (id: string, data: UpdateTodoRequest) => Effect<Todo, TodoError>
  readonly delete: (id: string) => Effect<void, TodoError>
  readonly list: (filters: TodoFilters) => Effect<Todo[], TodoError>
}
```

### 4. Dependency Injection
```typescript
// Layer-based DI with Effect
const AppLayer = Layer.provideMerge(
  TodoRepositoryLive,
  TodoServiceLive,
  McpServerLive
);
```

### 5. Schema-First Development
```typescript
// Effect Schema for validation and type generation
export class Todo extends Schema.Class<Todo>("Todo")({
  id: Schema.String.pipe(Schema.brand("TodoId")),
  title: Schema.String.pipe(Schema.minLength(1)),
  priority: Schema.Literal("low", "medium", "high"),
  tags: Schema.Array(Schema.String)
}) {}
```

## Critical Implementation Paths

### 1. Error Flow
```
MCP Request → Handler → Service → Repository → Storage
         ← Typed Error ← Typed Error ← Typed Error ←
```

### 2. Success Flow
```
MCP Request → Handler → Service → Repository → Storage
         ← Response ← Domain Model ← Domain Model ←
```

### 3. Validation Flow
```
Raw Input → Effect Schema → Validated Model → Business Logic
```

## Component Relationships

### Dependencies
- **Application Layer** depends on **Domain Layer**
- **Infrastructure Layer** implements **Domain Layer** interfaces
- **Domain Layer** has no external dependencies

### Data Flow
1. MCP request arrives at Infrastructure layer
2. Handler delegates to Application layer
3. Application layer uses Domain services
4. Domain services use Repository interfaces
5. Infrastructure provides Repository implementations 