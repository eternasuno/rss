# Bootstrap Protocol
> This file is the project initialization guide. The Agent executes this workflow, generating all configuration files.
> **After bootstrapping, the Agent will overwrite this file with project context.**
---
## Phase 1: Project Discussion
### Step 1: Understand Project Goals
Ask the user the following questions, **one at a time**:
1. What are you building? Describe the core goal in 1-2 sentences.
2. What type of project is this? (CLI tool / Web backend / Web frontend / Full-stack app / Library / Desktop app / Data processing / Other)
3. Do you need a database? If so, SQL or NoSQL?
4. Do you need an HTTP server? (REST / GraphQL / gRPC / None)
5. Do you need a frontend UI? Any framework preference?
6. Target platform? (Linux / macOS / Windows / Web / Cross-platform)
7. Any performance or security requirements?
### Step 2: Recommend Tech Stack
Based on answers above, propose 1-3 options for the user to choose from.
> **Note:** All package manager dependencies must use the **latest stable versions** at the time of generation. Do not pin to specific versions unless explicitly required.

Each option must include a dependency matrix:
```json
[
  {
    "name": "Option A: FastAPI + SQLAlchemy + React",
    "scenario": "Rapid-iteration web app",
    "language": "Python 3.12",
    "runtime": "CPython (devenv → languages.python)",
    "package-manager": "uv (devenv → languages.python.uv)",
    "devenv → languages.python (auto LSP)": ["pyright"],
    "devenv → packages (extra LSPs)": ["nil (nix LSP)"],
    "pkg-manager devDependencies (linter/formatter)": ["ruff", "mypy"],
    "files to create": ["pyproject.toml", "src/main.py", "src/app/", "frontend/"]
  },
  {
    "name": "Option B: Go + sqlx + Templ",
    "scenario": "High-performance web service",
    "language": "Go 1.23",
    "runtime": "Go (devenv → languages.go)",
    "package-manager": "go mod (devenv → languages.go)",
    "devenv → languages.go (auto LSP)": ["gopls"],
    "devenv → packages (extra LSPs)": ["nil (nix LSP)"],
    "pkg-manager devDependencies (linter/formatter)": ["golangci-lint"],
    "files to create": ["go.mod", "cmd/main.go", "internal/"]
  },
  {
    "name": "Option C: Bun + Hono + Drizzle",
    "scenario": "Lightweight full-stack TypeScript app",
    "language": "TypeScript 5.x",
    "runtime": "Bun (devenv → languages.javascript.bun)",
    "package-manager": "Bun (built-in)",
    "devenv → languages.javascript (auto LSP)": ["typescript-language-server"],
    "devenv → packages (extra LSPs)": ["nil (nix LSP)"],
    "pkg-manager devDependencies (linter/formatter)": ["biome"],
    "files to create": ["package.json", "tsconfig.json", "biome.json", "src/index.ts"]
  }
]
```
Let the user pick or adjust any detail.
### Step 3: Confirm Dependency Matrix
Once confirmed, present the matrix:
| Category | Installation method | Config location |
|----------|-------------------|-----------------|
| Compiler / runtime | devenv | `devenv.nix → languages.<lang>` |
| Package manager | devenv | `devenv.nix → languages.<lang>.<pm>` |
| Database / system tools | devenv | `devenv.nix → packages` |
| Language LSP (most auto-installed) | devenv | `devenv.nix → languages.<lang>` (auto) |
| Extra LSPs (e.g. tailwindcss, nil) | devenv | `devenv.nix → packages` |
| Formatter / linter | pkg-manager devDependencies | `pyproject.toml` / `package.json` etc. |
### Step 4: Add Overlays If Needed
If the stack needs extra nix overlays (e.g. `rust-overlay`, `purescript-overlay`), add them to `devenv.yaml`.
---
## Phase 2: Generate All Files
### Format Reference
#### 2.1 `devenv.yaml`
```yaml
inputs:
  nixpkgs:
    url: github:cachix/devenv-nixpkgs/rolling
  # Additional overlay if needed:
  # rust-overlay:
  #   url: github:oxalica/rust-overlay
  #   inputs:
  #     nixpkgs:
  #       follows: nixpkgs
```
#### 2.2 `devenv.nix`
```nix
{ pkgs, ... }:
{
  # ── 1. Language & package manager ──────────────
  # Most languages auto-install their LSP server (e.g.
  #   python → pyright,   go → gopls,
  #   javascript → typescript-language-server,   rust → rust-analyzer)
  languages = {
    javascript = {
      enable = true;
      pnpm = {
        enable = true;
        install.enable = true;
      };
    };
    python = {
      enable = true;
      uv = {
        enable = true;
        sync.enable = true;
      };
    };
    go.enable = true;
    rust.enable = true;
  };

  # ── 2. Extra LSPs NOT auto-provided by languages.<x> ─
  packages = with pkgs; [
    nil          # nix lsp
    # tailwindcss-language-server   # uncomment if using Tailwind
  ];
}
```
#### 2.3 `.nvim.lua`
```lua
-- LSP servers are installed by devenv. Agent generates configs as needed.
-- Most LSPs come free with languages.<x>.enable = true (pyright, gopls, etc.).
-- Only extra LSPs like tailwindcss need explicit install via devenv packages.
vim.lsp.config.tsserver = {
  cmd = { "typescript-language-server", "--stdio" },
  filetypes = { "typescript", "typescriptreact", "javascript", "javascriptreact" },
  root_markers = { "tsconfig.json", "package.json" },
}
vim.lsp.enable("tsserver")
vim.lsp.config.pyright = {
  cmd = { "pyright-langserver", "--stdio" },
  filetypes = { "python" },
  root_markers = { "pyproject.toml", "setup.py", "setup.cfg", "requirements.txt" },
}
vim.lsp.enable("pyright")
vim.lsp.config.gopls = {
  cmd = { "gopls" },
  filetypes = { "go" },
  root_markers = { "go.mod" },
}
vim.lsp.enable("gopls")
vim.lsp.config.rust_analyzer = {
  cmd = { "rust-analyzer" },
  filetypes = { "rust" },
  root_markers = { "Cargo.toml" },
}
vim.lsp.enable("rust_analyzer")
vim.lsp.config.nix = {
  cmd = { "nil" },
  filetypes = { "nix" },
  root_markers = { "flake.nix", "devenv.nix" },
}
vim.lsp.enable("nix")
```
#### 2.4 Scaffolding: Package Config + Source Code
Agent generates language/framework-specific files based on Step 2.
**Python (`pyproject.toml`):**
```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi",
    "sqlalchemy",
    "uvicorn[standard]",
]
[project.optional-dependencies]
dev = [
    "ruff",
    "mypy",
]
[tool.ruff]
line-length = 100
target-version = "py312"
[tool.ruff.lint]
select = ["E", "F", "I", "N", "W"]
[tool.mypy]
strict = true
[build-system]
requires = ["setuptools"]
build-backend = "setuptools.backends._legacy:_Backend"
```
**Source tree layout:**
```
src/
├── __init__.py    # or main.py for simple projects
└── main.py
```
**TypeScript (`package.json`):**
```json
{
  "name": "my-project",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "latest",
    "@biomejs/biome": "latest",
    "tsx": "latest"
  }
}
```
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```
```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "lineWidth": 100
  }
}
```
#### 2.5 GitHub Actions Workflows
> **Note:** The templates below are language-agnostic. The Agent must adapt the `Cache <lang-deps>`, `run` commands, and release `files` to match the chosen tech stack (e.g. `node_modules` + `pnpm-lock.yaml` for JS, `.venv` + `uv.lock` for Python, `target/` + `Cargo.lock` for Rust, `vendor/` + `go.sum` for Go).

**`ci.yml`** — Lint, typecheck, test on push/PR to main:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: cachix/install-nix-action@v31

      - uses: cachix/cachix-action@v16
        with:
          name: devenv

      - name: Install devenv.sh
        run: nix profile add nixpkgs#devenv

      - name: Cache devenv environment
        uses: actions/cache@v4
        with:
          path: .devenv
          key: devenv-${{ runner.os }}-${{ hashFiles('devenv.nix', 'devenv.yaml', 'devenv.lock') }}

      # TODO: Add language-specific dependency cache here, e.g.:
      # - name: Cache node_modules
      #   uses: actions/cache@v4
      #   with:
      #     path: node_modules
      #     key: node_modules-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

      - shell: devenv shell bash -- -e {0}
        run: |
          # TODO: Replace with project-specific commands, e.g.:
          # pnpm run lint
          # pnpm run typecheck
          # pnpm run test
```

#### 2.6 `.gitignore` Append Rules
Base `.gitignore` already exists (direnv, OS files, build output). Append per stack:
```
# TypeScript / Node
node_modules/
# Python
__pycache__/
*.pyc
.venv/
*.egg-info/
# Rust
target/
# Go
vendor/
# IDE (optional)
.vscode/
.idea/
```
Append to `.gitignore`; skip duplicate lines.
### Generation Rules
| Condition | Generate |
|-----------|----------|
| Always | `devenv.yaml`, `devenv.nix`, `.nvim.lua`, `.github/workflows/ci.yml` |
| Per language | Package config (`package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod`) |
| Per language | Linter/formatter config (`biome.json` / `ruff.toml` / `.prettierrc`) |
| Per language | `.gitignore` stack-specific rules |
| Framework discussed | Framework boilerplate (directory structure + entry + routes) |
| Language only | Entry file (`src/main.py` / `src/index.ts` / `cmd/main.go`) |

> **Clean Architecture**: All generated source code must follow clean architecture layering defined in `.agents/skills/clean-architecture/SKILL.md`. Domain logic belongs in usecases, not in adapters or gateways.
---
## Phase 3: Finish Bootstrap
### Step 6: Activate Environment
After generating all files, tell the user:
```bash
direnv allow
```
Wait for user confirmation that the environment activated successfully (direnv will output devenv shell hook logs).
### Step 7: Generate Project Context
After env activation, ask the user:
> Describe this project in 1-2 sentences. Any notable architectural conventions?
Based on the answer, generate concise project context covering:
- **Project goal** — what does this project do?
- **Tech stack** — language, framework, database, key libraries
- **Commands** — dev, build, test, lint, typecheck
- **Dev environment** — direnv + devenv
### Step 8: Regenerate README
After project context is finalized, regenerate `README.md` to reflect the actual project. Read all generated config and source files, then write a concise `README.md` covering:
- **Project name & goal** — what does this project do?
- **Tech stack** — language, framework, database, key libraries
- **Getting Started** — `direnv allow`, install deps, run dev server
- **Commands** — dev, build, test, lint, typecheck
- **Project structure** — key directories and their purpose

### Step 9: Self-Clean
Write the generated project context into `AGENTS.md`, overwriting this bootstrap guide.
Bootstrap complete. All future agent interactions use the new `AGENTS.md` as project context.
---
## References

- `.agents/skills/clean-architecture/SKILL.md` — **Architecture guidelines.** All generated source code should follow clean architecture layering (entity → port → usecase → adapter → infrastructure → gateway). Load this skill when designing new features or reviewing code.
- `.agents/skills/karpathy-guidelines/SKILL.md` — Behavioral guidelines to reduce LLM coding mistakes (simplicity, surgical changes, goal-driven execution).
- `.agents/skills/clean-code/` — Coding conventions for specific languages.
- `devenv` docs: <https://devenv.sh/reference/options/>
