---
name: batch-process
description: Batch-process Sanity CMS reading list items using ralph_json.sh. Use when the user wants to run a bulk operation on reading list items — such as assigning topics, categorizing, or any batch task that processes items one-by-one through Claude. Also use when the user mentions ralph_json, batch processing, or running a checklist through Claude.
---

# Batch Process

Orchestrates end-to-end batch processing: generate a checklist from Sanity, resolve an instruction file, and launch `ralph_json.sh` in the background.

## Workflow

### Step 1: Parse the Request

Determine three things from the user's message:

**Filter criteria** — maps to `checklist.js` flags:
- `--no-topics` — items with no topics assigned
- `--uncategorized` — items with no categories
- `--categories "slug1,slug2"` — items in specific categories (comma-separated slugs)
- `--exclude-categories "slug1,slug2"` — items NOT in specific categories
- `--topic "slug"` — items with a specific topic
- No filter — all published items

**Instruction source** — one of:
- A bundled template name: `topics`, `categorize` (see [assets/instructions/](assets/instructions/))
- A file path to a custom instruction `.md` file

**Task name** — a short kebab-case label (e.g. `topic-assignment`, `recategorize`). Infer from context.

If any of these are ambiguous, ask the user before proceeding.

### Step 2: Create Task Directory

```bash
mkdir -p _tasks/_in-progress/YYYY-MM-DD_<task-name>/
```

Use today's date. If a directory with that name already exists, append a numeric suffix (e.g. `_2`).

### Step 3: Generate Checklist

```bash
node .claude/skills/sanity-cms/scripts/checklist.js \
  <filter-flags> \
  --output _tasks/_in-progress/YYYY-MM-DD_<task-name>/checklist.json
```

If the user requested `--dry-run`, add `--dry-run` and stop after reporting results.

### Step 4: Report and Confirm

Read the generated JSON. Report:
- Total item count
- A sample of the first 3-5 item titles

Ask the user to confirm before launching the batch process.

### Step 5: Resolve Instruction File

- **Bundled template**: Copy from `.claude/skills/batch-process/assets/instructions/<name>.md` to the task directory as `instruction.md`
- **Custom path**: Verify the file exists. No copy needed.
- **Neither specified**: Ask the user which instruction to use. Show available templates: `topics`, `categorize`.

### Step 6: Launch ralph_json.sh

Always use `--no-plan`. Default max-iterations: 30 (override with user-specified value). Optional: `--stop-on-manual-test` if user requests it.

**IMPORTANT — Nested session fix:** `ralph_json.sh` spawns `claude` subprocesses. When launched from inside Claude Code, the `CLAUDECODE` env var blocks nesting. Always prefix the command with `unset CLAUDECODE &&` to bypass this.

**Small batches (≤5 items):** Run in foreground so the user sees streaming output directly.

Use the Bash tool with `timeout: 600000` (10 minutes):
```bash
unset CLAUDECODE && ./ralph_json.sh <checklist> <instruction> --no-plan
```
When complete, summarize results (complete/error/needs_human_test counts).

**Larger batches (>5 items):** Run via the Bash tool with `run_in_background: true`. This auto-notifies the user when the process finishes.

```bash
unset CLAUDECODE && ./ralph_json.sh <checklist> <instruction> --no-plan 2>&1 | tee <task-dir>/ralph.log
```

Tell the user: "Batch process started for N items. You'll be notified when it completes. You can continue working in the meantime."

Mention the log file and checklist paths casually in case they want to check progress, but don't lead with monitoring commands.

## Options Reference

| Option | Default | Description |
|--------|---------|-------------|
| `--dry-run` | off | Preview checklist without creating files or launching |
| `--max-iterations N` | 30 | Max items to process per ralph_json.sh run |
| `--stop-on-manual-test` | off | Stop when an item needs manual testing |

## Bundled Instruction Templates

- **topics** — Assign 2-5 topics to a reading list item. Creates new topics if needed, reuses existing ones. See [assets/instructions/topics.md](assets/instructions/topics.md).
- **categorize** — Assign a single category to a reading list item based on editorial guidelines. See [assets/instructions/categorize.md](assets/instructions/categorize.md).
