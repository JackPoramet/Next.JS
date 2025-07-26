<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# IoT Electric Energy Management System - Copilot Instructions

## Project Overview
This is a Next.js-based IoT Electric Energy Management System with the following key features:
- Authentication system using JWT tokens
- PostgreSQL database integration
- Dashboard for energy management
- TypeScript throughout
- Tailwind CSS for styling

## Code Style and Conventions

### TypeScript
- Use strict TypeScript throughout the project
- Always define interfaces for data structures
- Use proper error handling with try-catch blocks
- Prefer explicit types over `any`

### React/Next.js
- Use functional components with hooks
- Follow Next.js App Router conventions
- Use 'use client' directive only when necessary
- Implement proper error boundaries

### Database
- Use parameterized queries to prevent SQL injection
- Always handle database errors gracefully
- Close database connections properly
- Use transactions for related operations

### Authentication
- Never store plain text passwords
- Always validate JWT tokens on protected routes
- Use HttpOnly cookies for token storage
- Implement proper role-based access control

### API Routes
- Return consistent JSON response format:
  ```json
  {
    "success": boolean,
    "message": string,
    "data"?: any
  }
  ```
- Always validate input data
- Use proper HTTP status codes
- Handle errors gracefully

### Security Best Practices
- Validate all user inputs
- Use environment variables for sensitive data
- Implement rate limiting where appropriate
- Follow OWASP security guidelines

## File Organization
- API routes in `/app/api/`
- Pages in `/app/[page]/`
- Utilities in `/lib/`
- Models in `/models/`
- Contexts in `/contexts/`
- Database scripts in `/scripts/`

## Common Patterns

### Error Handling
```typescript
try {
  // operation
} catch (error) {
  console.error('Descriptive error message:', error);
  return NextResponse.json(
    { success: false, message: 'User-friendly message' },
    { status: 500 }
  );
}
```

### Database Queries
```typescript
const result = await query(
  'SELECT * FROM table WHERE column = $1',
  [value]
);
```

### Component Structure
```typescript
interface ComponentProps {
  // define props
}

export default function Component({ ...props }: ComponentProps) {
  // hooks at top
  // handlers next
  // render last
}
```

Please follow these conventions when generating or modifying code for this project.
