#!/usr/bin/env bash
set -euo pipefail

# ─── DailyBrief — Ralph Wiggum Autonomous Loop ───────────────────────────
# Usage:
#   ./loop.sh plan    — Run planning mode (generates IMPLEMENTATION_PLAN.md)
#   ./loop.sh         — Run build mode (implements specs one at a time)
#
# The loop commits after each successful iteration so you never lose progress.
# ──────────────────────────────────────────────────────────────────────────

MODEL="${RALPH_MODEL:-sonnet}"
MAX_TURNS="${RALPH_MAX_TURNS:-200}"
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$PROJECT_ROOT"

# ─── helpers ──────────────────────────────────────────────────────────────

log()  { echo "🔁 [ralph] $*"; }
die()  { echo "❌ [ralph] $*" >&2; exit 1; }

git_commit() {
  local msg="$1"
  git add -A
  # Only commit if there are staged changes
  if ! git diff --cached --quiet 2>/dev/null; then
    git commit -m "$msg"
    log "Committed: $msg"
  else
    log "No changes to commit."
  fi
}

# ─── pre-flight checks ───────────────────────────────────────────────────

command -v claude >/dev/null 2>&1 || die "claude CLI not found. Install it first."
command -v git    >/dev/null 2>&1 || die "git not found."

if [ ! -d .git ]; then
  die "Not a git repo. Run 'git init && git add -A && git commit -m \"initial\"' first."
fi

# ─── mode selection ───────────────────────────────────────────────────────

MODE="${1:-build}"

case "$MODE" in
  plan)
    PROMPT_FILE="PROMPT_plan.md"
    ;;
  build|"")
    PROMPT_FILE="PROMPT_build.md"
    ;;
  *)
    die "Unknown mode: $MODE. Use 'plan' or 'build'."
    ;;
esac

[ -f "$PROMPT_FILE" ] || die "Prompt file not found: $PROMPT_FILE"

# ─── the loop ─────────────────────────────────────────────────────────────

ITERATION=0

while true; do
  ITERATION=$((ITERATION + 1))
  log "═══ Iteration $ITERATION  ·  mode=$MODE  ·  model=$MODEL ═══"

  # Run Claude with the prompt file
  claude \
    --model "$MODEL" \
    --max-turns "$MAX_TURNS" \
    --prompt-file "$PROMPT_FILE" \
    --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebFetch,WebSearch,TodoRead,TodoWrite" \
    --yes \
    2>&1 | tee ".ralph-iteration-${ITERATION}.log"

  EXIT_CODE=${PIPESTATUS[0]}

  if [ $EXIT_CODE -ne 0 ]; then
    log "Claude exited with code $EXIT_CODE. Committing progress and stopping."
    git_commit "ralph: iteration $ITERATION (exited with $EXIT_CODE)"
    break
  fi

  # Commit whatever was produced
  git_commit "ralph: iteration $ITERATION — $MODE mode"

  # In plan mode, only run one iteration
  if [ "$MODE" = "plan" ]; then
    log "Planning iteration complete."
    break
  fi

  # Check if all specs are done
  if [ -f "IMPLEMENTATION_PLAN.md" ]; then
    REMAINING=$(grep -c '^\- \[ \]' IMPLEMENTATION_PLAN.md 2>/dev/null || true)
    if [ "$REMAINING" = "0" ]; then
      log "🎉 All specs complete! DailyBrief is built."
      break
    fi
    log "$REMAINING spec(s) remaining."
  fi

  # Brief pause between iterations
  sleep 2
done

log "Loop finished after $ITERATION iteration(s)."
