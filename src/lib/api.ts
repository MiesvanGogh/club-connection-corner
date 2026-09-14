const TOKEN_KEY = "hvch_token";
const BASE_KEY = "hvch_api_base";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(BASE_KEY);
    if (stored) return stored.replace(/\/$/, "");
  }
  const env = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  return (env ?? "").replace(/\/$/, "");
}

export function setApiBase(value: string) {
  if (typeof window === "undefined") return;
  const clean = value.trim().replace(/\/$/, "");
  if (clean) window.localStorage.setItem(BASE_KEY, clean);
  else window.localStorage.removeItem(BASE_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function messageForStatus(status: number, fallback: string) {
  if (status === 401) return "Je sessie is verlopen. Log opnieuw in.";
  if (status === 403) return "Je hebt geen rechten voor deze actie.";
  if (status === 404) return "Niet gevonden.";
  if (status === 0) return "Kan de server niet bereiken. Controleer het API-adres.";
  return fallback || "Er ging iets mis. Probeer het opnieuw.";
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? getToken() : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, messageForStatus(0, ""));
  }

  if (res.status === 401 && auth) {
    setToken(null);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/inloggen")) {
      window.location.href = "/inloggen";
    }
    throw new ApiError(401, messageForStatus(401, ""));
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const detail =
      (data && (data.title || data.message || data.detail)) ||
      (Array.isArray(data?.errors) ? data.errors.join(", ") : "") ||
      (typeof data === "string" ? data : "");
    throw new ApiError(res.status, messageForStatus(res.status, detail));
  }

  return data as T;
}
