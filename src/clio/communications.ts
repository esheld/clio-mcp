import { ClioClient } from "./client.js";
import type { ClioCommunication, ClioSingleResponse } from "./types.js";

const DEFAULT_FIELDS = "id,etag,type,subject,body,date,received_at,created_at,updated_at,matter{id,display_number,description},senders{id,name,type},receivers{id,name,type}";

export class CommunicationsApi {
  constructor(private client: ClioClient) {}

  async list(params: {
    matter_id?: number;
    type?: string;
    created_since?: string;
    updated_since?: string;
    fields?: string;
    limit?: number;
  } = {}) {
    const { limit = 200, ...rest } = params;
    return this.client.list<ClioCommunication>("/communications", {
      fields: rest.fields ?? DEFAULT_FIELDS,
      ...rest,
    } as Record<string, string | number | boolean | undefined>, limit);
  }

  async get(id: number, fields?: string) {
    return this.client.get<ClioSingleResponse<ClioCommunication>>(
      `/communications/${id}`,
      { fields: fields ?? DEFAULT_FIELDS }
    );
  }
}
