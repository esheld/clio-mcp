import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DocumentsApi } from "../clio/documents.js";

export function registerDocumentTools(server: McpServer, api: DocumentsApi) {
  server.tool(
    "list_documents",
    "List documents in Clio associated with a matter, contact, or search query. Returns document metadata including name, type, size, and links to OneDrive/external storage.",
    {
      matter_id: z.number().optional().describe("Filter by matter ID"),
      contact_id: z.number().optional().describe("Filter by contact ID"),
      query: z.string().optional().describe("Search documents by name"),
      document_category_id: z.number().optional().describe("Filter by document category ID"),
      parent_id: z.number().optional().describe("Filter by parent folder ID"),
      created_since: z.string().optional().describe("Only return documents created after this ISO datetime"),
      updated_since: z.string().optional().describe("Only return documents updated after this ISO datetime"),
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
    "get_document",
    "Get a single document by ID from Clio, including metadata, external properties, and version info",
    {
      id: z.number().describe("The document ID"),
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
    "get_document_download_url",
    "Get a temporary download URL for a document stored in Clio (e.g. OneDrive). Returns a redirect URL that can be used to access the file.",
    {
      id: z.number().describe("The document ID"),
    },
    async ({ id }) => {
      const url = await api.getDownloadUrl(id);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ document_id: id, download_url: url }, null, 2),
        }],
      };
    }
  );
}
