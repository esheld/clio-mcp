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

  server.tool(
    "create_activity",
    "Create a new activity (time entry or expense entry) in Clio",
    {
      type: z.enum(["TimeEntry", "ExpenseEntry"]).describe("Activity type"),
      date: z.string().describe("Activity date (YYYY-MM-DD)"),
      matter_id: z.number().optional().describe("Matter ID to associate"),
      quantity: z.number().optional().describe("Duration in seconds (time) or quantity (expense)"),
      price: z.number().optional().describe("Rate or price"),
      note: z.string().optional().describe("Activity note/description"),
      activity_description_id: z.number().optional().describe("Predefined activity description ID"),
    },
    async (params) => {
      const data: Record<string, unknown> = {
        type: params.type,
        date: params.date,
      };
      if (params.matter_id) data.matter = { id: params.matter_id };
      if (params.quantity !== undefined) data.quantity = params.quantity;
      if (params.price !== undefined) data.price = params.price;
      if (params.note) data.note = params.note;
      if (params.activity_description_id) data.activity_description = { id: params.activity_description_id };

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
    "update_activity",
    "Update an existing activity in Clio",
    {
      id: z.number().describe("The activity ID to update"),
      date: z.string().optional().describe("Updated date (YYYY-MM-DD)"),
      quantity: z.number().optional().describe("Updated duration/quantity"),
      price: z.number().optional().describe("Updated rate/price"),
      note: z.string().optional().describe("Updated note"),
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
    "delete_activity",
    "Delete an activity from Clio by ID",
    {
      id: z.number().describe("The activity ID to delete"),
    },
    async ({ id }) => {
      await api.delete(id);
      return {
        content: [{
          type: "text",
          text: `Activity ${id} deleted successfully.`,
        }],
      };
    }
  );
}
