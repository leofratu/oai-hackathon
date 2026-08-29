# Security

## Supported version

The current `main` branch is the supported hackathon version.

## Reporting

Report suspected vulnerabilities privately to the repository owner rather than opening an issue with exploit details.

## Application boundary

Label Loop is a static browser application with synthetic data. Its WebMCP layer enforces the training workflow:

- JSON Schema and runtime checks bound every tool input.
- The agent cannot submit human labels.
- Training accepts human-confirmed samples only.
- Model configuration changes require visible human approval.
- Agent-facing payloads omit individual holdout rows and review reference labels.
- The trace stores compact allowlisted summaries rather than full state.
- Deployment headers restrict framing, content sources, and tool access where the host supports them.

All state and code are downloaded to the browser. This design does not protect bundled data from a person inspecting or modifying their local client. Do not add secrets, credentials, or personal support data to the static application.
