export interface ClioListParams {
  fields?: string;
  order?: string;
  limit?: number;
  page_token?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ClioPagingMeta {
  previous?: string;
  next?: string;
}

export interface ClioListResponse<T> {
  data: T[];
  meta?: { paging?: ClioPagingMeta };
}

export interface ClioSingleResponse<T> {
  data: T;
}

// --- Matters ---

export interface ClioMatter {
  id: number;
  etag?: string;
  display_number?: string;
  custom_number?: string;
  description?: string;
  status?: string;
  open_date?: string;
  close_date?: string;
  pending_date?: string;
  billable?: boolean;
  maildrop_address?: string;
  client_reference?: string;
  location?: string;
  client?: { id: number; name?: string };
  practice_area?: { id: number; name?: string };
  responsible_attorney?: { id: number; name?: string };
  [key: string]: unknown;
}

// --- Activities ---

export interface ClioActivity {
  id: number;
  etag?: string;
  type?: string; // "TimeEntry" | "ExpenseEntry"
  date?: string;
  quantity?: number;
  price?: number;
  total?: number;
  note?: string;
  flat_rate?: boolean;
  billed?: boolean;
  non_billable?: boolean;
  non_billable_total?: number;
  matter?: { id: number; display_number?: string; description?: string };
  user?: { id: number; name?: string };
  activity_description?: { id: number; name?: string };
  [key: string]: unknown;
}

// --- Tasks ---

export interface ClioTask {
  id: number;
  etag?: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
  matter?: { id: number; display_number?: string; description?: string };
  assignee?: { id: number; name?: string; type?: string };
  assigner?: { id: number; name?: string };
  task_type?: { id: number; name?: string };
  statute_of_limitations?: boolean;
  [key: string]: unknown;
}

// --- Documents ---

export interface ClioDocument {
  id: number;
  etag?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  type?: string;
  locked?: boolean;
  name?: string;
  received_at?: string;
  filename?: string;
  size?: number;
  content_type?: string;
  parent?: { id: number; name?: string; type?: string };
  matter?: { id: number; display_number?: string; description?: string };
  contact?: { id: number; name?: string };
  document_category?: { id: number; name?: string };
  creator?: { id: number; name?: string };
  latest_document_version?: {
    id: number;
    document_id?: number;
    uuid?: string;
    filename?: string;
    size?: number;
    version_number?: number;
    content_type?: string;
    received_at?: string;
    fully_uploaded?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  external_properties?: Array<{ id: number; name?: string; value?: string }>;
  [key: string]: unknown;
}

// --- Communications ---

export interface ClioCommunication {
  id: number;
  etag?: string;
  type?: string; // "EmailCommunication" | "PhoneCommunication" | etc.
  subject?: string;
  body?: string;
  date?: string;
  received_at?: string;
  created_at?: string;
  updated_at?: string;
  matter?: { id: number; display_number?: string; description?: string };
  senders?: Array<{ id: number; name?: string; type?: string }>;
  receivers?: Array<{ id: number; name?: string; type?: string }>;
  [key: string]: unknown;
}
