# Does This Exist? The Pre-Code Prior Art Engine (wb4g-prior-art)

> **An open-source AI engineering protocol and CLI from [We Build for Good](https://webuildforgood.com)**  
> *Search before you build. Stop reinventing existing tools.*

---

## Overview

`does-this-exist` (`wb4g-prior-art`) is an operational research protocol and deterministic CLI for software engineers, product leads, and autonomous AI agents (Antigravity, Claude Code, Cursor, Codex).

It enforces a mandatory prior-art investigation across GitHub, package registries, and product directories before committing to building net-new software. It replaces unstructured search chatter with a verifiable, mathematically auditable `RESEARCH-BRIEF.md`.

---

## The Three Verdicts

Every investigation terminates in an explicit, traceable verdict:
* **ADOPT**: A mature, maintained open-source solution satisfies constraints. Adopt and integrate it.
* **FORK-AND-EXTEND**: An existing base covers foundational requirements. Fork or wrap it, building only the distinctive layer.
* **BUILD**: Exhaustive search confirms existing candidates fail documented, non-negotiable requirements (licensing, performance, local execution, privacy boundaries).

---

## Executable CLI Usage

Install locally or run via node:

```bash
# Verify a research brief before writing code
node bin/does-this-exist.mjs verify RESEARCH-BRIEF.md

# Verify with strict CI failure on warnings
node bin/does-this-exist.mjs verify --strict

# Check whether target repository contains a verified brief
node bin/does-this-exist.mjs check-repo /path/to/repo

# Generate a structured research brief
node bin/does-this-exist.mjs generate \
  --problem "Deterministic audio notification engine for mobile web" \
  --queries "web audio chime mobile safari, html5 audio background" \
  --verdict "BUILD" \
  --disqualifying "Existing libraries exceed 50KB bundle limit" \
  --uncertainty "Autoplay policy on iOS 17 requires initial user touch"
```

---

## The Required Research Brief Standard

A valid `RESEARCH-BRIEF.md` must contain:
1. **Problem Statement & Hard Constraints**: Detailed technical requirements.
2. **Search Strategy & Sources Queried**: Documented queries executed across GitHub and registries.
3. **Evaluated Candidates Matrix**: Structured comparison table with at least 2 distinct candidates (URL, License, Maintenance, Fit).
4. **Disqualifying Criteria**: Concrete failure reasons for rejected alternatives.
5. **Residual Uncertainty**: Acknowledged blind spots and search boundaries.
6. **Actionable Verdict**: Strictly `ADOPT`, `FORK-AND-EXTEND`, or `BUILD`.
7. **System Invariant Compliance**: Strictly zero em dashes throughout documentation.

---

## Installation

### As CLI Tool
```bash
git clone https://github.com/We-Build-For-Good/skill-does-this-exist.git
cd skill-does-this-exist
npm test
npm link
```

### For Antigravity / Gemini
```bash
mkdir -p ~/.gemini/config/skills/does-this-exist
cp -r . ~/.gemini/config/skills/does-this-exist/
```

### For Claude Code
```bash
git clone https://github.com/We-Build-For-Good/skill-does-this-exist.git ~/.claude/skills/does-this-exist
```

---

## Automated Test Suite

```bash
node --test test/*.test.mjs
```

---

## License

MIT License. Developed and maintained by [We Build for Good](https://webuildforgood.com).
