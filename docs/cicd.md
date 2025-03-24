# CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Dummy TypeScript API project.

## Pipeline Overview

The CI/CD pipeline is implemented using GitHub Actions and consists of the following stages:

1. **Lint & Test**: Runs ESLint and all tests
2. **Build**: Compiles TypeScript code
3. **Release**: Creates a new release using semantic-release
4. **Deploy**: Deploys the application (if configured)

## Pipeline Configuration

The pipeline is configured in `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: pnpm install
      - name: Run linting
        run: pnpm lint
      - name: Run tests
        run: pnpm test
      - name: Run build
        run: pnpm build

  release:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: pnpm install
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: pnpm semantic-release
```

## Release Process

The project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and release management. The release process is triggered on every push to the `main` branch.

### Version Bumping Rules

- `feat:` commits trigger a minor version bump
- `fix:` commits trigger a patch version bump
- `BREAKING CHANGE:` in commit body triggers a major version bump

### Release Steps

1. Determines the type of release based on commits
2. Generates release notes from commit messages
3. Creates a new version tag
4. Creates a GitHub release
5. Updates the CHANGELOG.md file

## Deployment

The deployment process is configured to run after a successful release. Currently, the project supports deployment to:

- Docker containers
- Cloud platforms (configurable)

### Docker Deployment

To deploy using Docker:

```bash
# Build the image
docker build -t dummy-ts-api .

# Run the container
docker run -p 3000:3000 dummy-ts-api
```

### Environment Variables

The following environment variables are required for deployment:

```env
PORT=3000
NODE_ENV=production
```

## Monitoring and Health Checks

The application includes built-in health check endpoints:

- `/healthz`: Basic health check
- `/ready`: Readiness check
- `/metrics`: Application metrics (if configured)

## Rollback Process

In case of deployment issues, the following rollback process is available:

1. Revert to the previous version tag
2. Trigger a new deployment
3. Verify the application is functioning correctly

## Security Considerations

- All secrets are managed through GitHub Secrets
- Dependencies are regularly updated for security patches
- Security scanning is performed during the CI process

## Troubleshooting

Common issues and their solutions:

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Check for environment variable issues

2. **Test Failures**
   - Review test logs for specific failures
   - Check for environment-specific issues
   - Verify test database configuration

3. **Deployment Issues**
   - Check application logs
   - Verify environment variables
   - Check network connectivity 