import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CommunicationsApi } from "../clio/communications.js";

export function registerCommunicationTools(server: McpServer, api: CommunicationsApi) {
  server.tool(
    "list_communications",
    "List communications (emails, phone calls, etc.) in Clio with optional filters",
    {
      matter_id: z.number().optional().describe("Filter by matter ID"),
      type: z.enum(["EmailCommunication", "PhoneCommunication"]).optional().describe("Filter by communication type"),
      created_since: z.string().optional().describe("Only return communications created after this ISO datetime"),
      updated_since: z.string().optional().describe("Only return communications updated after this ISO datetime"),
      fields: z.string().optional().describe("Comma-separated fields to return"),
      limit: z.number().min(1).max(1000).optional().describe("Max results (default 200)"),
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
    "get_communication",
    "Get a single communication by ID from Clio",
    {
      id: z.number().describe("The communication ID"),
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
