import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MattersApi } from "../clio/matters.js";

export function registerMatterTools(server: McpServer, api: MattersApi) {
  server.tool(
    "list_matters",
    "List matters in Clio with optional filters for status, client, and search query",
    {
      status: z.enum(["Open", "Pending", "Closed"]).optional().describe("Filter by matter status"),
      client_id: z.number().optional().describe("Filter by client ID"),
      query: z.string().optional().describe("Search query string"),
      fields: z.string().optional().describe("Comma-separated fields to return"),
      limit: z.number().min(1).max(1000).optional().describe("Max results to return (default 200)"),
    },
    async (params) => {
      const result = await api.list(params);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.tool(
    "get_matter",
    "Get a single matter by ID from Clio",
    {
      id: z.number().describe("The matter ID"),
      fields: z.string().optional().describe("Comma-separated fields to return"),
    },
    async ({ id, fields }) => {
      const result = await api.get(id, fields);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        }],
      };
    }
  );
}
