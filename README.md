# Todo MCP Server

A robust Model Context Protocol (MCP) server for managing todos, built with TypeScript and the official MCP SDK. This implementation demonstrates modern MCP best practices including proper error handling, server capabilities configuration, and comprehensive tool/resource/prompt integration.

## 🚀 Features

### 🛠️ Tools (AI can execute)
- **`create_todo`** - Create new todos with title, description, priority levels, and tags
- **`list_todos`** - List and filter todos by status (completed/pending), priority, and tags
- **`update_todo`** - Update any todo field including completion status and metadata
- **`delete_todo`** - Remove todos by ID with confirmation
- **`todo_stats`** - Generate comprehensive statistics and analytics

### 📄 Resources (AI can read)
- **`todos://json`** - Complete todo dataset as structured JSON
- **`todos://summary`** - Quick summary with counts, completion rates, and metrics

### 💬 Prompts (AI templates)
- **`daily_report`** - Generate professional daily todo reports with filtering
- **`prioritize_tasks`** - Get AI assistance with intelligent task prioritization

## 📋 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript knowledge (optional for usage)

### Installation & Setup

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd todo-mcp-server
npm install

# 2. Build the TypeScript project
npm run build

# 3. Test with MCP Inspector (optional)
npm test

# 4. Configure with your MCP client
```

### Configuration

#### For Cursor IDE:
Add to your Cursor settings (`~/.cursor/settings.json`):

```json
{
  "mcp-servers": {
    "todo-manager": {
      "command": "node",
      "args": ["/path/to/your/todo-mcp-server/dist/index.js"],
      "env": {},
      "cwd": "/path/to/your/todo-mcp-server"
    }
  }
}
```

#### For Claude Desktop:
Add to `~/.claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "todo-manager": {
      "command": "node",
      "args": ["/path/to/your/todo-mcp-server/dist/index.js"]
    }
  }
}
```

## 🎯 Usage Examples

Once connected to your MCP client, you can interact naturally:

### Creating & Managing Todos
```
"Create a high-priority todo to review the quarterly report with tags 'work' and 'urgent'"
"Add a shopping task for groceries with medium priority"
"Mark the quarterly report todo as completed"
"Update my shopping task to high priority and add description 'organic produce'"
```

### Viewing & Filtering
```
"Show me all high priority pending todos"
"List all completed todos from this week"
"Display todos tagged with 'work'"
"Show my todo statistics and completion rate"
```

### AI-Powered Insights
```
"Generate a daily report for today excluding completed tasks"
"Help me prioritize my current pending tasks"
"Create a professional summary of my productivity"
```

## 🏗️ Architecture & Implementation

### Modern MCP SDK Patterns

This implementation follows current MCP SDK best practices:

```typescript
// High-level API - capabilities are automatically discovered
const server = new McpServer({
  name: "todo-manager",
  version: "1.0.0"
});

// The SDK automatically discovers capabilities based on what you register:
server.tool("create_todo", schema, handler);      // Adds 'tools' capability
server.resource("todos://json", handler);         // Adds 'resources' capability  
server.prompt("daily_report", schema, handler);   // Adds 'prompts' capability

// Comprehensive error handling
server.tool("create_todo", schema, async (params) => {
  try {
    // Implementation
    return { content: [...] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
});
```

### How Capability Discovery Works

1. **Server Initialization**: Server declares or auto-discovers its capabilities
2. **Client Connection**: Client connects and receives server capability information during handshake
3. **Dynamic Discovery**: Client calls these methods to discover available features:
   - `client.listTools()` - Discover available tools
   - `client.listResources()` - Discover available resources  
   - `client.listPrompts()` - Discover available prompts
4. **Usage**: Client can then call specific tools, read resources, or use prompts

The high-level `McpServer` API automatically handles capability advertisement based on what you actually register, making it much simpler to use.

### Project Structure

```
todo-mcp-server/
├── src/
│   └── index.ts          # Main server implementation with modern patterns
├── dist/                 # Compiled JavaScript output
├── package.json          # Dependencies and build scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # Documentation (this file)
```

### Data Model

```typescript
interface Todo {
  id: string;               // Unique identifier
  title: string;            // Todo title (required)
  description?: string;     // Optional detailed description
  completed: boolean;       // Completion status
  priority: 'low' | 'medium' | 'high';  // Priority level
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Last modification timestamp
  tags: string[];           // Organizational tags
}
```

## 🔧 Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Run the server
npm start

# Test with MCP Inspector
npm test

# Lint and format code
npm run lint
npm run format
```

### Testing with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is the official testing tool:

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Test your server
npx @modelcontextprotocol/inspector node dist/index.js
```

### Error Handling & Logging

The server implements comprehensive error handling:

- **Tool errors**: Graceful failure with user-friendly messages
- **Resource errors**: Proper exception handling with context
- **Process errors**: Graceful shutdown and cleanup
- **Validation errors**: Zod schema validation with detailed feedback

### Performance Considerations

- **In-memory storage**: Fast for development; replace with database for production
- **Async operations**: All operations are properly async/await
- **Resource management**: Proper cleanup on server shutdown
- **Error isolation**: Errors in one operation don't crash the server

## 🚀 Production Deployment

### Database Integration

Replace the in-memory Map with a proper database:

```typescript
// Example with PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Implement CRUD operations with proper transactions
```

### Environment Configuration

```bash
# .env file
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost/todos
LOG_LEVEL=info
PORT=3000
```

### Monitoring & Observability

Consider adding:
- Structured logging (Winston, Pino)
- Metrics collection (Prometheus)
- Health check endpoints
- Request tracing

## 🔮 Extending the Server

### Adding New Tools

```typescript
server.tool(
  "archive_todo",
  { id: z.string() },
  async ({ id }) => {
    // Implementation
  }
);
```

### Adding New Resources

```typescript
server.resource(
  "todos-by-date",
  "todos://by-date/{date}",
  async (uri, { date }) => {
    // Implementation
  }
);
```

### Adding New Prompts

```typescript
server.prompt(
  "weekly_review",
  "Generate a weekly productivity review",
  { week: z.string() },
  async ({ week }) => {
    // Implementation
  }
);
```

## 📚 Learn More

### MCP Resources
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector Tool](https://github.com/modelcontextprotocol/inspector)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)

### Advanced Topics
- **Authentication**: Implement OAuth or API key authentication
- **Rate Limiting**: Add request throttling for production use
- **Caching**: Implement Redis or in-memory caching
- **Webhooks**: Add real-time notifications
- **Collaboration**: Multi-user todo management
- **Sync**: Cross-device synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code style and patterns
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request

### Code Standards

- Use TypeScript with strict mode
- Follow the existing error handling patterns
- Add JSDoc comments for public APIs
- Ensure all tests pass
- Follow semantic versioning

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using the official [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)**