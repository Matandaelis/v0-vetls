---
name: accessibility-enhancement-workflow
description: Workflow command scaffold for accessibility-enhancement-workflow in v0-vetls.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /accessibility-enhancement-workflow

Use this workflow when working on **accessibility-enhancement-workflow** in `v0-vetls`.

## Goal

Improve accessibility (a11y) of UI components by adding ARIA labels, semantic roles, and screen reader support, and updating related documentation and tests.

## Common Files

- `components/*.tsx`
- `.Jules/palette.md`
- `test_a11y.py`
- `verify-a11y.py`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit one or more React component files (e.g., in components/) to add ARIA attributes, semantic HTML, or improve screen reader support.
- Update or add related accessibility tests (e.g., test_a11y.py or verify-a11y.py).
- Document the change or learning in .Jules/palette.md.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.