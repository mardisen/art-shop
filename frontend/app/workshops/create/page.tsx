import { API_URL } from "@/lib/auth";
import Link from "next/link";

interface Workshop {
    id: number;
    name: string;
    address: string;
    description: string;
    latitude: number;
    longitude: number;
    link: string;
}

async function getWorkshops(): Promise<Workshop[]> {
    const res = await fetch(`${API_URL}/workshop/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
}

export default async function WorkshopsPage() {
    const workshops = await getWorkshops();

    return (
        <div className="flex flex-col flex-1 items-start bg-zinc-50 px-12 py-10 dark:bg-black w-full">
            <h1 className="mb-6 text-2xl font-semibold">Workshops</h1>
            {workshops.length === 0 ? (
                <p className="text-zinc-500 px-4">No workshops found.</p>
            ) : (
                <ul className="w-full px-4 w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    {workshops.map((w) => (
                        <li key={w.id} className="py-4">
                            <h2 className="text-lg font-medium">{w.name}</h2>
                            <p className="mt-1 text-sm text-zinc-500">{w.address}</p>
                            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{w.description}</p>
                            {w.link && (
                                <Link
                                    href={w.link.startsWith("http") ? w.link : `https://${w.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-block text-sm font-medium underline"
                                >
                                    Visit website
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
