# AGENTS.md - Coding Agent Guidelines

## Build Commands

```bash
# Install dependencies
pnpm install

# Build the library (creates dist/)
pnpm run build

# Development mode with watch
pnpm run dev

# TypeScript type checking only
pnpm run type-check
```

## Test Commands

**No test framework is currently configured.** The project does not have tests yet.

To run a single test when tests are added:
```bash
# For Jest: pnpm jest path/to/test.ts
# For Vitest: pnpm vitest run path/to/test.ts
```

## Package Manager

Use **pnpm** for all package operations (not npm or yarn).

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2020, Module: ESNext
- Strict mode enabled with all strict flags
- JSX: react-jsx
- Declaration files generated automatically

### Imports
- Use ES modules (`"type": "module"` in package.json)
- Framework adapters import from `../../core/`
- Use `import type` for type-only imports
- Group imports: external libraries, then internal modules, then types

### Naming Conventions
- Classes: PascalCase (e.g., `LineConnector`, `LineCanvas`)
- Interfaces: PascalCase (e.g., `LineOptions`, `Connection`)
- Functions/Methods: camelCase (e.g., `setLeftNodes`, `drawLine`)
- Private fields: camelCase with `private` keyword (not underscore prefix)
- Constants: UPPER_SNAKE_CASE for true constants (e.g., `DEFAULT_OPTIONS`)
- Enums: PascalCase for name, values as strings (e.g., `LineStyle.Bezier`)
- Type aliases: PascalCase with `type` keyword

### Types
- Use interfaces for object shapes
- Use `type` for unions and complex types
- Prefer explicit return types on public methods
- Use `Partial<T>` for optional configuration objects
- Use `Required<T>` for normalized internal options
- Keep type definitions in `src/core/types.ts`

### Code Structure
- Framework-agnostic core in `src/core/`
- React adapter in `src/adapters/React/`
- Vue adapter in `src/adapters/Vue/`
- Each adapter has its own entry point (index.ts)

### Error Handling
- Guard clauses for early returns (e.g., `if (this.isDestroyed) return`)
- Use optional chaining and nullish coalescing (`??`)
- Defensive checks for DOM element existence
- No try-catch unless external API calls

### Comments
- Use JSDoc for public API documentation
- Use Chinese comments (follow existing pattern)
- Keep inline comments minimal, explain "why" not "what"

### Formatting
- No trailing semicolons (follow existing style)
- Single quotes for strings
- 2-space indentation
- Maximum line length: 100 characters
- Trailing commas in multi-line objects/arrays

### Class Patterns
- Initialize private fields at declaration
- Use constructor for dependency injection
- Implement `destroy()` method for cleanup
- Use `ResizeObserver` for container changes

### React Patterns
- Use `useRef` for class instance storage
- Use `useEffect` for initialization and cleanup
- Use `useCallback` for memoized methods
- Hook names: `use[FeatureName]`

### Vue Patterns
- Use Composition API
- Define emits explicitly
- Clean up event listeners on unmount

## Build Output

The library builds 3 entry points:
- `tomsun-line` (core)
- `tomsun-line/adapters/React`
- `tomsun-line/adapters/Vue`

Each outputs ESM (.esm.js) and CJS (.js) formats with TypeScript declarations.

## Dependencies

- Peer dependencies: react (>=16.0.0), vue (>=3.0.0) - both optional
- No runtime dependencies
- All devDependencies in package.json
