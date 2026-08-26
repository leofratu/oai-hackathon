# Security

## Supported version

The current `main` branch is the supported hackathon version.

## Reporting

Please report a suspected vulnerability privately to the repository owner rather than opening a public issue containing exploit details.

## Security model

Seven Transects is a static browser game. Its WebMCP tools enforce application permissions and information flow for cooperative play:

- tool inputs use bounded JSON Schema;
- mutating tools are labeled and visibly update the page;
- agent proposals require human approval;
- truth, seed, and exact live correctness are omitted from tool results;
- state-changing operations are rejected after the final reveal;
- security and WebMCP response headers are included for deployment.

Because generation and state live in downloaded JavaScript, this is not intended to resist a person deliberately reverse-engineering or modifying their local client. Do not store secrets or sensitive personal data in the application state.
