import { apiFetch } from "@/lib/auth";
import { Institute } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    const res = await apiFetch("/institute/", { cache: "no-store" });
    const data = res.ok ? await res.json() : [];
    const institutes: Institute[] = Array.isArray(data) ? data : [];

    return <ProfileForm user={user} institutes={institutes} />;
}
