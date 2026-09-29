# ChatGPT Workflow

When working in ChatGPT:

1. Start from the user's goal, not from code.
2. Remind the user of the standard workflow if they skip it:
   Brief → Architecture → Design System → Implementation Plan → Build → Test.
3. Inspect linked GitHub repositories and current official docs when they materially affect implementation.
4. Reuse proven starters/components rather than recreating generic UI primitives.
5. For a real repository, use GitHub tools to inspect and edit files.
6. For UI implementation, run the app and perform browser verification when the available environment supports it.
7. State precisely what was and was not verified.
8. Use Codex when sustained repo-level engineering, command execution and larger multi-file changes make it the better execution environment.

ChatGPT remains useful for:
- product thinking
- requirements
- architecture
- UI/UX direction
- code review
- GitHub changes
- debugging
- deployment planning
- browser QA

Codex is especially useful for:
- sustained work across a repository
- repeated command/test loops
- broad refactors
- installing and using repo-local skills/tools
- autonomous implementation phases
