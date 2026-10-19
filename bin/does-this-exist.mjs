#!/usr/bin/env node

/**
 * We Build for Good: Does This Exist? (wb4g-prior-art)
 * 
 * Deterministic pre-code prior art engine and research brief generator/verifier.
 * Enforces evidence-backed prior art investigation before building custom code.
 * 
 * Invariant: ZERO em dashes in all output and logic.
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
  --candidates <json>     JSON array of candidates [{name, url, license, status, fit}]
  --disqualifying <text>  Why alternatives were rejected (mandatory for BUILD)
  --uncertainty <text>    Residual uncertainty or blind spots
  --author <name>         Author or seat name (default: We Build for Good Studio)
  --output <path>         Target output path (default: ./RESEARCH-BRIEF.md)

Options for 'verify':
  --strict                Treat warnings as fatal errors
  --json                  Output results as JSON
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
    author: "We Build for Good Studio",
    output: "./RESEARCH-BRIEF.md",
    strict: false,
    json: false,
    help: false
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--strict") {
      options.strict = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--problem" && i + 1 < args.length) {
      options.problem = args[++i];
    } else if (arg === "--queries" && i + 1 < args.length) {
      options.queries = args[++i].split(",").map(q => q.trim()).filter(Boolean);
    } else if (arg === "--verdict" && i + 1 < args.length) {
      options.verdict = args[++i].trim().toUpperCase();
    } else if (arg === "--disqualifying" && i + 1 < args.length) {
      options.disqualifying = args[++i];
    } else if (arg === "--uncertainty" && i + 1 < args.length) {
      options.uncertainty = args[++i];
    } else if (arg === "--author" && i + 1 < args.length) {
      options.author = args[++i];
    } else if (arg === "--output" && i + 1 < args.length) {
      options.output = args[++i];
    } else if (arg === "--candidates" && i + 1 < args.length) {
      const raw = args[++i];
      try {
        if (fs.existsSync(raw)) {
          options.candidates = JSON.parse(fs.readFileSync(raw, "utf8"));
        } else {
          options.candidates = JSON.parse(raw);
        }
      } catch (err) {
        throw new Error(`Failed to parse candidates JSON: ${err.message}`);
      }
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    options.command = positional[0];
    if (positional.length > 1) {
      options.targetPath = positional[1];
    }
  }

  return options;
}

export function generateResearchBrief(data) {
  const now = new Date().toISOString().split("T")[0];
  const problem = data.problem || "Describe the core customer problem and non-negotiable technical constraints here.";
  const queries = data.queries && data.queries.length > 0
    ? data.queries
    : ["prior art open source alternative", "github repository keyword search"];
  const verdict = data.verdict || "BUILD";
  const disqualifying = data.disqualifying || "Document why existing open source tools fail non-negotiable constraints.";
  const uncertainty = data.uncertainty || "Acknowledge scope of search and any unverified registry corners.";
  const author = data.author || "We Build for Good Studio";

  const candidates = data.candidates && data.candidates.length > 0
    ? data.candidates
    : [
        {
          name: "Candidate One",
          url: "https://github.com/example/one",
          license: "MIT",
          status: "Maintained (last commit 2 weeks ago)",
          fit: "Partial: covers engine but lacks our specific UI workflow"
        },
        {
          name: "Candidate Two",
          url: "https://github.com/example/two",
          license: "Apache-2.0",
          status: "Active (last commit 1 month ago)",
          fit: "Mismatch: requires heavy cloud Docker backend"
        }
      ];

  let candidateTable = "| Candidate | Repository / URL | License | Status / Maintenance | Fit Assessment |\n";
  candidateTable += "|:---|:---|:---|:---|:---|\n";
  for (const c of candidates) {
    candidateTable += `| ${c.name} | ${c.url} | ${c.license} | ${c.status} | ${c.fit} |\n`;
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

The following queries were executed across GitHub, package registries, and product directories:
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

## 6. Actionable Recommendation

* **Final Decision**: **${verdict}**
* **Next Action**: ${verdict === "ADOPT" ? "Integrate verified open source package into workspace dependencies." : verdict === "FORK-AND-EXTEND" ? "Fork existing base repository and build only the distinctive layer." : "Proceed with custom build, enforcing strict invariant checks and automated testing."}
`;

  return brief;
}

export function verifyResearchBrief(content) {
  const errors = [];
  const warnings = [];

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return {
      valid: false,
      errors: ["Research brief file is empty or missing"],
      warnings: []
    };
  }

  // 1. Invariant check: Zero em dashes
  const emDashRegex = /[\u2014\u2013]/g;
  const emDashMatches = content.match(emDashRegex);
  if (emDashMatches && emDashMatches.length > 0) {
    errors.push(`System invariant violation: found ${emDashMatches.length} em dash(es). Use colons, commas, or parentheses instead.`);
  }

  // 2. Section check: Problem Statement
  if (!content.includes("## 1. Problem Statement")) {
    errors.push("Missing mandatory section: '## 1. Problem Statement & Hard Constraints'");
  } else {
    const problemSection = content.split("## 1. Problem Statement")[1]?.split("## 2.")[0] || "";
    if (problemSection.trim().length < 25) {
      errors.push("Problem statement is insufficient (must be at least 25 characters of substance).");
    }
  }

  // 3. Section check: Search Strategy
  if (!content.includes("## 2. Search Strategy")) {
    errors.push("Missing mandatory section: '## 2. Search Strategy & Sources Queried'");
  } else {
    const searchSection = content.split("## 2. Search Strategy")[1]?.split("## 3.")[0] || "";
    const queryMatches = searchSection.match(/\* `.+?`/g) || searchSection.match(/- `.+?`/g) || searchSection.match(/\*.+/g);
    if (!queryMatches || queryMatches.length < 2) {
      warnings.push("Search strategy lists fewer than 2 documented queries.");
    }
  }

  // 4. Section check: Evaluated Candidates
  if (!content.includes("## 3. Evaluated Candidates Matrix")) {
    errors.push("Missing mandatory section: '## 3. Evaluated Candidates Matrix'");
  } else {
    const candidatesSection = content.split("## 3. Evaluated Candidates Matrix")[1]?.split("## 4.")[0] || "";
    const rows = candidatesSection.split("\n").filter(r => r.trim().startsWith("|") && !r.includes(":---") && !r.toLowerCase().includes("| candidate |"));
    if (rows.length < 2) {
      errors.push(`Evaluated candidates matrix must evaluate at least 2 candidates (found ${rows.length}).`);
    }
  }

  // 5. Section check: Disqualifying Criteria
  if (!content.includes("## 4. Disqualifying Criteria")) {
    errors.push("Missing mandatory section: '## 4. Disqualifying Criteria'");
  }

  // 6. Section check: Residual Uncertainty
  if (!content.includes("## 5. Residual Uncertainty")) {
    errors.push("Missing mandatory section: '## 5. Residual Uncertainty & Known Blind Spots'");
  } else {
    const uncertaintySection = content.split("## 5. Residual Uncertainty")[1]?.split("## 6.")[0] || "";
    if (uncertaintySection.trim().length < 20) {
      warnings.push("Residual uncertainty section appears brief or trivial.");
    }
  }

  // 7. Verdict check
  const verdictMatch = content.match(/Verdict:\s*\*\*([A-Z0-9_-]+)\*\*/i) || content.match(/Final Decision\*\*:\s*\*\*([A-Z0-9_-]+)\*\*/i);
  let parsedVerdict = null;
  if (!verdictMatch) {
    errors.push("Missing or unparseable Verdict (expected format: Verdict: **ADOPT|FORK-AND-EXTEND|BUILD**).");
  } else {
    parsedVerdict = verdictMatch[1].toUpperCase();
    if (!VALID_VERDICTS.includes(parsedVerdict)) {
      errors.push(`Invalid verdict '${parsedVerdict}'. Must be one of: ${VALID_VERDICTS.join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    verdict: parsedVerdict,
    errors,
    warnings
  };
}

export function executeCli(args = process.argv.slice(2)) {
  const options = parseArgs(args);

  if (options.help || !options.command) {
    printHelp();
    return 0;
  }

  if (options.command === "generate") {
    const briefContent = generateResearchBrief(options);
    const outputPath = path.resolve(process.cwd(), options.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, briefContent, "utf8");

    if (options.json) {
      console.log(JSON.stringify({ success: true, path: outputPath, verdict: options.verdict || "BUILD" }, null, 2));
    } else {
      console.log(`[wb4g-prior-art] Research brief generated: ${outputPath}`);
      console.log(`[wb4g-prior-art] Verdict: ${options.verdict || "BUILD"}`);
    }
    return 0;
  }

  if (options.command === "verify") {
    const targetFile = options.targetPath || "./RESEARCH-BRIEF.md";
    const resolvedPath = path.resolve(process.cwd(), targetFile);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`[wb4g-prior-art] Error: File not found at ${resolvedPath}`);
      return 1;
    }

    const content = fs.readFileSync(resolvedPath, "utf8");
    const result = verifyResearchBrief(content);

    if (options.json) {
      console.log(JSON.stringify({ path: resolvedPath, ...result }, null, 2));
      return result.valid ? 0 : 1;
    }

    console.log("===========================================================");
    console.log(" We Build for Good: Prior Art Research Brief Verification");
    console.log(` Target File : ${resolvedPath}`);
    console.log(` Status      : ${result.valid ? "PASSED" : "FAILED"}`);
    console.log(` Verdict     : ${result.verdict || "UNKNOWN"}`);
    console.log("===========================================================");

    if (result.errors.length > 0) {
      console.log("\n[Errors]:");
      for (const err of result.errors) {
        console.log(`  * ${err}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log("\n[Warnings]:");
      for (const warn of result.warnings) {
        console.log(`  * ${warn}`);
      }
    }

    if (result.valid) {
      console.log("\nAll prior art research brief invariants verified clean.");
      return 0;
    } else {
      console.log(`\nVerification failed with ${result.errors.length} error(s).`);
      return 1;
    }
  }

  if (options.command === "check-repo") {
    const repoPath = options.targetPath || process.cwd();
    const briefPath = path.join(repoPath, "RESEARCH-BRIEF.md");

    if (!fs.existsSync(briefPath)) {
      console.error(`[wb4g-prior-art] Repo check failed: No RESEARCH-BRIEF.md found in ${repoPath}`);
      return 1;
    }

    const content = fs.readFileSync(briefPath, "utf8");
    const result = verifyResearchBrief(content);

    if (result.valid) {
      console.log(`[wb4g-prior-art] Repository has verified prior art research brief: ${result.verdict}`);
      return 0;
    } else {
      console.error(`[wb4g-prior-art] Repository research brief failed verification with ${result.errors.length} error(s).`);
      return 1;
    }
  }

  console.error(`[wb4g-prior-art] Unknown command '${options.command}'. Run with --help for usage.`);
  return 1;
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
