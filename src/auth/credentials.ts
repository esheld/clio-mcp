import { readFile, writeFile, mkdir, chmod } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

export const CLIO_HOST = "app.clio.com";

export interface ClioCredentials {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

const CONFIG_DIR = join(homedir(), ".clio-mcp");
const CREDENTIALS_FILE = join(CONFIG_DIR, "credentials.json");

export async function loadCredentials(): Promise<ClioCredentials> {
  try {
    const raw = await readFile(CREDENTIALS_FILE, "utf-8");
    return JSON.parse(raw) as ClioCredentials;
  } catch {
    throw new Error(
      "No Clio credentials found. Run `clio-mcp-server setup` first."
    );
  }
}

export async function saveCredentials(
  creds: ClioCredentials
): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), "utf-8");
  await chmod(CREDENTIALS_FILE, 0o600);
}
