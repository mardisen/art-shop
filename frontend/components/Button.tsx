import React from "react";

export function Button({
    children,
    loading,
    loadingText,
    ...rest
}: {
    children: React.ReactNode;
    loading?: boolean;
    loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            disabled={loading}
            className="mt-1 w-full rounded bg-zinc-900 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
            {...rest}
        >
            {loading && loadingText ? `${loadingText}...` : children}
        </button>
    );
}
