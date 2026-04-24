import {
  ClioCredentials,
  REGION_HOSTS,
  loadCredentials,
  saveCredentials,
} from "./credentials.js";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

export class TokenManager {
  private creds: ClioCredentials | null = null;

  async getAccessToken(): Promise<string> {
    if (!this.creds) {
      this.creds = await loadCredentials();
    }

    if (this.isExpired()) {
      await this.refresh();
    }

    return this.creds.access_token;
  }

  getRegion(): string {
    if (!this.creds) {
      throw new Error("TokenManager not initialized — call getAccessToken first");
    }
    return this.creds.region;
  }

  getHost(): string {
    if (!this.creds) {
      throw new Error("TokenManager not initialized — call getAccessToken first");
    }
    return REGION_HOSTS[this.creds.region];
  }

  private isExpired(): boolean {
    if (!this.creds?.expires_at) return false;
    return Date.now() >= this.creds.expires_at - REFRESH_BUFFER_MS;
  }

  private async refresh(): Promise<void> {
    if (!this.creds) throw new Error("No credentials loaded");

    const host = REGION_HOSTS[this.creds.region];
    const res = await fetch(`https://${host}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.creds.client_id,
        client_secret: this.creds.client_secret,
        grant_type: "refresh_token",
        refresh_token: this.creds.refresh_token,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Token refresh failed (${res.status}): ${body}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    this.creds.access_token = data.access_token;
    if (data.refresh_token) {
      this.creds.refresh_token = data.refresh_token;
    }
    this.creds.expires_at = Date.now() + data.expires_in * 1000;

    await saveCredentials(this.creds);
  }
}
