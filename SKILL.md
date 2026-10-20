---
name: does-this-exist
description: "A prior-art research protocol and CLI. Before speccing or building any net-new product, feature, or tool, the AI searches GitHub, package registries, and the web, writes a RESEARCH-BRIEF.md, and gives a verdict: ADOPT, FORK-AND-EXTEND, or BUILD. The CLI checks the brief is complete and has no placeholders."
license: MIT
metadata:
  author: We Build for Good
  version: "2.0.0"
---

# Does This Exist? The Pre-Code Prior Art Engine (wb4g-prior-art)

For an AI coding agent, "let us build it" is always one prompt away.

Spending twenty minutes finding out what already exists and rigorously justifying building over adopting is a discipline nobody enforces: because the agent that immediately starts writing code looks more productive than the agent that pauses to search.

The default path, every single time, is to build from scratch. Most of the time, something real already exists, has years of edge-case hardening, and the actual job was to build a thin, distinctive layer on top.

`does-this-exist` turns that missing twenty minutes into a written brief with a verdict, and a CLI that refuses a brief that is unfinished or padded with placeholders.

---

## The Prime Philosophy

**The verdict, not the list of links, is the product.**

A keyword search surfaces a list of URLs and leaves the reading to the founder. This protocol requires the AI to actively read the top repositories, inspect their license, check their maintenance status, compile a structured `RESEARCH-BRIEF.md`, and deliver an actionable verdict: **ADOPT / FORK-AND-EXTEND / BUILD**, citing what it costs to be wrong.

---

## When to Reach for This

Before speccing or building **any** net-new:
* Product idea or standalone micro-SaaS.
* Major product feature (e.g. video processing, PDF generation, analytics dashboard).
* Developer tool or CLI utility.
* Pricing and packaging model.

---

## The Four-Step Investigation Protocol

### Step 1: Adversarial Search (GitHub + Open Web)
* Search GitHub using multiple search angles (queries, topic tags, stars > 100).
* Search product directories (Product Hunt, AlternativeTo, niche forums).
* Do not stop at the first page: look for the mature open-source tool that solved this three years ago.

### Step 2: The Three Quality Filters
For each contender found:
1. **Maturity & Maintenance**: When was the last commit? How many open issues?
2. **License Viability**: Is it permissive (MIT, Apache 2.0, BSD) or restrictive (GPL, AGPL, proprietary)?
3. **Architecture Fit**: Does it run locally? Does it require heavy Docker containers or paid cloud APIs?

### Step 3: Assess the Distinctive Delta
Ask: *"What is genuinely unique about what we want to build?"*
* If the unique part is just the UI, brand, or workflow: **FORK OR EXTEND.** Do not rebuild the engine underneath.
* If existing tools fail a hard requirement (privacy, local execution, specific platform constraint): **BUILD**, and cite the exact disqualifying constraint.

### Step 4: Issue and Verify the Verdict
Generate and verify the structured brief:

```bash
# Generate brief
node bin/does-this-exist.mjs generate \
  --problem "<description>" \
  --queries "<query1>, <query2>" \
  --candidates candidates.json \
  --verdict "BUILD" \
  --disqualifying "<reasons>" \
  --uncertainty "<limits>" \
  --cost "<what it costs if this is wrong>"

# Verify compliance
node bin/does-this-exist.mjs verify RESEARCH-BRIEF.md
```

Pass the candidates you actually evaluated with `--candidates '[{"name":"...","url":"https://...","license":"MIT","status":"...","fit":"..."}]'` (or a path to a JSON file), and the cost of being wrong with `--cost`. Anything you leave out is written as a `TODO:` line, and `verify` fails while any TODO remains. `generate` on its own therefore never produces a passing brief.

What `verify` checks (exit 0 pass, 1 fail, 2 bad options or missing file):
* No `TODO:` lines left, and no em dashes.
* A problem statement of at least 25 characters.
* At least 2 candidates, each with a real http(s) URL (example.com and github.com/example are rejected).
* A verdict of ADOPT, FORK-AND-EXTEND or BUILD. BUILD also needs a disqualifying reason.
* Warnings (errors with `--strict`): fewer than 2 queries, a very short uncertainty section, no "Cost of Being Wrong" section, duplicate candidate names.

These are structural checks. They catch an unfinished or placeholder brief; they cannot tell whether the search was thorough. Someone still has to read it.
