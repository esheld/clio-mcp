# clio-mcp-server

A read-only [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that provides AI assistants with access to the [Clio](https://www.clio.com) legal practice management API.

## Features

- **Matters** — list and view matters
- **Activities** — view time entries and expense entries
- **Tasks** — view tasks with assignments and due dates
- **Communications** — view emails, phone calls, and other communications
- **Documents** — list, view, and get download URLs for documents (including OneDrive-backed files)
- Built-in **OAuth 2.0 setup** flow with automatic token refresh
- **Read-only** — no data is created, modified, or deleted

## Prerequisites

1. A [Clio](https://www.clio.com) account
2. A Clio Developer Application — create one at the [Clio Developer Portal](https://app.clio.com/nc/#/developer_applications)
   - Set a redirect URI to `http://127.0.0.1:3456/callback`
3. Node.js >= 18

## Install

### Option A — macOS .pkg installer (recommended for non-developers)

Download and double-click the `.pkg` file. See [Installer](#macos-pkg-installer) below for details.

### Option B — from source

```bash
git clone https://github.com/esheld/clio-mcp.git
cd clio-mcp
npm install
npm run build
```

Then run the interactive setup to authenticate with Clio:

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

### Documents

| Tool | Description |
|------|-------------|
| `list_documents` | List documents with filters for matter, contact, category, parent folder, date ranges, and search query |
| `get_document` | Get a single document by ID with metadata, external properties, and version info |
| `get_document_download_url` | Get a temporary download URL for a document (e.g. OneDrive-backed files) |

## macOS .pkg Installer

Build a macOS installer package that non-technical users can double-click to install.

### Build prerequisites

1. All items from [Prerequisites](#prerequisites)
2. A `.env.build` file with your Clio app credentials (see `.env.build.example`)

### Building the installer

```bash
cp .env.build.example .env.build   # fill in your real credentials
npm install
./scripts/build-pkg.sh
```

The installer is output to `build/Clio MCP Server.pkg`.

### What the installer does

1. Installs the `clio-mcp-server` binary to `/usr/local/bin/`
2. Adds the Clio MCP entry to the Claude Desktop config
3. Opens Terminal to run the Clio OAuth login flow

### End-user install instructions

1. Double-click **Clio MCP Server.pkg**
2. If macOS shows an "unidentified developer" warning: right-click the file, choose **Open**, then click **Open** in the dialog
3. Follow the installer steps — click **Continue** then **Install**
4. A Terminal window will open — your browser will launch to log into Clio
5. Log in and click **Allow**
6. Once Terminal says "Credentials saved", quit and restart **Claude Desktop**

### Re-running setup

If you need to re-authorize with Clio:

```bash
/usr/local/bin/clio-mcp-server setup
```

### Uninstalling

```bash
sudo rm /usr/local/bin/clio-mcp-server
sudo rm -rf /usr/local/lib/clio-mcp
rm -rf ~/.clio-mcp
```

Then remove the `"clio"` entry from `~/Library/Application Support/Claude/claude_desktop_config.json`.

## Development

```bash
git clone https://github.com/esheld/clio-mcp.git
cd clio-mcp
npm install
npm run build
```

Test with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/cli.js
```

## License

MIT
