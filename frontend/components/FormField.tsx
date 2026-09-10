import React from "react";

export function FormField({
    label,
    name,
    type = "text",
    ...rest
}: {
    label: string;
    name: string;
    type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="block text-sm font-medium">{label}</span>
            <input
                name={name}
                type={type}
                required
                className="input"
                {...rest}
            />
        </label>
    );
}
