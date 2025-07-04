import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Define our Todo data structure
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

// In-memory storage for todos (in production, use a database)
const todos = new Map<string, Todo>();
let nextId = 1;

// Utility function to generate unique IDs
function generateId(): string {
  return `todo-${nextId++}`;
}

// Centralized error handling utility
function handleToolError(error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return {
    content: [{
      type: "text" as const,
      text: `❌ Error ${context}: ${errorMessage}`
    }],
    isError: true
  };
}

// Create the MCP server instance
const server = new McpServer({
  name: "todo-manager",
  version: "1.0.0"
});

// TOOL: Create a new todo
server.tool(
  "create_todo",
  {
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    tags: z.array(z.string()).default([])
  },
  async ({ title, description, priority, tags }) => {
    try {
      const id = generateId();
      const now = new Date();
      
      const todo: Todo = {
        id,
        title,
        description,
        completed: false,
        priority,
        createdAt: now,
        updatedAt: now,
        tags
      };
      
      todos.set(id, todo);
      
      return {
        content: [{
          type: "text",
          text: `✅ Created todo "${title}" with ID: ${id}`
        }]
      };
    } catch (error) {
      return handleToolError(error, "creating todo");
    }
  }
);

// TOOL: List all todos with filtering
server.tool(
  "list_todos",
  {
    status: z.enum(["all", "completed", "pending"]).default("all"),
    priority: z.enum(["low", "medium", "high"]).optional(),
    tag: z.string().optional()
  },
  async ({ status, priority, tag }) => {
    try {
      let filteredTodos = Array.from(todos.values());
      
      // Apply filters
      if (status !== "all") {
        filteredTodos = filteredTodos.filter(todo => 
          status === "completed" ? todo.completed : !todo.completed
        );
      }
      
      if (priority) {
        filteredTodos = filteredTodos.filter(todo => todo.priority === priority);
      }
      
      if (tag) {
        filteredTodos = filteredTodos.filter(todo => 
          todo.tags.includes(tag)
        );
      }
      
      // Sort by creation date (newest first)
      filteredTodos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      if (filteredTodos.length === 0) {
        return {
          content: [{
            type: "text",
            text: "📝 No todos found matching your criteria."
          }]
        };
      }
      
      const todoList = filteredTodos.map(todo => {
        const statusIcon = todo.completed ? "✅" : "⏳";
        const priorityIcon = {
          low: "🟢",
          medium: "🟡", 
          high: "🔴"
        }[todo.priority];
        
        const tagsStr = todo.tags.length > 0 ? ` [${todo.tags.join(", ")}]` : "";
        
        return `${statusIcon} ${priorityIcon} ${todo.title}${tagsStr}\n   ID: ${todo.id}${todo.description ? `\n   ${todo.description}` : ""}`;
      }).join("\n\n");
      
      return {
        content: [{
          type: "text",
          text: `📋 **Todo List** (${filteredTodos.length} items)\n\n${todoList}`
        }]
      };
    } catch (error) {
      return handleToolError(error, "listing todos");
    }
  }
);

// TOOL: Update a todo
server.tool(
  "update_todo",
  {
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    tags: z.array(z.string()).optional()
  },
  async ({ id, title, description, completed, priority, tags }) => {
    try {
      const todo = todos.get(id);
      
      if (!todo) {
        return {
          content: [{
            type: "text",
            text: `❌ Todo with ID "${id}" not found.`
          }],
          isError: true
        };
      }
      
      // Update only provided fields
      if (title !== undefined) todo.title = title;
      if (description !== undefined) todo.description = description;
      if (completed !== undefined) todo.completed = completed;
      if (priority !== undefined) todo.priority = priority;
      if (tags !== undefined) todo.tags = tags;
      
      todo.updatedAt = new Date();
      
      const statusChange = completed !== undefined 
        ? (completed ? " ✅ Marked as completed!" : " ⏳ Marked as pending!")
        : "";
      
      return {
        content: [{
          type: "text",
          text: `📝 Updated todo "${todo.title}"${statusChange}`
        }]
      };
    } catch (error) {
      return handleToolError(error, "updating todo");
    }
  }
);

// TOOL: Delete a todo
server.tool(
  "delete_todo",
  {
    id: z.string()
  },
  async ({ id }) => {
    try {
      const todo = todos.get(id);
      
      if (!todo) {
        return {
          content: [{
            type: "text",
            text: `❌ Todo with ID "${id}" not found.`
          }],
          isError: true
        };
      }
      
      todos.delete(id);
      
      return {
        content: [{
          type: "text",
          text: `🗑️ Deleted todo "${todo.title}"`
        }]
      };
    } catch (error) {
      return handleToolError(error, "deleting todo");
    }
  }
);

// TOOL: Get todo statistics
server.tool(
  "todo_stats",
  {
    // No parameters required for stats
  },
  async () => {
    try {
      const allTodos = Array.from(todos.values());
      const completed = allTodos.filter(t => t.completed).length;
      const pending = allTodos.length - completed;
      
      const priorityStats = {
        high: allTodos.filter(t => t.priority === 'high' && !t.completed).length,
        medium: allTodos.filter(t => t.priority === 'medium' && !t.completed).length,
        low: allTodos.filter(t => t.priority === 'low' && !t.completed).length
      };
      
      const allTags = allTodos.flatMap(t => t.tags);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag, count]) => `${tag} (${count})`)
        .join(", ");
      
      return {
        content: [{
          type: "text",
          text: `📊 **Todo Statistics**
          
**Overall Progress:**
• Total todos: ${allTodos.length}
• Completed: ${completed} (${allTodos.length > 0 ? Math.round(completed/allTodos.length*100) : 0}%)
• Pending: ${pending}

**Pending by Priority:**
• 🔴 High: ${priorityStats.high}
• 🟡 Medium: ${priorityStats.medium}  
• 🟢 Low: ${priorityStats.low}

**Popular Tags:** ${topTags || "None"}
          `
        }]
      };
    } catch (error) {
      return handleToolError(error, "generating statistics");
    }
  }
);

// RESOURCE: Todo data as JSON
server.resource(
  "todos-json",
  "todos://json",
  async () => {
    try {
      return {
        contents: [{
          uri: "todos://json",
          text: JSON.stringify(Array.from(todos.values()), null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error) {
      throw new Error(`Failed to serialize todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// RESOURCE: Todo summary
server.resource(
  "todos-summary",
  "todos://summary",
  async () => {
    try {
      const allTodos = Array.from(todos.values());
      const completed = allTodos.filter(t => t.completed).length;
      const pending = allTodos.length - completed;
      
      const summary = {
        total: allTodos.length,
        completed,
        pending,
        completionRate: allTodos.length > 0 ? Math.round(completed/allTodos.length*100) : 0,
        lastUpdated: new Date().toISOString()
      };
      
      return {
        contents: [{
          uri: "todos://summary",
          text: JSON.stringify(summary, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// PROMPT: Generate daily todo report
server.prompt(
  "daily_report",
  "Generate a professional daily todo report with customizable filters",
  {
    include_completed: z.string().describe("Set to 'true' to include completed todos, 'false' to exclude them"),
    priority_filter: z.string().describe("Filter by priority: 'all', 'high', 'medium', or 'low'")
  },
  async ({ include_completed, priority_filter }) => {
    try {
      let todosToInclude = Array.from(todos.values());
      
      const includeCompleted = include_completed === 'true';
      if (!includeCompleted) {
        todosToInclude = todosToInclude.filter(t => !t.completed);
      }
      
      if (priority_filter && priority_filter !== "all") {
        todosToInclude = todosToInclude.filter(t => t.priority === priority_filter);
      }
      
      const todosList = todosToInclude.map(todo => 
        `- ${todo.title} (${todo.priority} priority)${todo.description ? ': ' + todo.description : ''}`
      ).join('\n');
      
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `Please create a daily todo report based on the following tasks:

${todosList || "No tasks match the criteria."}

Format this as a professional daily report with:
1. A brief summary of total tasks and priorities
2. Key tasks to focus on today
3. Any recommendations for task prioritization
4. A motivational closing note

Make it concise but comprehensive.`
          }
        }]
      };
    } catch (error) {
      throw new Error(`Failed to generate daily report prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// PROMPT: Task prioritization assistant
server.prompt(
  "prioritize_tasks",
  "Get AI assistance with task prioritization and management recommendations",
  {},
  async () => {
    try {
      const pendingTodos = Array.from(todos.values()).filter(t => !t.completed);
      
      if (pendingTodos.length === 0) {
        return {
          messages: [{
            role: "user",
            content: {
              type: "text",
              text: "No pending tasks found! You're all caught up. 🎉"
            }
          }]
        };
      }
      
      const taskList = pendingTodos.map(todo => 
        `- "${todo.title}" (Current priority: ${todo.priority})${todo.description ? ' - ' + todo.description : ''}`
      ).join('\n');
      
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `I have the following pending tasks:

${taskList}

Please help me prioritize these tasks by:
1. Analyzing the importance and urgency of each task
2. Suggesting an optimal order for completion
3. Recommending any priority level changes
4. Identifying tasks that could be broken down into smaller steps
5. Suggesting any tasks that might be candidates for delegation or elimination

Provide specific, actionable advice for better task management.`
          }
        }]
      };
    } catch (error) {
      throw new Error(`Failed to generate prioritization prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Initialize and start the server
async function main() {
  try {
    // Add some sample data for demonstration
    const sampleTodos = [
      {
        title: "Review MCP server implementation",
        description: "Go through the todo server code and understand the patterns",
        priority: "high" as const,
        tags: ["learning", "mcp"]
      },
      {
        title: "Update project documentation", 
        description: "Add API documentation and usage examples",
        priority: "medium" as const,
        tags: ["documentation", "project"]
      },
      {
        title: "Buy groceries",
        priority: "low" as const,
        tags: ["personal", "shopping"]
      }
    ];
    
    // Create sample todos
    for (const todo of sampleTodos) {
      const id = generateId();
      const now = new Date();
      todos.set(id, {
        id,
        title: todo.title,
        description: todo.description,
        completed: false,
        priority: todo.priority,
        createdAt: now,
        updatedAt: now,
        tags: todo.tags
      });
    }
    
    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("Todo MCP Server running on stdio transport");
    console.error(`Initialized with ${todos.size} sample todos`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error("Shutting down todo server...");
  try {
    await server.close();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error("Shutting down todo server...");
  try {
    await server.close();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});