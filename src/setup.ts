import { createServer } from "node:http";
import { URL } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import open from "open";
import { CLIO_HOST, saveCredentials } from "./auth/credentials.js";

const REDIRECT_PORT = 3456;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`;

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

export async function runSetup(): Promise<void> {
  console.log("\n🔧  Clio MCP Server — Setup\n");

  const clientId = await prompt("Clio Client ID (application key): ");
  const clientSecret = await prompt("Clio Client Secret: ");

  const authCode = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${REDIRECT_PORT}`);
      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>Authorization denied</h1><p>You can close this tab.</p>");
        server.close();
        reject(new Error(`Authorization denied: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<h1>Missing authorization code</h1>");
        server.close();
        reject(new Error("No authorization code received"));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        "<h1>Authorization successful!</h1><p>You can close this tab and return to the terminal.</p>"
      );
      server.close();
      resolve(code);
    });

    server.listen(REDIRECT_PORT, "127.0.0.1", () => {
      const authorizeUrl =
        `https://${CLIO_HOST}/oauth/authorize?` +
        new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          redirect_uri: REDIRECT_URI,
          state: Math.random().toString(36).slice(2),
        }).toString();

      console.log(`\nOpening browser for authorization...\n`);
      console.log(`If the browser does not open, visit:\n${authorizeUrl}\n`);
      open(authorizeUrl).catch(() => {});
    });

    setTimeout(() => {
      server.close();
      reject(new Error("Authorization timed out after 5 minutes"));
    }, 5 * 60 * 1000);
  });

  console.log("Exchanging authorization code for tokens...");

  const tokenRes = await fetch(`https://${CLIO_HOST}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Token exchange failed (${tokenRes.status}): ${body}`);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  await saveCredentials({
    client_id: clientId,
    client_secret: clientSecret,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + tokenData.expires_in * 1000,
  });

  console.log("\n✅  Credentials saved to ~/.clio-mcp/credentials.json");
  console.log("You can now use the Clio MCP server.\n");
}
