import React from "react";

export function FormField({
    label,
    name,
    type = "text",
    required = false,
    ...rest
}: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="block">
            <span className="block text-sm font-medium">{label}</span>
            <input
                name={name}
                type={type}
                required={required}
                className="input"
                {...rest}
            />
        </label>
    );
}
