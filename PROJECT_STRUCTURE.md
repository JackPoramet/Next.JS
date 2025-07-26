# Project Structure Guide

## 📁 Directory Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── register/         
│
├── components/            # React Components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   └── dashboard/        # Dashboard-specific components
│
├── config/               # Configuration files
│   ├── app.ts           # Application config
│   ├── database.ts      # Database config
│   └── index.ts         # Central exports
│
├── db/                   # Database related files
│   ├── migrations/      # Database migrations
│   ├── seeds/           # Seed data scripts
│   └── schema.sql       # Main database schema
│
├── hooks/                # Custom React hooks
│   └── useUsers.ts      # User management hook
│
├── lib/                  # External library configurations
│
├── models/               # Data models and types
│
├── store/                # Zustand state management
│   └── authStore.ts     # Authentication store
│
├── types/                # TypeScript type definitions
│
└── utils/                # Utility functions
    ├── date.ts          # Date/time utilities
    ├── string.ts        # String manipulation
    ├── validation.ts    # Validation helpers
    └── index.ts         # Central exports
```

## 🧩 Component Organization

### UI Components (`src/components/ui/`)
- Reusable, generic components
- No business logic
- Examples: Button, Input, Modal, Card

### Layout Components (`src/components/layout/`)
- Page structure components
- Navigation, headers, footers
- Examples: Header, Sidebar, Navigation

### Form Components (`src/components/forms/`)
- Form-specific components
- Input validation and handling
- Examples: LoginForm, UserForm

### Dashboard Components (`src/components/dashboard/`)
- Dashboard-specific components
- Business logic for dashboard features
- Examples: StatsCard, UserTable

## 📊 Database Organization

### Schema (`src/db/schema.sql`)
- Main database schema
- Table definitions
- Indexes and functions

### Migrations (`src/db/migrations/`)
- Database schema changes
- Version-controlled updates
- Example: `001_add_last_login.js`

### Seeds (`src/db/seeds/`)
- Initial data population
- Test data generation
- Example: `users.js`

## ⚙️ Configuration

### App Config (`src/config/app.ts`)
- Application settings
- Environment variables
- Feature flags

### Database Config (`src/config/database.ts`)
- Database connection settings
- Connection pooling
- SSL configuration

## 🔧 Utilities

### Date Utils (`src/utils/date.ts`)
- Date formatting
- Time calculations
- Relative time display

### String Utils (`src/utils/string.ts`)
- Text manipulation
- ID generation
- Email masking

### Validation Utils (`src/utils/validation.ts`)
- Input validation
- Password strength checking
- Form validation helpers

## 📝 Usage Examples

### Importing Components
```typescript
// UI Components
import { LoadingSpinner } from '@/components/ui';

// Dashboard Components
import { UserTable } from '@/components/dashboard';

// Utilities
import { formatDateTime, isValidEmail } from '@/utils';

// Configuration
import { appConfig, dbConfig } from '@/config';
```

### Using Hooks
```typescript
import { useUsers } from '@/hooks/useUsers';

const MyComponent = () => {
  const { users, loading, error, refreshUsers } = useUsers();
  // Component logic
};
```

## 🚀 Development Workflow

1. **Components**: Add new components to appropriate subfolder
2. **Utils**: Add reusable functions to utils with proper exports
3. **Database**: Use migrations for schema changes
4. **Configuration**: Centralize all config in config folder
5. **Types**: Define interfaces in types folder

## 📋 Best Practices

- Use barrel exports (index.ts) for clean imports
- Group related functionality together
- Keep components small and focused
- Use TypeScript for type safety
- Document complex utilities
- Test database migrations before deployment
