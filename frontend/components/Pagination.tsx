import Link from 'next/link';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    totalItems: number;
    itemsPerPage: number;
}

export function Pagination({
    currentPage,
    totalPages,
    basePath,
    totalItems,
    itemsPerPage,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const buildHref = (page: number) => {
        if (basePath.includes('?')) {
            return `${basePath}&page=${page}`;
        }
        return `${basePath}?page=${page}`;
    };

    return (
        <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
            </p>
            <div className="flex gap-2">
                {currentPage > 1 ? (
                    <Link
                        href={buildHref(currentPage - 1)}
                        className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="rounded border border-zinc-300 px-3 py-1 text-sm opacity-50 dark:border-zinc-700">
                        Previous
                    </span>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                        key={p}
                        href={buildHref(p)}
                        className={`rounded border px-3 py-1 text-sm ${
                            p === currentPage
                                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                                : 'border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'
                        }`}
                    >
                        {p}
                    </Link>
                ))}
                {currentPage < totalPages ? (
                    <Link
                        href={buildHref(currentPage + 1)}
                        className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="rounded border border-zinc-300 px-3 py-1 text-sm opacity-50 dark:border-zinc-700">
                        Next
                    </span>
                )}
            </div>
        </div>
    );
}
