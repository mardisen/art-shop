import Link from "next/link";

export function Navbar() {
    return (
        <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800 w-full">
            <div>
                <Link href="/" className="text-lg font-semibold px-3 py-1.5">
                    Art Shop
                </Link>
                <Link href="/workshops" className="rounded px-3 py-1.5 text-sm font-medium">
                    Workshops
                </Link>
            </div>
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="rounded px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Login
                </Link>
                <Link
                    href="/register"
                    className="rounded bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:text-white dark:hover:bg-yellow-600"
                >
                    Register
                </Link>
            </div>
        </nav>
    );
}
