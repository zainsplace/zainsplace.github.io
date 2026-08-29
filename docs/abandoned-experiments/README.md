# Abandoned experiments

Uncommitted work recovered from four workflow worktrees before they were removed
on 2026-08-29. All four branched from `2b0bdec`, the pre-merge single-unit site,
so none apply cleanly to the current code — they are kept only in case an idea in
them is worth redoing.

- `wf_aed65cfa-32b-4.patch` — an `escapeHTML()` helper and its call sites
- `wf_aed65cfa-32b-5.patch` — nav/avatar active-state handling
- `wf_aed65cfa-32b-6.patch` — an `applyTheme()` refactor plus CSS
- `wf_aed65cfa-32b-7.patch` — page-render caching for section sub-pages

Apply with `git apply --3way`, expecting conflicts.
