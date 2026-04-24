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

  server.tool(
    "create_matter",
    "Create a new matter in Clio",
    {
      description: z.string().describe("Matter description/title"),
      status: z.enum(["Open", "Pending", "Closed"]).optional().describe("Matter status"),
      open_date: z.string().optional().describe("Open date (YYYY-MM-DD)"),
      client_id: z.number().optional().describe("Client contact ID to associate"),
      practice_area_id: z.number().optional().describe("Practice area ID"),
      responsible_attorney_id: z.number().optional().describe("Responsible attorney user ID"),
      billable: z.boolean().optional().describe("Whether the matter is billable"),
    },
    async (params) => {
      const data: Record<string, unknown> = {
        description: params.description,
      };
      if (params.status) data.status = params.status;
      if (params.open_date) data.open_date = params.open_date;
      if (params.client_id) data.client = { id: params.client_id };
      if (params.practice_area_id) data.practice_area = { id: params.practice_area_id };
      if (params.responsible_attorney_id) data.responsible_attorney = { id: params.responsible_attorney_id };
      if (params.billable !== undefined) data.billable = params.billable;

      const result = await api.create(data as Parameters<typeof api.create>[0]);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        }],
      };
    }
  );

  server.tool(
    "update_matter",
    "Update an existing matter in Clio",
    {
      id: z.number().describe("The matter ID to update"),
      description: z.string().optional().describe("Updated description"),
      status: z.enum(["Open", "Pending", "Closed"]).optional().describe("Updated status"),
      open_date: z.string().optional().describe("Updated open date (YYYY-MM-DD)"),
      close_date: z.string().optional().describe("Close date (YYYY-MM-DD)"),
      billable: z.boolean().optional().describe("Whether the matter is billable"),
    },
    async ({ id, ...rest }) => {
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) data[k] = v;
      }
      const result = await api.update(id, data);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        }],
      };
    }
  );

  server.tool(
    "delete_matter",
    "Delete a matter from Clio by ID",
    {
      id: z.number().describe("The matter ID to delete"),
    },
    async ({ id }) => {
      await api.delete(id);
      return {
        content: [{
          type: "text",
          text: `Matter ${id} deleted successfully.`,
        }],
      };
    }
  );
}
