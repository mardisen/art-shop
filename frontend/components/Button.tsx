import React from "react";

export function Button({
    children,
    loading,
    loadingText,
    className,
    variant = "primary",
    ...rest
}: {
    children: React.ReactNode;
    loading?: boolean;
    loadingText?: string;
    className?: string;
    variant?: "primary" | "danger" | "secondary";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const baseClass = "mt-1 rounded py-2 font-medium transition-colors disabled:opacity-50";
    const variants = {
        primary: "w-full bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600",
        danger: "w-full bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
        secondary:
            "w-full border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
    };

    return (
        <button
            disabled={loading}
            className={`${baseClass} ${variants[variant]} ${className || ""}`}
            {...rest}
        >
            {loading && loadingText ? `${loadingText}...` : children}
        </button>
    );
}
