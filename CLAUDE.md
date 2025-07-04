# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server implementation for todo management, built with TypeScript and the official MCP SDK. The server provides AI-powered todo management through tools, resources, and prompts.

## Development Commands

### Build and Run
- `npm run build` - Compile TypeScript to JavaScript in ./dist/
- `npm run dev` - Run server in development mode with hot reload using tsx
- `npm start` - Run the compiled server from dist/index.js
- `npm test` - Test the server using MCP Inspector tool
- `npm run clean` - Remove compiled dist/ directory

### MCP Testing
Use the MCP Inspector for testing: `npx @modelcontextprotocol/inspector tsx src/index.ts`

## Architecture

### Core Components

**MCP Server Setup (`src/index.ts`):**
- Uses `McpServer` from the official SDK with auto-capability discovery
- Implements StdioServerTransport for MCP communication
- Provides comprehensive error handling with graceful failures
- Includes sample data initialization for demonstration

**Data Model:**
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}
```

**Storage:**
- In-memory Map for development/demo (line 18 in src/index.ts)
- Production deployments should replace with proper database

### MCP Capabilities

**Tools (5 available):**
- `create_todo` - Create todos with validation via Zod schemas
- `list_todos` - List/filter todos by status, priority, tags with sorting
- `update_todo` - Update any todo field with partial updates
- `delete_todo` - Remove todos by ID
- `todo_stats` - Generate comprehensive statistics and analytics

**Resources (2 available):**
- `todos://json` - Complete todo dataset as structured JSON
- `todos://summary` - Quick summary with metrics and completion rates

**Prompts (2 available):**
- `daily_report` - Generate professional daily todo reports with filtering
- `prioritize_tasks` - Get AI assistance with task prioritization

### Error Handling Pattern

All tools follow consistent error handling:
```typescript
try {
  // Implementation
  return { content: [...] };
} catch (error) {
  return {
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true
  };
}
```

### Configuration

**TypeScript:**
- ESNext modules with ES2022 target
- Strict mode enabled with comprehensive type checking
- Output to ./dist/ directory

**MCP Client Integration:**
- Cursor IDE: Add server config to Cursor settings
- Claude Desktop: Add to ~/.claude_desktop_config.json
- Uses node command with dist/index.js as entry point

## Key Implementation Details

- **ID Generation:** Sequential IDs with "todo-" prefix (line 22-24)
- **Sample Data:** Three demo todos created on server start (lines 461-495)
- **Graceful Shutdown:** Handles SIGINT/SIGTERM with proper cleanup (lines 510-528)
- **Process Safety:** Uncaught exception and unhandled rejection handling
- **Capability Discovery:** Server capabilities auto-discovered based on registered tools/resources/prompts

## Development Notes

- Server logs to stderr to avoid interfering with MCP stdio transport
- All operations are async/await with proper error propagation
- Zod validation ensures type safety for all tool parameters
- Resource handlers throw errors (not return error objects) per MCP patterns
- Prompt handlers return message arrays for AI conversation flow