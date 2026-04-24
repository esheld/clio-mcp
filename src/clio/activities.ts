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

  async create(data: {
    type: string;
    date: string;
    matter?: { id: number };
    quantity?: number;
    price?: number;
    note?: string;
    activity_description?: { id: number };
    [key: string]: unknown;
  }) {
    return this.client.post<ClioSingleResponse<ClioActivity>>(
      "/activities",
      { data },
      { fields: DEFAULT_FIELDS }
    );
  }

  async update(id: number, data: Record<string, unknown>) {
    return this.client.patch<ClioSingleResponse<ClioActivity>>(
      `/activities/${id}`,
      { data },
      { fields: DEFAULT_FIELDS }
    );
  }

  async delete(id: number) {
    return this.client.delete(`/activities/${id}`);
  }
}
