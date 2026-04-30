import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ActivitiesApi } from "../clio/activities.js";

export function registerActivityTools(server: McpServer, api: ActivitiesApi) {
  server.tool(
    "list_activities",
    "List activities (time entries and expense entries) in Clio with optional filters",
    {
      matter_id: z.number().optional().describe("Filter by matter ID"),
      user_id: z.number().optional().describe("Filter by user ID"),
      type: z.enum(["TimeEntry", "ExpenseEntry"]).optional().describe("Filter by activity type"),
      created_since: z.string().optional().describe("Only return activities created after this ISO datetime"),
      updated_since: z.string().optional().describe("Only return activities updated after this ISO datetime"),
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
    "get_activity",
    "Get a single activity by ID from Clio",
    {
      id: z.number().describe("The activity ID"),
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
