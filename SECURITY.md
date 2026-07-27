# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

## Prompt Injection Protection

The Fashion Hub AI Assistant implements multiple layers of protection against prompt injection:

1. **Role-bound Prompts** — The SYSTEM_CORE prompt explicitly establishes the AI's role as "FashionHub's AI Sales Assistant," creating a strong behavioral boundary.

2. **Constrained Output Format** — The understanding prompt strictly limits output to a predefined JSON schema, preventing arbitrary output.

3. **Intent Classification as Filter** — Malicious or out-of-scope queries are classified as "other" intent with low confidence and routed to safe general responses.

4. **Confidence Threshold** — A 0.3 minimum confidence threshold prevents low-confidence classifications from triggering domain-specific actions.

5. **Checkout Override Protection** — When a checkout is in progress, intent routing is overridden to prevent injection into the payment flow.

## Input Validation

- **Pydantic Models** — All API requests are validated by Pydantic schemas at the FastAPI layer
- **Mongoose Schemas** — Database operations are validated by Mongoose schema definitions
- **Type Enforcement** — Request fields are strictly typed (string, number, array, etc.)
- **Error Messages** — Validation errors return structured 422 responses without exposing internals

## Secrets Management

- All API keys and credentials are stored in `.env` files (excluded from git via `.gitignore`)
- Never commit `.env` files to the repository
- Use `.env.example` templates for setup (placeholders only)
- JWT secrets should be strong, unique, and rotated periodically
- MongoDB Atlas connection strings should use a database user with least privilege

## Reporting a Vulnerability

To report a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Contact the project maintainers directly
3. Include a detailed description of the vulnerability
4. Include steps to reproduce (if applicable)
5. Include potential impact assessment

You can expect:
- Acknowledgement within 48 hours
- Regular updates on progress
- Credit for responsible disclosure (if desired)

## Known Limitations

- The current implementation does not wrap multi-document purchase flows in MongoDB ACID transactions. In the event of a crash between stock decrement and order creation, manual reconciliation via the inventory_history audit trail may be required.
- API rate limiting is not implemented. Production deployments should add a reverse proxy (nginx) with rate limiting.
- No input sanitization is performed beyond Pydantic type validation. The LLM prompt structure provides implicit protection but is not guaranteed against advanced injection techniques.
- CORS is configured to allow all origins (`allow_origins=["*"]`). Restrict this in production.
