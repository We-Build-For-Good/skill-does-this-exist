---
name: does-this-exist
description: "An adversarial prior-art and competitive research protocol and CLI. Before speccing or building any net-new product, feature, or commercial tool, the AI actively searches GitHub, package registries, and the web, compiling a verified RESEARCH-BRIEF.md with an actionable verdict: ADOPT, FORK-AND-EXTEND, or BUILD."
license: MIT
metadata:
  author: We Build for Good
  version: "1.1.0"
---

# Does This Exist? The Pre-Code Prior Art Engine (wb4g-prior-art)

For an AI coding agent, "let us build it" is always one prompt away.

Spending twenty minutes finding out what already exists and rigorously justifying building over adopting is a discipline nobody enforces: because the agent that immediately starts writing code looks more productive than the agent that pauses to search.

The default path, every single time, is to build from scratch. Most of the time, something real already exists, has years of edge-case hardening, and the actual job was to build a thin, distinctive layer on top.

`does-this-exist` turns that missing twenty minutes of adversarial research into an unskippable gate, complete with automated CLI verification.

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
  --verdict "BUILD" \
  --disqualifying "<reasons>" \
  --uncertainty "<limits>"

# Verify compliance
node bin/does-this-exist.mjs verify RESEARCH-BRIEF.md
```

Output requirements:
* **Verdict**: ADOPT / FORK-AND-EXTEND / BUILD.
* **Top 3 Existing Contenders**: Name, repo URL, license, and stars.
* **Why We Cannot Simply Adopt**: If building, the exact hard constraint that failed.
* **Cost of Being Wrong**: What happens if we build this from scratch and someone points out the existing tool tomorrow?
* **Zero Em Dashes**: Invariant enforced across the entire document.
