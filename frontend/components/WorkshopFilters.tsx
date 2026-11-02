"use client";

interface WorkshopFiltersProps {
    search: string;
    onSearchChange: (v: string) => void;
    type: string;
    onTypeChange: (v: string) => void;
    distance: string;
    onDistanceChange: (v: string) => void;
    useGeo: boolean;
    types?: string[];
}

const DEFAULT_TYPES = ["Drawing", "Painting", "Sculpture", "Photography", "Other"];

export function WorkshopFilters({
    search,
    onSearchChange,
    type,
    onTypeChange,
    distance,
    onDistanceChange,
    useGeo,
    types = DEFAULT_TYPES,
}: WorkshopFiltersProps) {
    return (
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg bg-white px-6 py-4 shadow dark:bg-zinc-900">
            <div>
                <label className="mb-1 block text-xs font-medium">Search</label>
                <input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder="Name or description"
                />
            </div>
            <div className="h-full flex flex-col">
                <label className="mb-1 block text-xs font-medium">Type</label>
                <select
                    value={type}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="rounded border grow border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <option value="">All</option>
                    {types.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium">Distance (km)</label>
                <input
                    type="number"
                    value={distance}
                    onChange={(e) => onDistanceChange(e.target.value)}
                    className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder={useGeo ? "From your location" : "From Bari"}
                />
            </div>
            <p className="text-xs text-zinc-500">
                {useGeo ? "Using your location" : "Using Bari as default location"}
            </p>
        </div>
    );
}
