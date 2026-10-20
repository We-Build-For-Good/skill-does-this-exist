# Changelog

## 2.0.0 (2026-10-20)

Breaking fixes from a catalogue review.

- `generate` no longer invents content. In 1.1.0, running it with no options wrote two made-up candidates (github.com/example/one and two), default queries and a BUILD verdict, and that file passed `verify --strict`. Missing fields are now `TODO:` lines, and `verify` fails while any remain.
- `verify` rejects candidates with no http(s) URL or a placeholder URL, and a BUILD verdict with no disqualifying reason.
- `--strict` now works (1.1.0 parsed it and ignored it). `check-repo` honours `--strict` and `--json` and prints the errors.
- `generate` validates `--verdict`, refuses to overwrite an existing brief without `--force`, and escapes `|` in table cells.
- New `--cost` option and "Cost of Being Wrong" section (missing section is a warning, so older briefs still pass).
- Only em dashes are flagged; en dashes in ranges are allowed.
- Strict option parsing. Exit code 2 for bad options, unknown commands or a missing file.
- Docs no longer call the check "unskippable" or "mathematically auditable": it is structural, and says so.
