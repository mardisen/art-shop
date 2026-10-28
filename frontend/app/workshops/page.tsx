import { API_URL } from '../../lib/auth';
import Link from 'next/link';

interface Workshop {
    id: number;
    name: string;
    address: string;
    description: string;
    latitude: number;
    longitude: number;
    link: string;
    type: string;
    date: Date;
}

async function getWorkshops(): Promise<Workshop[]> {
    const res = await fetch(`${API_URL}/workshop/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
}

export default async function WorkshopsPage() {
    const workshops = await getWorkshops();

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-50 px-38 py-10 dark:bg-black">
            <h1 className="mb-6 text-2xl font-semibold">Workshops</h1>
            <div className="min-h-0 w-full flex-1 items-start overflow-y-auto rounded-lg bg-white px-8 py-2">
                {workshops.length === 0 ? (
                    <p className="px-4 text-zinc-500">No workshops found.</p>
                ) : (
                    <ul className="w-full divide-y divide-zinc-200 px-4 dark:divide-zinc-800">
                        {workshops.map((w) => (
                            <li key={w.id} className="py-4">
                                <h2 className="text-lg font-medium">{w.name}</h2>
                                <p className="mt-1 text-sm text-zinc-500">{w.address}</p>
                                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{w.description}</p>
                                {w.link && (
                                    <Link
                                        href={w.link.startsWith('http') ? w.link : `https://${w.link}`}
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
        </div>
    );
}
