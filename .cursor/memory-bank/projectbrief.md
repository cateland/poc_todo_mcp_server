# Project Brief: EffectTS Modernization of MCP Todo Server

## Overview
This project involves modernizing an existing MCP (Model Context Protocol) todo server using EffectTS functional programming paradigms. The current implementation is a monolithic 544-line TypeScript file that would benefit from EffectTS's type-safe error handling and composable architecture.

## Core Objectives
1. **Modernize Architecture**: Transform monolithic structure into composable, testable services
2. **Improve Type Safety**: Replace unknown error types with explicit, typed error channels
3. **Enhance Modularity**: Separate concerns into domain, infrastructure, and application layers
4. **Enable Testing**: Implement dependency injection for better testability
5. **Maintain Compatibility**: Ensure MCP protocol compliance throughout refactoring

## Current State
- **Implementation**: Single file `src/index.ts` (544 lines)
- **Storage**: In-memory Map<string, Todo>
- **Tools**: 5 CRUD operations + statistics
- **Resources**: 2 (JSON data + summary)
- **Prompts**: 2 (daily report + prioritization)
- **Dependencies**: @modelcontextprotocol/sdk, zod

## Success Criteria
- Fully functional MCP server with EffectTS architecture
- Type-safe error handling throughout
- Modular, testable codebase
- Maintained feature parity with current implementation
- Clear separation of concerns (domain, infrastructure, application)

## Target Architecture
- **Domain Layer**: Business logic with Effect Schema
- **Infrastructure Layer**: MCP server, storage, configuration
- **Application Layer**: Tool handlers, resource handlers, prompt handlers
- **Dependency Injection**: Service layers for testing and modularity 