const API_URL = "http://localhost:5000";

export default class ApiService {
  static async fetch(pathname: string, init?: RequestInit) {
    // Prepend base URL to relative paths
    const url = new URL(pathname, API_URL);
    const response = await fetch(url, init);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static post(pathname: string, body?: any) {
    return ApiService.fetch(pathname, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
