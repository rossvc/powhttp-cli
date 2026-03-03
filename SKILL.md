---
name: powhttp
description: Use the powhttp CLI to inspect HTTP traffic captured by powhttp. Context-efficient alternative to the MCP server — returns concise, structured data ideal for AI agent consumption.
---

# powhttp CLI — Data API Client

The `powhttp` CLI queries the powhttp Data API (localhost:7777 by default) to inspect captured HTTP traffic. It's designed for context efficiency — compact output by default, with JSON and detailed modes available.

## Prerequisites

- powhttp must be running
- Data API must be enabled: powhttp → Settings → Data API → Start
- Default port: 7777 (configurable in powhttp settings and CLI)

## Quick Reference

```bash
# Sessions
powhttp sessions                              # List all sessions
powhttp sessions active                       # Get active session details
powhttp sessions bookmarks active             # List bookmarked entry IDs

# Entries (the main command you'll use most)
powhttp entries                               # List entries in active session
powhttp entries --method POST                 # Filter by HTTP method
powhttp entries --status 500                  # Filter by status code
powhttp entries --domain api.example.com      # Filter by domain
powhttp entries --limit 10                    # Limit results
powhttp entries --selected                    # Only selected entries in UI
powhttp entries --bookmarked                  # Only bookmarked entries

# Single entry detail
powhttp entry active                          # Get active entry (full detail)
powhttp entry active -d                       # With decoded bodies
powhttp entry active --no-body                # Headers only (saves context)
powhttp entry <ULID>                          # Specific entry by ID

# Decoded bodies (most useful for inspecting payloads)
powhttp body active                           # Both request and response body
powhttp body active --request                 # Request body only
powhttp body active --response                # Response body only

# WebSocket messages
powhttp ws active                             # Full WebSocket messages
powhttp ws active -c                          # Compact one-line format

# TLS and HTTP/2 (use connection IDs from entry detail)
powhttp tls <connection_id>                   # TLS handshake events
powhttp http2 <connection_id>                 # List stream IDs
powhttp http2 <connection_id> <stream_id>     # Stream frame detail
```

## Context-Efficient Patterns

When working in an AI agent context, minimize token usage:

1. **Start with compact entry list** to find the request you care about:
   ```bash
   powhttp entries --limit 20
   ```

2. **Narrow down** with filters:
   ```bash
   powhttp entries --method POST --domain api.example.com --limit 5
   ```

3. **Inspect a specific entry** without bodies first:
   ```bash
   powhttp entry <id> --no-body
   ```

4. **Get just the body** you need:
   ```bash
   powhttp body <id> --response
   ```

5. **Use JSON mode** (`-j`) when you need to parse structured data programmatically.

## Output Modes

- **Default (compact)**: Tabular one-line-per-item output, optimized for scanning
- **`-j` / `--json`**: Full JSON output for programmatic use
- **`-d` / `--decode-body`**: Auto-decode base64 bodies in detail view
- **`--no-body`**: Strip request/response bodies to reduce output size
- **`--full`**: Show complete bodies without truncation (default truncates at 500 chars)

## Configuration

Config file: `~/.powhttp-cli/config.json` (JSON5 supported)

```json
{
  "port": 7777,
  "host": "localhost"
}
```

Environment variables: `POWHTTP_PORT`, `POWHTTP_HOST`
CLI flags: `--port <n>`, `--host <h>`

Precedence: CLI flags > env vars > config file > defaults

## Identifiers

- All resources use ULIDs (26-char case-sensitive strings)
- Use `active` as a shortcut for the currently active session/entry in the powhttp UI
- Entry IDs are shown in compact list output and can be passed to `entry`, `body`, `ws` commands
- TLS and HTTP/2 connection IDs are shown in entry detail output

## Common Workflows

**Debug a failing API call:**
```bash
powhttp entries --status 500 --limit 5       # Find 500 errors
powhttp entry <id> -d                         # See full request/response
```

**Inspect request payloads:**
```bash
powhttp entries --method POST --limit 10      # Find POST requests
powhttp body <id> --request                   # See what was sent
```

**Analyze WebSocket traffic:**
```bash
powhttp entries --limit 20                    # Find the WS connection
powhttp ws <id> -c                            # Quick message overview
powhttp ws <id>                               # Full message detail
```

**Check TLS configuration:**
```bash
powhttp entry active --no-body                # Get TLS connection ID
powhttp tls <connection_id>                   # Full handshake detail
```
