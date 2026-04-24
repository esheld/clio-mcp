# clio-mcp-server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that provides AI assistants with access to the [Clio](https://www.clio.com) legal practice management API.

## Features

- **Matters** — list, get, create, update, and delete matters
- **Activities** — manage time entries and expense entries
- **Tasks** — create and track tasks with assignments and due dates
- **Communications** — access emails, phone calls, and other communications
- Built-in **OAuth 2.0 setup** flow with automatic token refresh
- Multi-region support (US, CA, EU, AU)

## Prerequisites

1. A [Clio](https://www.clio.com) account
2. A Clio Developer Application — create one at the [Clio Developer Portal](https://app.clio.com/nc/#/developer_applications)
   - Set a redirect URI to `http://localhost:3456/callback`
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
| `create_matter` | Create a new matter |
| `update_matter` | Update an existing matter |
| `delete_matter` | Delete a matter |

### Activities

| Tool | Description |
|------|-------------|
| `list_activities` | List time/expense entries with filters for matter, user, type, and date range |
| `get_activity` | Get a single activity by ID |
| `create_activity` | Create a new time entry or expense entry |
| `update_activity` | Update an existing activity |
| `delete_activity` | Delete an activity |

### Tasks

| Tool | Description |
|------|-------------|
| `list_tasks` | List tasks with filters for matter, assignee, and status |
| `get_task` | Get a single task by ID |
| `create_task` | Create a new task |
| `update_task` | Update an existing task |
| `delete_task` | Delete a task |

### Communications

| Tool | Description |
|------|-------------|
| `list_communications` | List emails and phone calls with filters for matter, type, and date range |
| `get_communication` | Get a single communication by ID |
| `create_communication` | Create a new communication |
| `update_communication` | Update an existing communication |
| `delete_communication` | Delete a communication |

## Regions

Clio is available in multiple regions. Specify your region during setup:

| Region | Host |
|--------|------|
| US (default) | `app.clio.com` |
| Canada | `ca.app.clio.com` |
| EU | `eu.app.clio.com` |
| Australia | `au.app.clio.com` |

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
