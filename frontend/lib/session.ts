import { apiFetch } from "./auth";
import { User } from "./models";

export async function getCurrentUser(): Promise<User | null> {
    try {
        const res = await apiFetch("/auth/me", { cache: "no-store" });
        if (!res.ok) return null;
        return (await res.json()) as User;
    } catch {
        return null;
    }
}
