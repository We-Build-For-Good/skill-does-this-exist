#!/usr/bin/env node

/**
 * We Build for Good: Does This Exist? (wb4g-prior-art)
 * 
 * Writes and checks a prior-art research brief (RESEARCH-BRIEF.md).
 * The checks are structural: they catch an unfilled or placeholder brief,
 * not shallow research. A person still has to read the brief.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const VALID_VERDICTS = ["ADOPT", "FORK-AND-EXTEND", "BUILD"];

function printHelp() {
  console.log(`
We Build for Good: Prior Art Research Engine (wb4g-prior-art)

Usage:
  wb4g-prior-art <command> [options]
  node does-this-exist.mjs <command> [options]

Commands:
  verify [path]           Verify a RESEARCH-BRIEF.md against quality invariants
  generate [options]      Generate a structured research brief template or file
  check-repo [dir]        Check if target repository contains a valid research brief
  --help, -h              Show this help message

Options for 'generate':
  --problem <text>        Problem statement and requirements
  --queries <queries>     Comma-separated search queries used
  --verdict <choice>      One of: ADOPT, FORK-AND-EXTEND, BUILD
  --candidates <json>     JSON array (or a .json file) of [{name, url, license, status, fit}]
  --disqualifying <text>  Why alternatives were rejected (required for BUILD)
  --uncertainty <text>    Residual uncertainty or blind spots
  --cost <text>           What it costs if the verdict is wrong
  --author <name>         Author (default: unspecified)
  --output <path>         Output path (default: ./RESEARCH-BRIEF.md)
  --force                 Overwrite an existing file

  Anything you do not supply is written as a "TODO:" line. A brief with any
  TODO left in it fails 'verify', so 'generate' alone can never pass the gate.

Options for 'verify' and 'check-repo':
  --strict                Treat warnings as errors
  --json                  Output results as JSON

Exit codes: 0 passed, 1 failed verification, 2 bad options or file not found.
`);
}

export function parseArgs(args) {
  const options = {
    command: "",
    targetPath: "",
    problem: "",
    queries: [],
    verdict: "",
    candidates: [],
    disqualifying: "",
    uncertainty: "",
    cost: "",
    author: "",
    output: "./RESEARCH-BRIEF.md",
    strict: false,
    json: false,
    force: false,
    help: false,
    errors: []
  };
  const boolFlags = { "--help": "help", "-h": "help", "--strict": "strict", "--json": "json", "--force": "force" };
  const valueFlags = ["--problem", "--queries", "--verdict", "--disqualifying", "--uncertainty", "--cost", "--author", "--output", "--candidates"];
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (boolFlags[arg]) {
      options[boolFlags[arg]] = true;
      continue;
    }
    if (valueFlags.includes(arg)) {
      if (i + 1 >= args.length || args[i + 1].startsWith("--")) {
        options.errors.push(`${arg} needs a value.`);
        continue;
      }
      const value = args[++i];
      const key = arg.slice(2);
      if (key === "queries") options.queries = value.split(",").map(q => q.trim()).filter(Boolean);
      else if (key === "verdict") options.verdict = value.trim().toUpperCase();
      else if (key === "candidates") {
        try {
          const parsed = JSON.parse(fs.existsSync(value) ? fs.readFileSync(value, "utf8") : value);
          if (!Array.isArray(parsed)) throw new Error("expected a JSON array");
          options.candidates = parsed;
        } catch (err) {
          options.errors.push(`Failed to parse --candidates: ${err.message}`);
        }
      } else options[key] = value;
      continue;
    }
    if (arg.startsWith("-")) options.errors.push(`Unknown option: ${arg}`);
    else positional.push(arg);
  }

  if (positional.length > 0) options.command = positional[0];
  if (positional.length > 1) options.targetPath = positional[1];
  if (positional.length > 2) options.errors.push(`Unexpected arguments: ${positional.slice(2).join(" ")}`);
  return options;
}

const TODO = "TODO:";
const PLACEHOLDER_URL = /^https?:\/\/(www\.)?(example\.(com|org|net)|github\.com\/example)(\/|$)/i;

function cell(value) {
  return String(value ?? "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim() || `${TODO} fill in`;
}

export function generateResearchBrief(data) {
  const now = new Date().toISOString().split("T")[0];
  const problem = data.problem || `${TODO} describe the problem and the hard constraints any solution must meet.`;
  const queries = data.queries && data.queries.length > 0
    ? data.queries
    : [`${TODO} first search query you actually ran`, `${TODO} second search query you actually ran`];
  const verdict = data.verdict || `${TODO} ADOPT, FORK-AND-EXTEND or BUILD`;
  const disqualifying = data.disqualifying || `${TODO} for each rejected candidate, the hard requirement it fails.`;
  const uncertainty = data.uncertainty || `${TODO} what you did not search, and what could change the verdict.`;
  const cost = data.cost || `${TODO} what it costs if this verdict turns out to be wrong.`;
  const author = data.author || "unspecified";

  // Never invent candidates: an empty list becomes TODO rows that fail verification.
  const candidates = data.candidates && data.candidates.length > 0
    ? data.candidates
    : [
        { name: `${TODO} candidate`, url: "", license: "", status: "", fit: "" },
        { name: `${TODO} candidate`, url: "", license: "", status: "", fit: "" }
      ];

  let candidateTable = "| Candidate | Repository / URL | License | Status / Maintenance | Fit Assessment |\n";
  candidateTable += "|:---|:---|:---|:---|:---|\n";
  for (const c of candidates) {
    candidateTable += `| ${cell(c.name)} | ${cell(c.url)} | ${cell(c.license)} | ${cell(c.status)} | ${cell(c.fit)} |\n`;
  }

  const queriesList = queries.map(q => `* \`${q}\``).join("\n");

  const brief = `# Research Brief: Prior Art & Build Decision

Date: ${now}  
Author: ${author}  
Verdict: **${verdict}**  

---

## 1. Problem Statement & Hard Constraints

${problem}

---

## 2. Search Strategy & Sources Queried

Queries run (and where):
${queriesList}

---

## 3. Evaluated Candidates Matrix

${candidateTable}
---

## 4. Disqualifying Criteria (Why Existing Solutions Failed)

${disqualifying}

---

## 5. Residual Uncertainty & Known Blind Spots

${uncertainty}

---

## 6. Cost of Being Wrong

${cost}

---

## 7. Recommendation

* **Final Decision**: **${verdict}**
* **Next Action**: ${verdict === "ADOPT" ? "Add the chosen tool as a dependency and integrate it." : verdict === "FORK-AND-EXTEND" ? "Fork or wrap the chosen base and build only the distinctive layer." : verdict === "BUILD" ? "Build, keeping the disqualifying constraints above as acceptance tests." : `${TODO} next action`}
`;

  return brief;
}

function section(content, heading, nextNumber) {
  const parts = content.split(heading);
  if (parts.length < 2) return null;
  // Drop the rest of the heading line, keep the body up to the next numbered section.
  const body = parts[1].split(new RegExp(`\\n## ${nextNumber}\\.`))[0];
  return body.slice(body.indexOf("\n") + 1);
}

/** Rows of the candidates table (header and separator removed), as arrays of cells. */
function tableRows(sectionText) {
  return sectionText
    .split("\n")
    .map(r => r.trim())
    .filter(r => r.startsWith("|") && !/^\|\s*:?-{3,}/.test(r) && !/^\|\s*candidate\s*\|/i.test(r))
    .map(r => r.replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map(c => c.trim()));
}

export function verifyResearchBrief(content, { strict = false } = {}) {
  const errors = [];
  const warnings = [];

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return { valid: false, verdict: null, errors: ["Research brief file is empty or missing"], warnings: [] };
  }

  // 1. Unfilled template
  const todoLines = content.split("\n").filter(l => l.includes(TODO)).length;
  if (todoLines > 0) {
    errors.push(`Brief still has ${todoLines} unfilled TODO line(s). Replace every TODO with what you actually found.`);
  }

  // 2. No em dashes
  const emDashes = (content.match(/\u2014/g) || []).length;
  if (emDashes > 0) {
    errors.push(`Found ${emDashes} em dash(es). Use colons, commas, or parentheses instead.`);
  }

  // 3. Problem statement
  const problem = section(content, "## 1. Problem Statement", 2);
  if (problem === null) errors.push("Missing section: '## 1. Problem Statement & Hard Constraints'");
  else if (problem.replace(/-{3,}/g, "").trim().length < 25) errors.push("Problem statement is too short (under 25 characters).");

  // 4. Search strategy
  const search = section(content, "## 2. Search Strategy", 3);
  if (search === null) errors.push("Missing section: '## 2. Search Strategy & Sources Queried'");
  else {
    const queries = search.split("\n").filter(l => /^\s*[*-]\s+\S/.test(l));
    if (queries.length < 2) warnings.push(`Search strategy lists ${queries.length} query(ies); at least 2 expected.`);
  }

  // 5. Candidates: at least 2, each with a real URL
  const candidatesText = section(content, "## 3. Evaluated Candidates Matrix", 4);
  if (candidatesText === null) errors.push("Missing section: '## 3. Evaluated Candidates Matrix'");
  else {
    const rows = tableRows(candidatesText);
    if (rows.length < 2) errors.push(`Candidates matrix must evaluate at least 2 candidates (found ${rows.length}).`);
    rows.forEach((cells, i) => {
      const url = cells.find(c => /^https?:\/\//i.test(c));
      if (!url) errors.push(`Candidate ${i + 1} (${cells[0] || "unnamed"}) has no http(s) URL.`);
      else if (PLACEHOLDER_URL.test(url)) errors.push(`Candidate ${i + 1} (${cells[0]}) uses a placeholder URL: ${url}`);
    });
    const names = rows.map(r => (r[0] || "").toLowerCase());
    if (new Set(names).size < names.length) warnings.push("Two candidates share the same name.");
  }

  // 6. Disqualifying criteria
  const disqualifying = section(content, "## 4. Disqualifying Criteria", 5);
  if (disqualifying === null) errors.push("Missing section: '## 4. Disqualifying Criteria'");

  // 7. Residual uncertainty
  const uncertainty = section(content, "## 5. Residual Uncertainty", 6);
  if (uncertainty === null) errors.push("Missing section: '## 5. Residual Uncertainty & Known Blind Spots'");
  else if (uncertainty.replace(/-{3,}/g, "").trim().length < 20) warnings.push("Residual uncertainty section is very short.");

  // 8. Cost of being wrong (added in 2.0.0; older briefs get a warning)
  if (!content.includes("## 6. Cost of Being Wrong")) warnings.push("No '## 6. Cost of Being Wrong' section.");

  // 9. Verdict
  const verdictMatch = content.match(/Verdict:\s*\*\*([A-Z0-9_-]+)\*\*/i) || content.match(/Final Decision\*\*:\s*\*\*([A-Z0-9_-]+)\*\*/i);
  let parsedVerdict = null;
  if (!verdictMatch) {
    errors.push("Missing or unparseable verdict (expected: Verdict: **ADOPT|FORK-AND-EXTEND|BUILD**).");
  } else {
    parsedVerdict = verdictMatch[1].toUpperCase();
    if (!VALID_VERDICTS.includes(parsedVerdict)) {
      errors.push(`Invalid verdict '${parsedVerdict}'. Must be one of: ${VALID_VERDICTS.join(", ")}`);
    }
  }

  // 10. BUILD needs a stated reason
  if (parsedVerdict === "BUILD" && disqualifying !== null && disqualifying.replace(/-{3,}/g, "").trim().length < 25) {
    errors.push("Verdict is BUILD but the disqualifying criteria section is empty or too short. Say which hard requirement each candidate fails.");
  }

  if (strict && warnings.length > 0) {
    errors.push(...warnings.map(w => `(strict) ${w}`));
  }

  return { valid: errors.length === 0, verdict: parsedVerdict, errors, warnings };
}

function printResult(resolvedPath, result) {
  console.log("===========================================================");
  console.log(" We Build for Good: Prior Art Research Brief Verification");
  console.log(` File    : ${resolvedPath}`);
  console.log(` Status  : ${result.valid ? "PASSED" : "FAILED"}`);
  console.log(` Verdict : ${result.verdict || "UNKNOWN"}`);
  console.log("===========================================================");
  if (result.errors.length > 0) {
    console.log("\n[Errors]:");
    for (const err of result.errors) console.log(`  * ${err}`);
  }
  if (result.warnings.length > 0) {
    console.log("\n[Warnings]:");
    for (const warn of result.warnings) console.log(`  * ${warn}`);
  }
  console.log(result.valid
    ? "\nBrief passes the structural checks. This does not prove the research was thorough: read it."
    : `\nVerification failed with ${result.errors.length} error(s).`);
}

function verifyFile(resolvedPath, options) {
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[wb4g-prior-art] Error: file not found: ${resolvedPath}`);
    return 2;
  }
  const result = verifyResearchBrief(fs.readFileSync(resolvedPath, "utf8"), { strict: options.strict });
  if (options.json) console.log(JSON.stringify({ path: resolvedPath, ...result }, null, 2));
  else printResult(resolvedPath, result);
  return result.valid ? 0 : 1;
}

export function executeCli(args = process.argv.slice(2)) {
  const options = parseArgs(args);

  if (options.help || !options.command) {
    printHelp();
    return options.help ? 0 : 2;
  }
  if (options.errors.length > 0) {
    for (const e of options.errors) console.error(`[wb4g-prior-art] Error: ${e}`);
    return 2;
  }

  if (options.command === "generate") {
    if (options.verdict && !VALID_VERDICTS.includes(options.verdict)) {
      console.error(`[wb4g-prior-art] Error: --verdict must be one of ${VALID_VERDICTS.join(", ")}.`);
      return 2;
    }
    const outputPath = path.resolve(process.cwd(), options.output);
    if (fs.existsSync(outputPath) && !options.force) {
      console.error(`[wb4g-prior-art] Error: ${outputPath} already exists. Pass --force to overwrite it.`);
      return 2;
    }
    const briefContent = generateResearchBrief(options);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, briefContent, "utf8");
    const todos = briefContent.split("\n").filter(l => l.includes(TODO)).length;

    if (options.json) {
      console.log(JSON.stringify({ success: true, path: outputPath, verdict: options.verdict || null, todos }, null, 2));
    } else {
      console.log(`[wb4g-prior-art] Research brief written: ${outputPath}`);
      if (todos > 0) console.log(`[wb4g-prior-art] ${todos} TODO line(s) to fill in before it can pass 'verify'.`);
    }
    return 0;
  }

  if (options.command === "verify") {
    return verifyFile(path.resolve(process.cwd(), options.targetPath || "./RESEARCH-BRIEF.md"), options);
  }

  if (options.command === "check-repo") {
    const repoPath = path.resolve(options.targetPath || process.cwd());
    const briefPath = path.join(repoPath, "RESEARCH-BRIEF.md");
    if (!fs.existsSync(briefPath)) {
      console.error(`[wb4g-prior-art] No RESEARCH-BRIEF.md found in ${repoPath}`);
      return 1;
    }
    return verifyFile(briefPath, options);
  }

  console.error(`[wb4g-prior-art] Unknown command '${options.command}'. Run with --help for usage.`);
  return 2;
}

// Direct invocation check (handles symlinks properly)
if (process.argv[1]) {
  try {
    const isMain = import.meta.url === pathToFileURL(process.argv[1]).href ||
      import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
    if (isMain) {
      const exitCode = executeCli();
      process.exit(exitCode);
    }
  } catch {
    if (import.meta.url === `file://${process.argv[1]}`) {
      const exitCode = executeCli();
      process.exit(exitCode);
    }
  }
}
