# Dummy TypeScript API

A TypeScript API template using Domain-Driven Design (DDD) architecture with Clean Architecture principles.

## Architecture

This project follows Domain-Driven Design (DDD) and Clean Architecture principles, organized in the following layers:

```
src/
├── domain/           # Enterprise business rules
│   ├── entities/     # Business objects
│   ├── repositories/ # Repository interfaces
│   └── value-objects/# Value objects
├── application/      # Application business rules
│   └── useCases/     # Use cases/application services
├── infrastructure/   # Frameworks, drivers, and tools
│   ├── http/        # HTTP layer (Express)
│   ├── persistence/ # Database implementations
│   └── config/      # Configuration
└── shared/          # Shared utilities and constants
```

### Key Principles

- **Domain Layer**: Contains enterprise business rules and entities
- **Application Layer**: Implements use cases and orchestrates the flow of data
- **Infrastructure Layer**: Handles external concerns (HTTP, database, etc.)
- **Dependency Rule**: Dependencies point inward, with the domain layer at the center
- **Dependency Injection**: Using `tsyringe` for IoC container

## Getting Started

### Prerequisites

- Node.js (v22 or higher)
- pnpm (v10 or higher)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

## Adding a New Feature

Here's an example of how to add a new endpoint following the DDD architecture:

1. **Define the Domain Entity** (if needed):
```typescript
// src/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {}
}
```

2. **Create Repository Interface**:
```typescript
// src/domain/repositories/UserRepository.ts
import { User } from '../entities/User';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

3. **Implement Use Case**:
```typescript
// src/application/useCases/CreateUserUseCase.ts
import { injectable } from 'tsyringe';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';

@injectable()
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    const user = new User(
      crypto.randomUUID(),
      name,
      email
    );
    
    await this.userRepository.save(user);
    return user;
  }
}
```

4. **Create Controller**:
```typescript
// src/infrastructure/http/controllers/UserController.ts
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { CreateUserUseCase } from '@application/useCases/CreateUserUseCase';

@injectable()
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    const { name, email } = req.body;
    const user = await this.createUserUseCase.execute(name, email);
    res.status(201).json(user);
  }
}
```

5. **Add Routes**:
```typescript
// src/infrastructure/http/routes/user.routes.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = container.resolve(UserController);

router.post('/', (req, res) => userController.create(req, res));

export default router;
```

6. **Register Dependencies**:
```typescript
// src/infrastructure/http/Server.ts
private setupDependencies(): void {
  container.registerSingleton<UserRepository>('UserRepository', InMemoryUserRepository);
  container.registerSingleton(CreateUserUseCase);
  container.registerSingleton(UserController);
}
```

## Testing

The project includes both unit and integration tests:

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run tests with coverage
pnpm test:coverage
```

## CI/CD

This project uses GitHub Actions for Continuous Integration and Continuous Deployment. See [CI/CD Documentation](docs/cicd.md) for detailed information about:

- Pipeline configuration
- Release process
- Deployment options
- Monitoring and health checks
- Rollback procedures
- Security considerations
- Troubleshooting guide

## Git Hooks

This project uses Husky to manage Git hooks:

- `pre-commit`: Runs linting and tests
- `commit-msg`: Validates commit message format
- `pre-push`: Runs all tests

> Note: This project uses Husky v10 compatible hook format.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the ISC License. 