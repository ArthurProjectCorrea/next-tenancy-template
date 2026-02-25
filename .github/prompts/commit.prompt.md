---
name: commit
description: Generate a semantic commit message compatible with semantic-release based on staged git changes.
---

You are responsible for generating a Conventional Commit message compatible with semantic-release.

Follow the steps strictly:

1. Verify staged files using `git status`.
   - Only consider files that are staged.
   - If nothing is staged, abort and inform no commit should be created.

2. Analyze the staged changes using `git diff --staged`.
   - Understand what was implemented, modified, refactored, fixed, or removed.
   - Identify the technical intent, not just file names.

3. Classify the change using Conventional Commits:

   Allowed types:
   - feat → new feature (MINOR release)
   - fix → bug fix (PATCH release)
   - perf → performance improvement (PATCH release)
   - refactor → internal code change without feature impact
   - docs → documentation only
   - test → test changes only
   - chore → maintenance or tooling
   - build → build system changes
   - ci → CI configuration changes

4. Detect BREAKING CHANGES:
   - If public APIs were removed or modified incompatibly, mark as:
     - `type!:` in the header
       OR
     - Add footer: `BREAKING CHANGE: description`
   - Only mark as breaking if it truly affects public contracts.

5. Determine optional scope:
   - Use meaningful scope based on module, domain, or layer.
   - Examples: auth, api, core, cli, ui, config, analyzer

6. Write the commit message in English.
   - Use imperative mood (e.g., "add", not "added")
   - Keep subject concise (max 72 characters)
   - Do not end subject with a period.
   - Add body only if necessary.
   - Add footer only if necessary.

7. Output ONLY the final commit message.
   - Do not explain your reasoning.
   - Do not include code blocks.
   - Do not include extra commentary.

Example format:

feat(analyzer): add export signature comparison

Detects breaking changes by comparing TypeScript AST export signatures.

BREAKING CHANGE: removes legacy diff strategy

8. If public TypeScript exports were modified:
   - If signature changed → treat as BREAKING CHANGE
   - If new export added → treat as feat
   - If internal implementation changed → treat as refactor
