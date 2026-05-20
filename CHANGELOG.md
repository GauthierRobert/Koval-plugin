# Changelog

All notable changes to the Koval Training plugin are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-05-20

## [0.1.0] - 2026-05-20

### Added
- Initial plugin release bundling the Koval MCP connector with two role-scoped end-user skills (`koval-athlete`, `koval-coach`).
- Build script (`build-plugin.mjs`) materialises `skills/` from the monorepo source of truth.
- OAuth 2.1 + PKCE + Dynamic Client Registration auth flow against the Koval backend (no manual token issuance).

### Changed
- `.mcp.json` no longer requires `KOVAL_API_TOKEN`; clients discover OAuth via `/.well-known/oauth-protected-resource`.
