# Contributing to OpenTone

Thank you for your interest in contributing! OpenTone is an open-source, offline-first music player. We welcome contributions of all kinds — bug reports, feature requests, documentation, and code.

## Quick Links

- [Development Setup](Development.md)
- [Architecture](Architecture.md)
- [Deployment](Deployment.md)
- [Testing](Testing.md)

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/OpenTone.git
   cd OpenTone
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Reporting Issues

- Check existing issues before opening a new one.
- Use the issue template if available.
- Include steps to reproduce, expected vs actual behavior, environment details.

## Coding Standards

### TypeScript / Frontend
- **Language**: TypeScript (strict mode enabled)
- **Framework**: React with hooks, functional components
- **Styling**: Tailwind CSS utility classes
- **Formatting**: Prettier (default config)
- **Linting**: ESLint with TypeScript rules

### Rust / Backend
- **Language**: Rust (latest stable)
- **Style**: `rustfmt` with default settings
- **Linting**: `clippy` with pedantic recommendations
- **Errors**: Use `anyhow` / `thiserror` for error handling

### General
- Write clear, descriptive variable and function names
- Add comments for non-obvious logic
- Keep functions small and focused
- Write tests for new functionality

## Commit Conventions

We follow **Conventional Commits** (imperative mood, ≤72 chars):

```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `ci`, `security`

## Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Run all checks locally before pushing.
3. Keep PRs focused — one feature/fix per PR.
4. Write a descriptive PR title and body linking to related issues.
5. Ensure CI passes.
6. Respond to review feedback promptly.

## Code of Conduct

Be kind, respectful, and constructive. This project follows the [Contributor Covenant](https://www.contributor-covenant.org/).

By contributing, you agree that your contributions will be licensed under the MIT License.
