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

  server.tool(
    "create_communication",
    "Create a new communication in Clio",
    {
      type: z.enum(["EmailCommunication", "PhoneCommunication"]).describe("Communication type"),
      subject: z.string().optional().describe("Communication subject"),
      body: z.string().optional().describe("Communication body"),
      date: z.string().optional().describe("Date of the communication (YYYY-MM-DD)"),
      matter_id: z.number().optional().describe("Matter ID to associate"),
      sender_ids: z.array(z.number()).optional().describe("Array of sender contact IDs"),
      receiver_ids: z.array(z.number()).optional().describe("Array of receiver contact IDs"),
    },
    async (params) => {
      const data: Record<string, unknown> = {
        type: params.type,
      };
      if (params.subject) data.subject = params.subject;
      if (params.body) data.body = params.body;
      if (params.date) data.date = params.date;
      if (params.matter_id) data.matter = { id: params.matter_id };
      if (params.sender_ids) data.senders = params.sender_ids.map(id => ({ id }));
      if (params.receiver_ids) data.receivers = params.receiver_ids.map(id => ({ id }));

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
    "update_communication",
    "Update an existing communication in Clio",
    {
      id: z.number().describe("The communication ID to update"),
      subject: z.string().optional().describe("Updated subject"),
      body: z.string().optional().describe("Updated body"),
      date: z.string().optional().describe("Updated date"),
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
    "delete_communication",
    "Delete a communication from Clio by ID",
    {
      id: z.number().describe("The communication ID to delete"),
    },
    async ({ id }) => {
      await api.delete(id);
      return {
        content: [{
          type: "text",
          text: `Communication ${id} deleted successfully.`,
        }],
      };
    }
  );
}
