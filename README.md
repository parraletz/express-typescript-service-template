# Dummy TypeScript API

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification. Commit messages should be structured as follows:

```
type(scope?): subject
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Examples
✅ Valid commit messages:
- feat: add new task creation endpoint
- fix(api): handle empty response in delete task
- docs(readme): update installation instructions

❌ Invalid commit messages:
- updated code (missing type)
- FIX: something (type in uppercase)
- feat: Add new feature (subject in uppercase)
- chore: update dependencies. (ends with period) 