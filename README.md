# Koval Training Plugin for Claude Code

AI training planning for cyclists, runners, swimmers and triathletes. Bundles the **Koval MCP connector** with two role-scoped end-user skills (`koval-athlete`, `koval-coach`) so Claude routes every training request to the right workflow on your Koval account.

## Install

### From this repo (development)

```bash
/plugin marketplace add GauthierRobert/Koval-plugin
/plugin install koval-training@koval-plugin
```

### From the community marketplace (once published)

```bash
/plugin marketplace add anthropics/claude-plugins-community
/plugin install koval-training@claude-community
```

## Setup

The plugin connects to a remote MCP server (the Koval backend). Set these environment variables before launching Claude Code:

| Variable          | Default                          | Description                                            |
| ----------------- | -------------------------------- | ------------------------------------------------------ |
| `KOVAL_MCP_URL`   | `https://api.koval.app/mcp/sse`  | MCP endpoint of your Koval deployment.                 |
| `KOVAL_API_TOKEN` | _(required)_                     | Personal access token from your Koval profile → API.   |

Generate a token from your Koval profile page once the API token feature is enabled in the backend.

## What's inside

```
plugin/
├── .claude-plugin/plugin.json   manifest
├── .mcp.json                    remote HTTP MCP server config
├── skills/                      built by build-plugin.mjs
│   ├── koval-athlete/           SKILL.md + resources/
│   └── koval-coach/             SKILL.md + resources/
└── build-plugin.mjs             materializes skills/ from ../skills/
```

## Build

`skills/` is generated from the source skills in the parent `training-planner-ai` monorepo. The build script must be run from inside that monorepo — when working on the plugin standalone, the committed `skills/` is the source of truth.

From the monorepo:

```bash
node plugin/build-plugin.mjs
```

The build merges `../skills/_shared/` into every skill, exactly like `../skills/package-skills.mjs` does for the Claude Desktop ZIPs.

## Publishing to Anthropic's community marketplace

1. Validate locally: `/plugin marketplace add <local-path>` and exercise both skills end-to-end.
2. Submit at https://claude.ai/settings/plugins/submit — Anthropic's pipeline runs automated validation and safety checks, then pins your plugin at a commit SHA in `anthropics/claude-plugins-community`.

## License

MIT
