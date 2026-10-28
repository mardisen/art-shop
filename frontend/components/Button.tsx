import React from "react";

export function Button({
    children,
    loading,
    loadingText,
    className,
    ...rest
}: {
    children: React.ReactNode;
    loading?: boolean;
    loadingText?: string;
    className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            disabled={loading}
            className={
                `mt-1 w-full rounded bg-yellow-500 py-2 font-medium text-white transition-colors hover:bg-yellow-600 disabled:opacity-50 dark:bg-yellow-500 dark:hover:bg-yellow-600` +
                " " +
                className
            }
            {...rest}
        >
            {loading && loadingText ? `${loadingText}...` : children}
        </button>
    );
}
