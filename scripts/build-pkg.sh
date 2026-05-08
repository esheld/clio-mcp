#!/bin/bash
# Build the macOS .pkg installer for Clio MCP Server.
# Usage: ./scripts/build-pkg.sh
#
# Requires: Node.js, npm dependencies installed, .env.build with credentials.

set -euo pipefail
cd "$(dirname "$0")/.."

ROOT="$(pwd)"
BUILD_DIR="${ROOT}/build"
INSTALLER_DIR="${ROOT}/installer"
PKG_IDENTIFIER="com.clio.mcp-server"
PKG_VERSION="0.1.0"
LIB_DIR="/usr/local/lib/clio-mcp"
BINARY_NAME="clio-mcp-server"

# ── Load credentials ──────────────────────────────────────────────
if [ -f .env.build ]; then
  set -a
  source .env.build
  set +a
fi

if [ -z "${CLIO_CLIENT_ID:-}" ] || [ -z "${CLIO_CLIENT_SECRET:-}" ]; then
  echo "ERROR: CLIO_CLIENT_ID and CLIO_CLIENT_SECRET must be set."
  echo "Create a .env.build file — see .env.build.example"
  exit 1
fi

# ── Clean ─────────────────────────────────────────────────────────
echo "==> Cleaning build directory..."
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/payload${LIB_DIR}" "${BUILD_DIR}/scripts"

# ── Bundle with esbuild ───────────────────────────────────────────
echo "==> Bundling with esbuild..."
node esbuild.config.mjs

# ── Create standalone binaries with pkg ───────────────────────────
echo "==> Building macOS binaries (arm64 + x64)..."
npx pkg dist/bundle.cjs \
  --target node20-macos-arm64 \
  --output "${BUILD_DIR}/payload${LIB_DIR}/${BINARY_NAME}-arm64"

npx pkg dist/bundle.cjs \
  --target node20-macos-x64 \
  --output "${BUILD_DIR}/payload${LIB_DIR}/${BINARY_NAME}-x64"

chmod +x "${BUILD_DIR}/payload${LIB_DIR}/${BINARY_NAME}-arm64"
chmod +x "${BUILD_DIR}/payload${LIB_DIR}/${BINARY_NAME}-x64"

# ── Prepare installer scripts ────────────────────────────────────
cp "${INSTALLER_DIR}/postinstall.sh" "${BUILD_DIR}/scripts/postinstall"
chmod +x "${BUILD_DIR}/scripts/postinstall"

# ── Build component .pkg ─────────────────────────────────────────
echo "==> Building component package..."
pkgbuild \
  --root "${BUILD_DIR}/payload" \
  --scripts "${BUILD_DIR}/scripts" \
  --identifier "${PKG_IDENTIFIER}" \
  --version "${PKG_VERSION}" \
  --install-location "/" \
  "${BUILD_DIR}/${BINARY_NAME}.pkg"

# ── Build product .pkg with installer UI ─────────────────────────
echo "==> Building final installer..."
productbuild \
  --distribution "${INSTALLER_DIR}/distribution.xml" \
  --resources "${INSTALLER_DIR}" \
  --package-path "${BUILD_DIR}" \
  "${BUILD_DIR}/Clio MCP Server.pkg"

echo ""
echo "✅  Installer built: ${BUILD_DIR}/Clio MCP Server.pkg"
echo "    Distribute this file to users."
