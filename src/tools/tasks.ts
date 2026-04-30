import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TasksApi } from "../clio/tasks.js";

export function registerTaskTools(server: McpServer, api: TasksApi) {
  server.tool(
    "list_tasks",
    "List tasks in Clio with optional filters for matter, assignee, and status",
    {
      matter_id: z.number().optional().describe("Filter by matter ID"),
      assignee_id: z.number().optional().describe("Filter by assignee contact ID"),
      assigner_id: z.number().optional().describe("Filter by assigner user ID"),
      status: z.enum(["pending", "in_progress", "in_review", "complete"]).optional().describe("Filter by task status"),
      created_since: z.string().optional().describe("Only return tasks created after this ISO datetime"),
      updated_since: z.string().optional().describe("Only return tasks updated after this ISO datetime"),
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
    "get_task",
    "Get a single task by ID from Clio",
    {
      id: z.number().describe("The task ID"),
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
