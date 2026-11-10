import { apiFetch } from "@/lib/auth";
import { WorkshopFull } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { WorkshopEditor } from "@/components/WorkshopEditor";
import { notFound, redirect } from "next/navigation";

export default async function EditWorkshopPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const res = await apiFetch(`/workshop/${id}`, { cache: "no-store" });
    if (!res.ok) notFound();

    const workshop = (await res.json()) as WorkshopFull;

    if (workshop.created_by !== user.id) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    return <WorkshopEditor workshop={workshop} />;
}
