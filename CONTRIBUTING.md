# Contributing to OpenTone

Thank you for your interest in contributing! OpenTone is an open-source, offline-first music player. We welcome contributions of all kinds — bug reports, feature requests, documentation, and code.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/OpenTone.git
   cd OpenTone
   ```
3. **Install dependencies**:
   - Rust toolchain (stable)
   - Node.js 20+
   - pnpm (preferred package manager)
   ```bash
   pnpm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Reporting Issues

- Check existing issues before opening a new one.
- Use the issue template if available.
- Include:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (OS, OpenTone version)
  - Screenshots or logs if applicable

## Coding Standards

### TypeScript / Frontend
- **Language**: TypeScript (strict mode enabled)
- **Framework**: React 18 with hooks, functional components
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

We follow **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types
- `feat` — A new feature
- `fix` — A bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, etc.)
- `refactor` — Code restructuring without feature/bug changes
- `perf` — Performance improvements
- `test` — Adding or updating tests
- `chore` — Build tasks, tooling, dependencies
- `ci` — CI/CD changes

### Examples
```
feat(player): add seek bar with waveform preview
fix(scan): handle unicode file paths on Windows
docs(readme): update installation instructions
refactor(db): migrate from rusqlite to sqlx
```

## Pull Request Process

1. Ensure your branch is up to date with `main` (or the feature branch target).
2. Run all checks locally before pushing:
   ```bash
   pnpm lint
   pnpm test
   cargo clippy
   cargo test
   ```
3. Keep PRs focused — one feature/fix per PR.
4. Write a descriptive PR title and body linking to related issues.
5. Ensure CI passes — reviewers will not merge failing builds.
6. Respond to review feedback promptly.

## Code of Conduct

Be kind, respectful, and constructive. Harassment, trolling, and personal attacks will not be tolerated. This project follows the [Contributor Covenant](https://www.contributor-covenant.org/).
