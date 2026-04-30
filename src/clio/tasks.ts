import { ClioClient } from "./client.js";
import type { ClioTask, ClioSingleResponse } from "./types.js";

const DEFAULT_FIELDS = "id,etag,name,description,status,priority,due_at,completed_at,created_at,updated_at,matter{id,display_number,description},assignee{id,name,type},assigner{id,name},statute_of_limitations";

export class TasksApi {
  constructor(private client: ClioClient) {}

  async list(params: {
    matter_id?: number;
    assignee_id?: number;
    assigner_id?: number;
    status?: string;
    created_since?: string;
    updated_since?: string;
    fields?: string;
    limit?: number;
  } = {}) {
    const { limit = 200, ...rest } = params;
    return this.client.list<ClioTask>("/tasks", {
      fields: rest.fields ?? DEFAULT_FIELDS,
      ...rest,
    } as Record<string, string | number | boolean | undefined>, limit);
  }

  async get(id: number, fields?: string) {
    return this.client.get<ClioSingleResponse<ClioTask>>(
      `/tasks/${id}`,
      { fields: fields ?? DEFAULT_FIELDS }
    );
  }
}
