# Backend Refactored - Clean Architecture

## 🏗️ Architecture Overview

This backend follows **Clean Architecture** principles with strict **SOLID** compliance:

```
src/
├── domain/              # Business Logic Layer (Inner)
│   ├── entities/        # Business Entities
│   ├── repositories/    # Repository Interfaces (Ports)
│   └── services/        # Domain Services
├── application/         # Application Layer
│   └── useCases/        # Use Cases (Interactors)
├── infrastructure/      # Infrastructure Layer (Outer)
│   ├── repositories/    # Repository Implementations (Adapters)
│   └── di/             # Dependency Injection Container
└── presentation/        # Presentation Layer (Outer)
    ├── controllers/     # HTTP Controllers
    └── routes/         # Route Definitions
```

## 🎯 SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- ✅ **UserController**: Only handles HTTP requests/responses for user operations
- ✅ **UserDomainService**: Only handles user business logic
- ✅ **SqliteUserRepository**: Only handles user data persistence
- ✅ **AuthenticateUserUseCase**: Only handles user authentication flow

### Open/Closed Principle (OCP)
- ✅ **Repository Interfaces**: Open for extension via new implementations
- ✅ **Use Cases**: Closed for modification, open for new use cases
- ✅ **Controllers**: Can be extended without modifying existing code

### Liskov Substitution Principle (LSP)
- ✅ **IUserRepository**: Any implementation can substitute another
- ✅ **IUniversityRepository**: JsonUniversity and future SQL implementations are interchangeable

### Interface Segregation Principle (ISP)
- ✅ **Focused Interfaces**: Each repository interface serves specific needs
- ✅ **Use Case Interfaces**: Single-purpose, not forcing unnecessary dependencies

### Dependency Inversion Principle (DIP)
- ✅ **High-level modules** (Use Cases) don't depend on low-level modules (Repositories)
- ✅ **Both depend on abstractions** (Repository Interfaces)
- ✅ **Dependency Injection Container** manages all dependencies

## 🔧 Key Features

### Clean Separation of Concerns
- **Domain Layer**: Pure business logic, no external dependencies
- **Application Layer**: Orchestrates domain operations
- **Infrastructure Layer**: External concerns (database, file system)
- **Presentation Layer**: HTTP interface and routing

### Dependency Injection
- Centralized DI container managing all dependencies
- Easy testing with mock implementations
- Runtime dependency resolution

### Type Safety
- Full TypeScript implementation
- Strict compiler settings
- Comprehensive type checking

### Error Handling
- Proper error boundaries at each layer
- Consistent error responses
- Graceful failure handling

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
npm install
```

### Development
```bash
npm run dev          # Start development server
npm run dev:watch    # Start with auto-reload
```

### Building
```bash
npm run build        # Compile TypeScript
npm start           # Run production build
```

### Testing
```bash
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

## 📁 Project Structure Details

### Domain Layer (`src/domain/`)
Contains the core business logic and rules:

- **Entities**: `User`, `University` - Business objects with behavior
- **Repository Interfaces**: Abstract contracts for data access
- **Domain Services**: Complex business logic that doesn't fit in entities

### Application Layer (`src/application/`)
Orchestrates domain operations:

- **Use Cases**: Application-specific business rules
- **DTOs**: Data transfer objects for use case inputs/outputs

### Infrastructure Layer (`src/infrastructure/`)
Implements external concerns:

- **Repository Implementations**: Concrete data access implementations
- **Dependency Injection**: IoC container for managing dependencies
- **External Services**: Third-party integrations

### Presentation Layer (`src/presentation/`)
Handles HTTP interface:

- **Controllers**: Handle HTTP requests, delegate to use cases
- **Routes**: Define API endpoints and middleware
- **Middleware**: Authentication, validation, logging

## 🎯 Benefits of This Architecture

### Testability
- Each layer can be tested independently
- Easy mocking of dependencies
- Clear separation makes unit testing straightforward

### Maintainability
- Changes in one layer don't affect others
- Easy to understand and modify
- Clear code organization

### Scalability
- Easy to add new features without breaking existing code
- Can swap implementations (e.g., SQLite → PostgreSQL)
- Supports microservices migration

### Business Logic Protection
- Core business rules are isolated from technical details
- Framework-independent domain layer
- Easy to change databases, web frameworks, etc.

## 🔄 Migration from Legacy Code

This refactored backend addresses the following issues from the original:

❌ **Old Issues**:
- Mixed responsibilities in controllers
- Direct database dependencies in business logic
- No dependency injection
- Tight coupling between layers
- Business logic scattered across files

✅ **New Solutions**:
- Single responsibility controllers
- Abstract repository interfaces
- Comprehensive dependency injection
- Loose coupling via dependency inversion
- Centralized business logic in domain services

## 🛠️ Environment Variables

```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./dev.db
UNIVERSITIES_DATA_PATH=../world_universities.json
FRONTEND_URL=http://localhost:5173
```

## 📊 Performance Considerations

- Lazy loading of university data
- Connection pooling for database
- Efficient query patterns
- Proper error handling to prevent crashes
- Graceful shutdown handling

This architecture provides a solid foundation for scaling and maintaining the application while following industry best practices.