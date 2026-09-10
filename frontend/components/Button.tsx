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
            className="mt-1 w-full rounded bg-yellow-500 py-2 font-medium text-white disabled:opacity-50 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            {...rest}
        >
            {loading && loadingText ? `${loadingText}...` : children}
        </button>
    );
}
