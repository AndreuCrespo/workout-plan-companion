---
name: gym-git-workflow
description: Manage GitHub branches, pull requests, releases, repository hygiene, and CI for Workout Plan Companion. Use when changing Git workflow, GitHub settings, issues, PRs, releases, or repository documentation.
---

# GitHub workflow

Read `docs/github-workflow.md` before changing repository settings or starting a feature branch.

- Keep `main` releasable. Do not commit directly to it once branch protection is active.
- Start work from an up-to-date `main` branch and use one focused branch per change:
  - `feat/<short-description>` for user-facing functionality.
  - `fix/<short-description>` for bug fixes.
  - `docs/<short-description>` for documentation.
  - `chore/<short-description>` for maintenance or tooling.
- Use Conventional Commit-style messages: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, or `refactor:`.
- Before opening a pull request, run the relevant checks. For mobile changes this includes `cd mobile && npm run lint && npm run typecheck`.
- Open a pull request into `main`, complete the template, and require the Quality workflow to pass before merging. Prefer squash merging and delete the source branch after merge.
- Use semantic versions and tags for public source releases. Do not create a release, distribution build, deployment, external project, or credential without explicit authorisation.
- Never commit tokens, `.env` files, device identifiers, screenshots containing private data, or other secrets. Keep GitHub credentials in the local credential store only.
- Keep versioned documentation, repository metadata, issues, pull requests, and release notes in English. The current app UI remains Spanish until localisation is explicitly implemented.
