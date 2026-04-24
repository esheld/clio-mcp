#!/usr/bin/env node

import { runSetup } from "./setup.js";
import { startServer } from "./index.js";

const command = process.argv[2];

async function main() {
  if (command === "setup") {
    await runSetup();
  } else {
    await startServer();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
