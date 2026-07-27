# Contributing to Fashion Hub AI Assistant

Thank you for considering contributing to Fashion Hub AI Assistant. This document outlines the contribution workflow, coding standards, and expectations.

## Code of Conduct

All contributors must adhere to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Branch Naming Convention

- `main` — Production-ready code
- `develop` — Integration branch
- `feature/<name>` — New features (e.g., `feature/order-cancellation`)
- `fix/<name>` — Bug fixes (e.g., `fix/stock-validation`)
- `docs/<name>` — Documentation changes
- `refactor/<name>` — Code refactoring

## Commit Message Convention

Use conventional commits:

```
<type>(<scope>): <description>

[optional body]
```

Types:
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting, missing semicolons, etc. (no code change)
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `perf` — Performance improvement
- `test` — Adding or updating tests
- `chore` — Build process, tooling, dependencies

Examples:
```
feat(cart): add stock validation before adding item
fix(order): correct delivery charge calculation for same city
docs(readme): update installation steps
```

## Pull Request Process

1. Fork the repository and create your branch from `develop`
2. Ensure your code follows the existing style and conventions
3. Test your changes thoroughly
4. Update documentation if needed
5. Create a pull request with a clear description of changes
6. Link any related issues

## Development Setup

See [README.md](README.md#installation) for detailed setup instructions.

## Coding Standards

### Python (ai-service)
- Follow PEP 8
- Use type hints for all function signatures
- Use async/await for I/O operations
- Use f-strings for string formatting
- Maximum line length: 100 characters

### JavaScript / React (frontend)
- Use ES6+ syntax
- Use functional components with hooks
- Use Tailwind CSS utility classes (no custom CSS unless necessary)
- Use early returns for conditional rendering
- Destructure props and state

### Documentation
- Write in British English
- Use Markdown for documentation
- Keep documentation up to date with code changes
- Add docstrings for all public functions

## Folder Conventions

- `ai-service/app/graph/` — LangGraph workflow (state, nodes, builder, workflow)
- `ai-service/app/llm/` — LLM integration (engine, prompts, understanding, response)
- `ai-service/app/tools/` — Domain operation tools
- `ai-service/app/services/` — Business logic services
- `ai-service/app/repositories/` — Data access layer
- `frontend/src/components/` — React components
- `frontend/src/hooks/` — Custom React hooks
- `frontend/src/services/` — API client and utilities
- `frontend/src/pages/` — Page-level components
- `backend/controllers/` — Request handlers
- `backend/services/` — Business logic
- `backend/models/` — Mongoose schemas

## Testing

- Test all new functionality
- Verify existing tests still pass
- Run tests before submitting a PR
- Document test scenarios in PR description

## Questions?

Open an issue or discussion on GitHub.
