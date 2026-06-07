# AI Agent Instructions for OpenTone

This file provides orientation for AI coding agents working on the OpenTone project.

## Machine Context

- **Repository location**: This repo lives on the **HP machine** (the user's personal workstation).
- **HP role**: The HP machine is the **runtime and infrastructure node** — it runs builds, tests, and the application. It is **not** the primary development machine.
- **Canonical workspace**: All work on this repository should be done from `~/repos/projects/OpenTone`.

## Before Starting Work

1. **Read MEMORY.md**: Consult the `ai-ops-command` MEMORY.md file for persistent project context, decisions, and ongoing work state. It contains critical context that may not be in this file.
2. **Branch workflow**: This project follows the `feature/initial-opentone-scaffold` branch workflow. The primary working branch is `feature/initial-opentone-scaffold`. Do not commit directly to `main`.
3. **Verify Git state**: Before making changes, check the current branch and ensure it is the correct feature branch.

## Development Flow

1. Pull latest changes from the feature branch.
2. Read `ai-ops-command` MEMORY.md for current task context.
3. Make changes, commit with conventional commits.
4. Push regularly to keep the remote in sync.
5. Update MEMORY.md on significant progress or decisions.

## Key Contacts

- The `scripts/` directory contains helper scripts for building and testing.
- Architecture documentation lives in `docs/`.
- Product specifications live in `docs/product-spec.md`.
