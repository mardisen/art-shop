import { Role } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { InstituteForm } from "@/components/InstituteForm";

export default async function CreateInstitutePage() {
    const user = await getCurrentUser();

    if (user?.role !== Role.Professor) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    return <InstituteForm />;
}
