import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TokenManager } from "./auth/token-manager.js";
import { ClioClient } from "./clio/client.js";
import { MattersApi } from "./clio/matters.js";
import { ActivitiesApi } from "./clio/activities.js";
import { TasksApi } from "./clio/tasks.js";
import { CommunicationsApi } from "./clio/communications.js";
import { DocumentsApi } from "./clio/documents.js";
import { registerMatterTools } from "./tools/matters.js";
import { registerActivityTools } from "./tools/activities.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerCommunicationTools } from "./tools/communications.js";
import { registerDocumentTools } from "./tools/documents.js";

export async function startServer(): Promise<void> {
  const tokenManager = new TokenManager();
  const client = new ClioClient(tokenManager);

  const server = new McpServer({
    name: "clio-mcp-server",
    version: "0.1.0",
  });

  registerMatterTools(server, new MattersApi(client));
  registerActivityTools(server, new ActivitiesApi(client));
  registerTaskTools(server, new TasksApi(client));
  registerCommunicationTools(server, new CommunicationsApi(client));
  registerDocumentTools(server, new DocumentsApi(client));

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
