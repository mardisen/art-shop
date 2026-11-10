import { Role } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { WorkshopEditor } from "@/components/WorkshopEditor";
import { redirect } from "next/navigation";

export default async function CreateWorkshopPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== Role.Professor) {
        redirect("/login");
    }

    return <WorkshopEditor />;
}
