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

  server.tool(
    "create_task",
    "Create a new task in Clio",
    {
      name: z.string().describe("Task name"),
      description: z.string().optional().describe("Task description"),
      status: z.enum(["pending", "in_progress", "in_review", "complete"]).optional().describe("Task status"),
      priority: z.enum(["High", "Normal", "Low"]).optional().describe("Task priority"),
      due_at: z.string().optional().describe("Due date (ISO 8601 datetime)"),
      matter_id: z.number().optional().describe("Matter ID to associate"),
      assignee_id: z.number().optional().describe("Assignee contact ID"),
      statute_of_limitations: z.boolean().optional().describe("Whether this is a statute of limitations task"),
    },
    async (params) => {
      const data: Record<string, unknown> = {
        name: params.name,
      };
      if (params.description) data.description = params.description;
      if (params.status) data.status = params.status;
      if (params.priority) data.priority = params.priority;
      if (params.due_at) data.due_at = params.due_at;
      if (params.matter_id) data.matter = { id: params.matter_id };
      if (params.assignee_id) data.assignee = { id: params.assignee_id };
      if (params.statute_of_limitations !== undefined) data.statute_of_limitations = params.statute_of_limitations;

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
    "update_task",
    "Update an existing task in Clio",
    {
      id: z.number().describe("The task ID to update"),
      name: z.string().optional().describe("Updated name"),
      description: z.string().optional().describe("Updated description"),
      status: z.enum(["pending", "in_progress", "in_review", "complete"]).optional().describe("Updated status"),
      priority: z.enum(["High", "Normal", "Low"]).optional().describe("Updated priority"),
      due_at: z.string().optional().describe("Updated due date (ISO 8601 datetime)"),
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
    "delete_task",
    "Delete a task from Clio by ID",
    {
      id: z.number().describe("The task ID to delete"),
    },
    async ({ id }) => {
      await api.delete(id);
      return {
        content: [{
          type: "text",
          text: `Task ${id} deleted successfully.`,
        }],
      };
    }
  );
}
