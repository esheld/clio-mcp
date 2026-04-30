import { ClioClient } from "./client.js";
import type { ClioActivity, ClioSingleResponse } from "./types.js";

const DEFAULT_FIELDS = "id,etag,type,date,quantity,price,total,note,flat_rate,billed,non_billable,matter{id,display_number,description},user{id,name},activity_description{id,name}";

export class ActivitiesApi {
  constructor(private client: ClioClient) {}

  async list(params: {
    matter_id?: number;
    user_id?: number;
    type?: string;
    created_since?: string;
    updated_since?: string;
    fields?: string;
    limit?: number;
  } = {}) {
    const { limit = 200, ...rest } = params;
    return this.client.list<ClioActivity>("/activities", {
      fields: rest.fields ?? DEFAULT_FIELDS,
      ...rest,
    } as Record<string, string | number | boolean | undefined>, limit);
  }

  async get(id: number, fields?: string) {
    return this.client.get<ClioSingleResponse<ClioActivity>>(
      `/activities/${id}`,
      { fields: fields ?? DEFAULT_FIELDS }
    );
  }
}
