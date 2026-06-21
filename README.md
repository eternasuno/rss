# project-template

A project template with:

- **Dev environment**: [devenv](https://devenv.sh) + direnv — reproducible, Nix-based shell
- **Editor config**: `.devcontainer.json`, `.nvim.lua`, `.opencode/` — ready for Neovim/VS Code
- **Agent scaffolding**: `AGENTS.md` bootstrap protocol for AI-assisted project initialization
- **CI**: `.github/workflows/ci.yml` — lint, typecheck, test

## Getting Started

```bash
direnv allow
```

This activates the devenv shell with all tooling pre-configured.

## Usage

This template is designed to be used with [OpenCode](https://opencode.ai). The `AGENTS.md` guide walks through project setup steps (choosing a tech stack, generating files, activating the environment).

## Structure

```
.
├── .agents/skills/     # AI coding skills (clean-architecture, clean-code, etc.)
├── .github/workflows/  # CI pipeline
├── .devcontainer.json  # VS Code devcontainer
├── .envrc              # direnv hook
├── .gitignore
├── AGENTS.md           # Bootstrap protocol for OpenCode
└── opencode.json       # OpenCode config
```
