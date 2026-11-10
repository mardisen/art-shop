import { apiFetch } from "@/lib/auth";
import { Institute, Role } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { InstituteForm } from "@/components/InstituteForm";
import { notFound } from "next/navigation";

export default async function EditInstitutePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (user?.role !== Role.Professor || String(user?.institute_id) !== String(id)) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    const res = await apiFetch(`/institute/${id}`, { cache: "no-store" });
    if (!res.ok) notFound();

    const institute = (await res.json()) as Institute;

    return <InstituteForm institute={institute} />;
}
