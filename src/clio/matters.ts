import { ClioClient } from "./client.js";
import type { ClioMatter, ClioSingleResponse } from "./types.js";

const DEFAULT_FIELDS = "id,etag,display_number,description,status,open_date,close_date,billable,client{id,name},practice_area{id,name},responsible_attorney{id,name}";

export class MattersApi {
  constructor(private client: ClioClient) {}

  async list(params: {
    status?: string;
    client_id?: number;
    query?: string;
    fields?: string;
    limit?: number;
  } = {}) {
    const { limit = 200, ...rest } = params;
    return this.client.list<ClioMatter>("/matters", {
      fields: rest.fields ?? DEFAULT_FIELDS,
      ...rest,
      client_id: rest.client_id,
    } as Record<string, string | number | boolean | undefined>, limit);
  }

  async get(id: number, fields?: string) {
    return this.client.get<ClioSingleResponse<ClioMatter>>(
      `/matters/${id}`,
      { fields: fields ?? DEFAULT_FIELDS }
    );
  }

  async create(data: {
    description: string;
    status?: string;
    open_date?: string;
    client?: { id: number };
    practice_area?: { id: number };
    responsible_attorney?: { id: number };
    billable?: boolean;
    [key: string]: unknown;
  }) {
    return this.client.post<ClioSingleResponse<ClioMatter>>(
      "/matters",
      { data },
      { fields: DEFAULT_FIELDS }
    );
  }

  async update(id: number, data: Record<string, unknown>) {
    return this.client.patch<ClioSingleResponse<ClioMatter>>(
      `/matters/${id}`,
      { data },
      { fields: DEFAULT_FIELDS }
    );
  }

  async delete(id: number) {
    return this.client.delete(`/matters/${id}`);
  }
}
