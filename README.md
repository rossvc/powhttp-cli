# powhttp-cli

Context-efficient CLI for the [powhttp](https://powhttp.com) Data API. Designed for fast, low-noise access to captured HTTP traffic -- particularly useful as an AI agent tool where minimizing output tokens matters.

## Install

```bash
npm install -g powhttp-cli
```

Or run without installing:

```bash
npx powhttp-cli sessions
```

## Prerequisites

- powhttp must be running
- The Data API must be enabled: powhttp > Settings > Data API > Start
- Default API port: 7777 (configurable in powhttp and in the CLI)

## Usage

```
powhttp <command> [options]
```

### Sessions

```bash
powhttp sessions                    # List all sessions
powhttp sessions active             # Get active session details
powhttp sessions bookmarks active   # List bookmarked entry IDs
```

### Entries

```bash
powhttp entries                         # List entries in active session
powhttp entries --method POST           # Filter by HTTP method
powhttp entries --status 500            # Filter by status code
powhttp entries --domain api.example.com  # Filter by domain
powhttp entries --url "/api/v2"         # Filter by URL substring
powhttp entries --selected              # Only selected entries in the UI
powhttp entries --bookmarked            # Only bookmarked entries
powhttp entries --limit 10              # Limit results
```

### Entry Detail

```bash
powhttp entry active                # Full detail of the active entry
powhttp entry active -d             # With decoded bodies
powhttp entry active --no-body      # Headers and metadata only
powhttp entry <ULID>                # Specific entry by ID
```

### Bodies

```bash
powhttp body active                 # Decoded request and response body
powhttp body active --request       # Request body only
powhttp body active --response      # Response body only
```

### WebSocket

```bash
powhttp ws active                   # Full WebSocket message log
powhttp ws active -c                # Compact one-line-per-message
```

### TLS and HTTP/2

```bash
powhttp tls <connection_id>                 # TLS handshake details
powhttp http2 <connection_id>               # List HTTP/2 stream IDs
powhttp http2 <connection_id> <stream_id>   # Stream frame detail
```

Connection IDs are shown in entry detail output.

## Global Options

| Flag | Description |
|------|-------------|
| `--port <n>` | API port (default: 7777) |
| `--host <h>` | API host (default: localhost) |
| `-j, --json` | Raw JSON output |
| `--no-body` | Strip bodies from output |
| `-d, --decode-body` | Decode base64 bodies inline |
| `--full` | Show full bodies without truncation |
| `-l, --limit <n>` | Limit number of results |

## Configuration

The CLI checks for configuration in this order (highest priority first):

1. CLI flags (`--port`, `--host`)
2. Environment variables (`POWHTTP_PORT`, `POWHTTP_HOST`)
3. Config file (`~/.powhttp-cli/config.json`)
4. Defaults (`localhost:7777`)

Config file example (`~/.powhttp-cli/config.json`):

```json
{
  "port": 7777,
  "host": "localhost"
}
```

JSON5 syntax is supported (comments, trailing commas).

## Context-Efficient Patterns

When using powhttp-cli from an AI agent or script, these patterns minimize output size:

```bash
# Scan entries, then drill into one
powhttp entries --limit 20
powhttp entry <id> --no-body

# Get just the response payload
powhttp body <id> --response

# Find specific traffic
powhttp entries --method POST --url "/api/auth" --limit 5
```

## License

MIT
