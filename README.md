# Does This Exist? The Pre-Code Prior Art Engine (wb4g-prior-art)

> **An open-source AI engineering protocol and CLI from [We Build for Good](https://webuildforgood.com)**  
> *Search before you build. Stop reinventing existing tools.*

---

## Overview

`does-this-exist` (`wb4g-prior-art`) is a research protocol and CLI for engineers, product leads, and AI coding agents (Claude Code, Cursor, Codex, Gemini).

It asks for a prior-art search across GitHub, package registries, and product directories before building net-new software, written up as a `RESEARCH-BRIEF.md`. The CLI checks the brief is complete and free of placeholders; a person still judges whether the research was good.

---

## The Three Verdicts

Every investigation terminates in an explicit, traceable verdict:
* **ADOPT**: A mature, maintained open-source solution satisfies constraints. Adopt and integrate it.
* **FORK-AND-EXTEND**: An existing base covers foundational requirements. Fork or wrap it, building only the distinctive layer.
* **BUILD**: The candidates found fail documented, non-negotiable requirements (licensing, performance, local execution, privacy boundaries).

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
  --candidates candidates.json \
  --disqualifying "Existing libraries exceed 50KB bundle limit" \
  --uncertainty "Autoplay policy on iOS 17 requires initial user touch" \
  --cost "Two days of work if a small library already fits"
```

Anything you do not pass is written as a `TODO:` line, and `verify` fails until every TODO is replaced. `generate` will not overwrite an existing brief unless you pass `--force`.

Exit codes: `0` passed, `1` failed verification, `2` bad options or file not found.

---

## The Required Research Brief Standard

A valid `RESEARCH-BRIEF.md` must contain:
1. **Problem Statement & Hard Constraints**: Detailed technical requirements.
2. **Search Strategy & Sources Queried**: Documented queries executed across GitHub and registries.
3. **Evaluated Candidates Matrix**: A table of at least 2 candidates, each with a real URL, license, maintenance status and fit.
4. **Disqualifying Criteria**: Concrete failure reasons for rejected alternatives.
5. **Residual Uncertainty**: Acknowledged blind spots and search boundaries.
6. **Cost of Being Wrong**: What happens if the verdict is wrong (warning if missing).
7. **Verdict**: `ADOPT`, `FORK-AND-EXTEND`, or `BUILD`. BUILD must say which hard requirement each candidate fails.
8. **No placeholders and no em dashes**: no `TODO:` lines; each candidate has a real URL.

---

## Installation

### As CLI Tool
```bash
git clone https://github.com/We-Build-For-Good/skill-does-this-exist.git
cd skill-does-this-exist
npm test
npm link
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
