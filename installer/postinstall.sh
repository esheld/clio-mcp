#!/bin/bash
# Post-install script for Clio MCP Server .pkg
# Runs as root — determines the real user for config patching and OAuth setup.

set -e

LIB_DIR="/usr/local/lib/clio-mcp"
BIN_LINK="/usr/local/bin/clio-mcp-server"
REAL_USER="${USER:-$(logname 2>/dev/null || echo "$SUDO_USER")}"
REAL_HOME=$(eval echo "~${REAL_USER}")
CLAUDE_CONFIG_DIR="${REAL_HOME}/Library/Application Support/Claude"
CLAUDE_CONFIG="${CLAUDE_CONFIG_DIR}/claude_desktop_config.json"

select_binary() {
  ARCH=$(uname -m)
  if [ "$ARCH" = "arm64" ]; then
    SOURCE="${LIB_DIR}/clio-mcp-server-arm64"
  else
    SOURCE="${LIB_DIR}/clio-mcp-server-x64"
  fi

  ln -sf "${SOURCE}" "${BIN_LINK}"
}

patch_claude_config() {
  mkdir -p "${CLAUDE_CONFIG_DIR}"

  if [ -f "${CLAUDE_CONFIG}" ]; then
    python3 -c "
import json, sys
path = sys.argv[1]
with open(path) as f:
    cfg = json.load(f)
cfg.setdefault('mcpServers', {})
cfg['mcpServers']['clio'] = {'command': '${BIN_LINK}', 'args': []}
with open(path, 'w') as f:
    json.dump(cfg, f, indent=2)
" "${CLAUDE_CONFIG}"
  else
    cat > "${CLAUDE_CONFIG}" <<CONFIGEOF
{
  "mcpServers": {
    "clio": {
      "command": "${BIN_LINK}",
      "args": []
    }
  }
}
CONFIGEOF
  fi

  chown "${REAL_USER}" "${CLAUDE_CONFIG}"
}

launch_setup() {
  su "${REAL_USER}" -c "osascript -e 'tell application \"Terminal\"
    activate
    do script \"${BIN_LINK} setup\"
  end tell'"
}

select_binary
patch_claude_config
launch_setup

exit 0
