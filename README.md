# Does This Exist? The Pre-Code Prior Art Engine

> **An open-source AI engineering protocol from [We Build for Good](https://webuildforgood.com)**  
> *Search before you build. Stop reinventing existing tools.*

---

## Overview

`does-this-exist` is an operational research protocol for software engineers and founders working with AI agents (Claude Code, Cursor, Antigravity, OpenAI Codex).

It enforces a mandatory twenty-minute adversarial prior-art search across GitHub, product directories, and the open web before a team commits to building a net-new product, feature, or tool from scratch.

---

## The Verdict

Every run outputs a clear recommendation:
* **ADOPT**: A mature open-source tool already solves this. Use it.
* **FORK-AND-EXTEND**: An existing library solves 80%. Build the remaining 20% on top.
* **BUILD**: Exhaustive search proves no viable solution exists, or all alternatives fail a hard non-negotiable constraint.

---

## Installation

### For Claude Code
```bash
git clone https://github.com/webuildforgood/skill-does-this-exist.git ~/.claude/skills/does-this-exist
```

### For Cursor
```bash
mkdir -p .cursor/skills
git clone https://github.com/webuildforgood/skill-does-this-exist.git .cursor/skills/does-this-exist
```

### For Antigravity / Open Agent Skills
```bash
mkdir -p .agents/skills
git clone https://github.com/webuildforgood/skill-does-this-exist.git .agents/skills/does-this-exist
```

---

## License

MIT License. Developed and maintained by [We Build for Good](https://webuildforgood.com).
