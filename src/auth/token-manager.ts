import {
  CLIO_HOST,
  loadCredentials,
  saveCredentials,
  type ClioCredentials,
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

  getHost(): string {
    return CLIO_HOST;
  }

  private isExpired(): boolean {
    if (!this.creds?.expires_at) return false;
    return Date.now() >= this.creds.expires_at - REFRESH_BUFFER_MS;
  }

  private async refresh(): Promise<void> {
    if (!this.creds) throw new Error("No credentials loaded");

    const res = await fetch(`https://${CLIO_HOST}/oauth/token`, {
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
