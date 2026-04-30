# clio-mcp-server

A read-only [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that provides AI assistants with access to the [Clio](https://www.clio.com) legal practice management API.

## Features

- **Matters** — list and view matters
- **Activities** — view time entries and expense entries
- **Tasks** — view tasks with assignments and due dates
- **Communications** — view emails, phone calls, and other communications
- Built-in **OAuth 2.0 setup** flow with automatic token refresh
- **Read-only** — no data is created, modified, or deleted

## Prerequisites

1. A [Clio](https://www.clio.com) account
2. A Clio Developer Application — create one at the [Clio Developer Portal](https://app.clio.com/nc/#/developer_applications)
   - Set a redirect URI to `http://127.0.0.1:3456/callback`
3. Node.js >= 18

## Setup

Run the interactive setup to authenticate with Clio:

```bash
npx clio-mcp-server setup
```

This will:
1. Prompt for your Clio application key and secret
2. Open your browser to authorize with Clio
3. Store credentials securely in `~/.clio-mcp/credentials.json`

## Usage with MCP Clients

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "clio": {
      "command": "npx",
      "args": ["-y", "clio-mcp-server"]
    }
  }
}
```

### Cursor

Add to your MCP settings:

```json
{
  "mcpServers": {
    "clio": {
      "command": "npx",
      "args": ["-y", "clio-mcp-server"]
    }
  }
}
```

## Available Tools

### Matters

| Tool | Description |
|------|-------------|
| `list_matters` | List/search matters with filters for status, client, and search query |
| `get_matter` | Get a single matter by ID |

### Activities

| Tool | Description |
|------|-------------|
| `list_activities` | List time/expense entries with filters for matter, user, type, and date range |
| `get_activity` | Get a single activity by ID |

### Tasks

| Tool | Description |
|------|-------------|
| `list_tasks` | List tasks with filters for matter, assignee, and status |
| `get_task` | Get a single task by ID |

### Communications

| Tool | Description |
|------|-------------|
| `list_communications` | List emails and phone calls with filters for matter, type, and date range |
| `get_communication` | Get a single communication by ID |

## Development

```bash
git clone https://github.com/ethanheld/clio-mcp-server.git
cd clio-mcp-server
npm install
npm run build
```

Test with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/cli.js
```

## License

MIT
