# Testing

This document describes the testing workflows and quality checks for OpenTone.

## Quick Reference

```bash
npm run lint         # ESLint — lint all source files
npm run typecheck    # TypeScript type checking (strict mode)
cargo check          # Rust compilation check
cargo test           # Run Rust unit/integration tests
npm run tauri build  # Production build (verifies bundling)
```

## Quality Checks

### Linting

Frontend linting is handled by **ESLint** with TypeScript rules:

```bash
npm run lint
```

Rust linting uses **clippy**:

```bash
cargo clippy
```

### Type Checking

TypeScript strict mode is enabled. To verify types:

```bash
npm run typecheck
```

### Rust Checks

```bash
# Compilation check (fast, no codegen)
cargo check

# Run all tests
cargo test

# Lint
cargo clippy
```

### Build Verification

A full production build validates that bundling works end-to-end:

```bash
npm run tauri build
```

## CI

The repository includes a CI workflow (`.github/workflows/ci.yml`) that runs lint, typecheck, and tests on every push and pull request to the `main` branch.
