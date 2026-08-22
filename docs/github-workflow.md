# GitHub workflow

This repository uses a lightweight pull request workflow to keep `main` stable and ready for a source release.

## Branches

`main` is the protected, releasable branch. Start every change from an up-to-date copy of it:

```bash
git switch main
git pull --ff-only
git switch -c feat/short-description
```

Use one focused branch per change and these prefixes:

| Prefix | Use |
| --- | --- |
| `feat/` | User-facing functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Tooling or maintenance |
| `refactor/` | Internal code restructuring |

## Commits and pull requests

Use concise Conventional Commit-style messages, such as `feat: add local workout logs` or `fix: persist theme selection`.

Before opening a pull request, run the relevant checks. For mobile changes:

```bash
cd mobile
npm run lint
npm run typecheck
```

Push the branch and open a pull request against `main`:

```bash
git push -u origin feat/short-description
gh pr create --base main --fill
```

Complete the PR template, wait for the **Quality** workflow, resolve all relevant feedback, squash merge, and delete the source branch.

## Releases

Use semantic versioning and create a source release only after the change is merged and verified on `main`.

1. Update `mobile/package.json` and `mobile/app.json`.
2. Run the local checks and confirm the Quality workflow passes.
3. Create an annotated `vX.Y.Z` tag and push it.
4. Create a GitHub release with concise English notes.

A GitHub source release is not an Android or iOS distribution build. Creating an APK, IPA, deployment, or external service requires separate explicit approval.

## Repository hygiene

- Keep documentation, issues, pull requests, GitHub metadata, and release notes in English.
- Use the issue templates for bugs and feature requests.
- Store screenshots only when they do not expose personal data or secrets.
- Never commit tokens, `.env` files, generated native build folders, or device-specific files.
- GitHub credentials remain in the local credential store and are never copied into the repository.
