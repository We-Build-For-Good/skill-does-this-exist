import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { generateResearchBrief, verifyResearchBrief, parseArgs, executeCli } from "../bin/does-this-exist.mjs";

test("parseArgs parses flags and positional commands correctly", () => {
  const args = ["verify", "docs/RESEARCH-BRIEF.md", "--strict", "--json"];
  const parsed = parseArgs(args);
  assert.equal(parsed.command, "verify");
  assert.equal(parsed.targetPath, "docs/RESEARCH-BRIEF.md");
  assert.equal(parsed.strict, true);
  assert.equal(parsed.json, true);
});

test("generateResearchBrief generates valid markdown with required sections", () => {
  const brief = generateResearchBrief({
    problem: "We need an automated audio chime when timer expires on mobile Safari.",
    queries: ["mobile safari audio web audio api chime", "html5 audio user interaction bypass"],
    verdict: "BUILD",
    disqualifying: "Existing Web Audio packages are bloated (over 200KB) and require heavy npm react wrappers.",
    uncertainty: "Safari 17 autoplay behavior requires user gesture priming before background tick.",
    candidates: [
      {
        name: "howler.js",
        url: "https://github.com/goldfire/howler.js",
        license: "MIT",
        status: "Maintained, last commit 3 months ago",
        fit: "Too heavy (35KB) for a simple single-frequency oscillator chime"
      },
      {
        name: "soundmanager2",
        url: "https://github.com/scottschiller/SoundManager2",
        license: "BSD-3-Clause",
        status: "Deprecated, last commit 5 years ago",
        fit: "Unmaintained legacy architecture"
      }
    ]
  });

  assert.ok(brief.includes("# Research Brief: Prior Art & Build Decision"));
  assert.ok(brief.includes("Verdict: **BUILD**"));
  assert.ok(brief.includes("## 1. Problem Statement & Hard Constraints"));
  assert.ok(brief.includes("## 2. Search Strategy & Sources Queried"));
  assert.ok(brief.includes("## 3. Evaluated Candidates Matrix"));
  assert.ok(brief.includes("howler.js"));
  assert.ok(brief.includes("soundmanager2"));
  assert.ok(brief.includes("## 4. Disqualifying Criteria"));
  assert.ok(brief.includes("## 5. Residual Uncertainty"));

  // Must not have em dashes
  assert.equal(/[\u2014\u2013]/.test(brief), false);
});

test("verifyResearchBrief passes on a clean, valid brief", () => {
  const validBrief = generateResearchBrief({
    problem: "Need zero-dependency invariant linter checking character-level constraints in CI.",
    queries: ["pre-commit linter zero dependency node", "character level invariant checker"],
    verdict: "BUILD",
    disqualifying: "Standard ESLint plugins require complex npm install graph and fail to catch utf-8 typography in markdown.",
    uncertainty: "Custom regex parser might miss rare binary files if not ignored.",
    cost: "Low: a small linter we can delete in an hour if an existing tool turns out to fit.",
    candidates: [
      {
        name: "eslint-plugin-unicorn",
        url: "https://github.com/sindresorhus/eslint-plugin-unicorn",
        license: "MIT",
        status: "Active",
        fit: "High dependency weight"
      },
      {
        name: "textlint",
        url: "https://github.com/textlint/textlint",
        license: "MIT",
        status: "Active",
        fit: "Requires Node runtime plugin matrix"
      }
    ]
  });

  const result = verifyResearchBrief(validBrief);
  assert.equal(result.valid, true);
  assert.equal(result.verdict, "BUILD");
  assert.equal(result.errors.length, 0);
});

test("verifyResearchBrief catches em dash invariant violations", () => {
  const forbiddenChar = String.fromCharCode(0x2014);
  const briefWithEmDash = generateResearchBrief({
    problem: "Valid problem description exceeding twenty-five characters.",
    verdict: "BUILD"
  }) + "\nHere is a forbidden char: " + forbiddenChar + " which violates our system invariant.\n";

  const result = verifyResearchBrief(briefWithEmDash);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("em dash")));
});

test("verifyResearchBrief rejects invalid verdicts", () => {
  const brief = generateResearchBrief({
    problem: "Valid problem statement description exceeding twenty-five characters.",
    verdict: "MAYBE_BUILD"
  });

  const result = verifyResearchBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("Invalid verdict")));
});

test("verifyResearchBrief rejects missing candidate evaluations", () => {
  const invalidBrief = `# Research Brief: Prior Art & Build Decision
Date: 2026-10-19
Verdict: **BUILD**

## 1. Problem Statement & Hard Constraints
This problem statement is well over twenty-five characters long.

## 2. Search Strategy & Sources Queried
* \`query one\`
* \`query two\`

## 3. Evaluated Candidates Matrix
| Candidate | Repository / URL | License | Status / Maintenance | Fit Assessment |
|:---|:---|:---|:---|:---|

## 4. Disqualifying Criteria (Why Existing Solutions Failed)
None.

## 5. Residual Uncertainty & Known Blind Spots
Search was limited.

## 6. Actionable Recommendation
Final Decision: **BUILD**
`;

  const result = verifyResearchBrief(invalidBrief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("must evaluate at least 2 candidates")));
});

test("executeCli generates and verifies file end-to-end", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wb4g-prior-art-test-"));
  const briefFile = path.join(tmpDir, "RESEARCH-BRIEF.md");

  try {
    // Generate
    const genCode = executeCli([
      "generate",
      "--output", briefFile,
      "--problem", "Automated release packaging pipeline compiling commits into manifests.",
      "--queries", "release manifest generator, changelog generator node zero dep",
      "--verdict", "BUILD",
      "--disqualifying", "Semantic-release forces automated npm publish; we require strict human sign-off boundary.",
      "--uncertainty", "Git tag naming conventions must match vX.Y.Z.",
      "--cost", "A week of work duplicated if semantic-release can be configured for manual sign-off.",
      "--candidates", JSON.stringify([
        { name: "semantic-release", url: "https://github.com/semantic-release/semantic-release", license: "MIT", status: "Active", fit: "Publishes automatically" },
        { name: "release-please", url: "https://github.com/googleapis/release-please", license: "Apache-2.0", status: "Active", fit: "Needs GitHub Actions" }
      ])
    ]);
    assert.equal(genCode, 0);
    assert.ok(fs.existsSync(briefFile));

    // Verify
    const verifyCode = executeCli(["verify", briefFile]);
    assert.equal(verifyCode, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wb4g-prior-art-"));
}

test("regression: 'generate' with no research cannot pass 'verify --strict'", () => {
  // 1.1.0 filled gaps with invented candidates (github.com/example/one) and default queries,
  // so 'generate' followed by 'verify --strict' passed with zero research done.
  const dir = tmp();
  const file = path.join(dir, "RESEARCH-BRIEF.md");
  try {
    assert.equal(executeCli(["generate", "--output", file]), 0);
    const content = fs.readFileSync(file, "utf8");
    assert.equal(content.includes("github.com/example"), false);
    assert.equal(executeCli(["verify", file, "--strict", "--json"]), 1);
    assert.match(verifyResearchBrief(content).errors.join(" "), /TODO/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("regression: placeholder and missing candidate URLs are rejected", () => {
  const brief = generateResearchBrief({
    problem: "A problem statement that is comfortably over twenty-five characters.",
    queries: ["one", "two"],
    verdict: "ADOPT",
    disqualifying: "n/a",
    uncertainty: "Only GitHub was searched, not npm.",
    cost: "Low.",
    candidates: [
      { name: "One", url: "https://github.com/example/one", license: "MIT", status: "x", fit: "x" },
      { name: "Two", url: "not a url", license: "MIT", status: "x", fit: "x" }
    ]
  });
  const result = verifyResearchBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("placeholder URL")));
  assert.ok(result.errors.some(e => e.includes("no http(s) URL")));
});

test("regression: --strict turns warnings into errors", () => {
  // 1.1.0 parsed --strict but never used it.
  const brief = generateResearchBrief({
    problem: "A problem statement that is comfortably over twenty-five characters.",
    queries: ["only one query"],
    verdict: "ADOPT",
    disqualifying: "Not needed for ADOPT.",
    uncertainty: "Only GitHub was searched, not npm or PyPI.",
    cost: "Low.",
    candidates: [
      { name: "A", url: "https://github.com/a/a", license: "MIT", status: "x", fit: "x" },
      { name: "B", url: "https://github.com/b/b", license: "MIT", status: "x", fit: "x" }
    ]
  });
  assert.equal(verifyResearchBrief(brief).valid, true);
  assert.equal(verifyResearchBrief(brief, { strict: true }).valid, false);
});

test("regression: BUILD without a disqualifying reason fails", () => {
  const brief = generateResearchBrief({
    problem: "A problem statement that is comfortably over twenty-five characters.",
    queries: ["one", "two"],
    verdict: "BUILD",
    disqualifying: "None.",
    uncertainty: "Only GitHub was searched, not npm or PyPI.",
    cost: "High.",
    candidates: [
      { name: "A", url: "https://github.com/a/a", license: "MIT", status: "x", fit: "x" },
      { name: "B", url: "https://github.com/b/b", license: "MIT", status: "x", fit: "x" }
    ]
  });
  assert.ok(verifyResearchBrief(brief).errors.some(e => e.includes("Verdict is BUILD")));
});

test("pipes in candidate fields do not break the table", () => {
  const brief = generateResearchBrief({
    candidates: [
      { name: "A", url: "https://github.com/a/a", license: "MIT", status: "ok", fit: "fast | small" },
      { name: "B", url: "https://github.com/b/b", license: "MIT", status: "ok", fit: "x" }
    ]
  });
  assert.ok(brief.includes("fast \\| small"));
  assert.equal(verifyResearchBrief(brief).errors.some(e => e.includes("Candidate")), false);
});

test("CLI: generate refuses to overwrite, rejects bad verdicts and unknown options", () => {
  const dir = tmp();
  const file = path.join(dir, "RESEARCH-BRIEF.md");
  try {
    assert.equal(executeCli(["generate", "--output", file]), 0);
    assert.equal(executeCli(["generate", "--output", file]), 2);
    assert.equal(executeCli(["generate", "--output", file, "--force"]), 0);
    assert.equal(executeCli(["generate", "--output", path.join(dir, "b.md"), "--verdict", "MAYBE"]), 2);
    assert.equal(executeCli(["verify", "--bogus"]), 2);
    assert.equal(executeCli(["verify", path.join(dir, "missing.md")]), 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
