import { TokenManager } from "../auth/token-manager.js";
import type { ClioListParams, ClioListResponse } from "./types.js";

export class ClioClient {
  constructor(private tokenManager: TokenManager) {}

  private async baseUrl(): Promise<string> {
    await this.tokenManager.getAccessToken();
    const host = this.tokenManager.getHost();
    return `https://${host}/api/v4`;
  }

  private async headers(): Promise<Record<string, string>> {
    const token = await this.tokenManager.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const base = await this.baseUrl();
    const url = new URL(`${base}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url.toString(), { headers: await this.headers() });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Clio API GET ${path} failed (${res.status}): ${body}`);
    }
    return (await res.json()) as T;
  }

  /**
   * Paginate through a list endpoint, collecting up to `maxItems` results.
   * Uses cursor-based pagination by default.
   */
  async list<T>(
    path: string,
    params: ClioListParams = {},
    maxItems = 200
  ): Promise<{ data: T[]; has_more: boolean }> {
    const items: T[] = [];
    const { limit, page_token, ...rest } = params;

    const queryParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined && v !== "") queryParams[k] = String(v);
    }
    if (!queryParams.order) queryParams.order = "id(asc)";

    let nextUrl: string | undefined;

    while (items.length < maxItems) {
      let response: ClioListResponse<T>;

      if (nextUrl) {
        const res = await fetch(nextUrl, { headers: await this.headers() });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Clio API GET ${path} page failed (${res.status}): ${body}`);
        }
        response = (await res.json()) as ClioListResponse<T>;
      } else {
        response = await this.get<ClioListResponse<T>>(path, queryParams);
      }

      items.push(...response.data);
      nextUrl = response.meta?.paging?.next;

      if (!nextUrl) break;
    }

    return { data: items.slice(0, maxItems), has_more: items.length > maxItems || !!nextUrl };
  }
}
