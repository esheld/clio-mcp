import { ClioClient } from "./client.js";
import type { ClioDocument, ClioSingleResponse } from "./types.js";

const DEFAULT_FIELDS = "id,etag,name,filename,size,content_type,locked,received_at,created_at,updated_at,type,matter{id,display_number,description},parent{id,name,type},document_category{id,name},creator{id,name},latest_document_version{id,uuid,filename,size,version_number,content_type,received_at,fully_uploaded},external_properties{id,name,value}";

export class DocumentsApi {
  constructor(private client: ClioClient) {}

  async list(params: {
    matter_id?: number;
    contact_id?: number;
    query?: string;
    document_category_id?: number;
    parent_id?: number;
    created_since?: string;
    updated_since?: string;
    fields?: string;
    limit?: number;
  } = {}) {
    const { limit = 200, ...rest } = params;
    return this.client.list<ClioDocument>("/documents", {
      fields: rest.fields ?? DEFAULT_FIELDS,
      ...rest,
    } as Record<string, string | number | boolean | undefined>, limit);
  }

  async get(id: number, fields?: string) {
    return this.client.get<ClioSingleResponse<ClioDocument>>(
      `/documents/${id}`,
      { fields: fields ?? DEFAULT_FIELDS }
    );
  }

  async getDownloadUrl(id: number): Promise<string> {
    return this.client.getRedirectUrl(`/documents/${id}/download.json`);
  }
}
