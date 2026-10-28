"use client";

import { Role } from "@/lib/models";
import { TokenContext, UserContext } from "@/lib/providers";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

export function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<Role>();
    const { token } = useContext(TokenContext);
    const user = useContext(UserContext);

    useEffect(() => {
        setIsAuthenticated(token != null && token.length > 0);
    }, [token]);

    useEffect(() => {
        setRole(user.role);
    }, [user]);

    return (
        <nav className="flex w-full items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
            <div>
                <Link href="/" className="px-3 py-1.5 text-lg font-semibold">
                    Art Shop
                </Link>
                <Link href="/workshops" className="rounded px-3 py-1.5 text-sm font-medium">
                    Workshops
                </Link>
                {isAuthenticated && role == Role.Professor ? (
                    <Link href="/workshops/create" className="rounded px-3 py-1.5 text-sm font-medium">
                        Create Workshop
                    </Link>
                ) : (
                    <></>
                )}
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
