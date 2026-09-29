# Codex Setup

This repository is designed so Codex can read AGENTS.md and the project documents before changing code.

## UI UX Pro Max
Follow the current upstream instructions:
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

The upstream project documents a Codex installation path. Re-check the repository at setup time because CLI options can change.

## shadcn MCP for Codex
Official documentation:
https://ui.shadcn.com/docs/mcp

Example configuration for ~/.codex/config.toml:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

Restart Codex after changing the configuration.

## shadcn skill
Current shadcn docs expose AI-oriented installation workflows. Re-check the official docs at setup time.

## Astryx
Official CLI docs:
https://astryx.atmeta.com/docs/cli

Useful discovery commands:

```bash
npx @astryxdesign/cli --help
npx @astryxdesign/cli search button
npx @astryxdesign/cli component Button
npx @astryxdesign/cli template --list
```

Use Astryx's current CLI/agent docs instead of guessing component props.

## Important
Do not install every UI system by default.
Choose the component strategy in DESIGN-SYSTEM.md first.
