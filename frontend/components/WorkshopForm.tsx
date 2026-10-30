"use client";

import { useState } from "react";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Workshop } from "@/lib/models";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

interface WorkshopFormProps {
    initialValues: Workshop;
    onSubmit: (values: Workshop) => Promise<void>;
    submitText?: string;
    loadingText?: string;
    loading?: boolean;
    onCancel?: () => void;
    error?: string;
    showDelete?: boolean;
    onDelete?: () => void;
    deleting?: boolean;
}

const WORKSHOP_TYPES = ["Drawing", "Painting", "Sculpture", "Photography", "Other"] as const;

export function WorkshopForm({
    initialValues,
    onSubmit,
    submitText = "Save",
    loadingText = "Saving",
    loading = false,
    onCancel,
    error,
    showDelete = false,
    onDelete,
    deleting = false,
}: WorkshopFormProps) {
    const [lat, setLat] = useState(initialValues.latitude);
    const [lng, setLng] = useState(initialValues.longitude);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await onSubmit({
            name: String(formData.get("name") || ""),
            address: String(formData.get("address") || ""),
            description: String(formData.get("description") || ""),
            link: formData.get("link") ? String(formData.get("link")) : null,
            date: String(formData.get("date") || ""),
            latitude: lat,
            longitude: lng,
            type: String(formData.get("type") || "Other"),
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="min-h-0 w-full max-w-5xl flex-1 space-y-4 overflow-auto rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
        >
            {error && (
                <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                    {error}
                </p>
            )}
            <div className="flex w-full flex-row justify-between space-x-12">
                <div className="flex flex-1 flex-col space-y-2">
                    <FormField label="Name" name="name" defaultValue={initialValues.name} required />
                    <FormField label="Address" name="address" defaultValue={initialValues.address} required />
                    <FormField label="Description" name="description" defaultValue={initialValues.description} required />
                </div>
                <div className="flex flex-1 flex-col space-y-2">
                    <label className="block">
                        <span className="block text-sm font-medium">Type</span>
                        <select
                            name="type"
                            defaultValue={initialValues.type || "Other"}
                            className="mt-1 h-10.5 w-full rounded border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            {WORKSHOP_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </label>
                    <FormField label="Link (optional)" name="link" defaultValue={initialValues.link || ""} />
                    <FormField label="Date" name="date" type="date" defaultValue={initialValues.date} required />
                </div>
            </div>
            <div>
                <p className="mb-2 text-sm font-medium">Location</p>
                <MapPicker
                    lat={lat}
                    lng={lng}
                    onChange={(l, n) => {
                        setLat(l);
                        setLng(n);
                    }}
                />
                <p className="mt-1 text-xs text-zinc-500">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
            </div>
            <div className="flex flex-row space-x-12">
                {onCancel && (
                    <Button
                        type="button"
                        className="bg-white! text-black! hover:bg-red-500! hover:text-white!"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCancel();
                        }}
                    >
                        Cancel
                    </Button>
                )}
                {showDelete && onDelete && (
                    <Button type="button" variant="danger" loading={deleting} loadingText="Deleting" onClick={onDelete}>
                        Delete
                    </Button>
                )}
                <Button type="submit" loading={loading} loadingText={loadingText}>
                    {submitText}
                </Button>
            </div>
        </form>
    );
}
