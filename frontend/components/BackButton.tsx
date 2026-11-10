"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();
    return (
        <button className="text-sm underline hover:cursor-pointer" onClick={() => router.back()}>
            Back
        </button>
    );
}
