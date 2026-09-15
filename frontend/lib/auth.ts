const TOKEN_KEY = "access_token";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getToken(): Promise<string | null> {
    if (typeof window === "undefined") {
        const { cookies } = await import("next/headers");
        return (await cookies()).get(TOKEN_KEY)?.value ?? null;
    }
    const match = document.cookie.match(`(?:^|;\\s*)${TOKEN_KEY}=([^;]*)`);
    return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=lax; Max-Age=2592000`;
}

export function clearToken(): void {
    document.cookie = `${TOKEN_KEY}=; path=/; SameSite=lax; Max-Age=0`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    const token = await getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...init, headers });
}