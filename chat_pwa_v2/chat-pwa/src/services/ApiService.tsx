export default class ApiService {
  static async fetch(pathname: string, init?: RequestInit) {
    // Use relative paths in development so Vite's proxy can intercept them
    // In production, the backend should be served from the same origin
    const response = await fetch(pathname, init);

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
