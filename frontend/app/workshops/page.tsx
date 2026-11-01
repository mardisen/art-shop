"use client";

import { apiFetch } from "@/lib/auth";
import { Pagination } from "@/components/Pagination";
import { WorkshopFull } from "@/lib/models";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WorkshopFilters } from "@/components/WorkshopFilters";
import { UserContext } from "@/lib/providers";
import { WorkshopListItem } from "@/components/WorkshopListItem";

const ITEMS_PER_PAGE = 10;

const BARI_LAT = 41.1171432;
const BARI_LNG = 16.8718715;

export default function WorkshopsPage() {
    const searchParams = useSearchParams();
    const { user } = useContext(UserContext);
    const [workshops, setWorkshops] = useState<WorkshopFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState(searchParams.get("type") || "");
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [distance, setDistance] = useState(searchParams.get("distance") || "");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [useGeo, setUseGeo] = useState(false);
    const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                    setUseGeo(true);
                },
                () => {
                    setLat(BARI_LAT);
                    setLng(BARI_LNG);
                    setUseGeo(false);
                },
            );
        } else {
            setLat(BARI_LAT);
            setLng(BARI_LNG);
            setUseGeo(false);
        }
    }, []);



    useEffect(() => {
        async function fetchWorkshops() {
            setLoading(true);
            const body: any = {};
            if (type) body.type = type;
            if (search) body.search = search;
            if (distance && lat !== null && lng !== null) {
                body.distance = Number(distance);
                body.latitude = lat;
                body.longitude = lng;
            }
            const res = await apiFetch(`/workshop/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                setWorkshops([]);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setWorkshops(Array.isArray(data) ? data : []);
            setLoading(false);
        }
        if (lat !== null && lng !== null) {
            fetchWorkshops();
        }
    }, [type, search, distance, lat, lng]);

    const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const totalPages = Math.max(1, Math.ceil(workshops.length / ITEMS_PER_PAGE));
    const page = Math.min(currentPage, totalPages);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedWorkshops = workshops.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const buildBasePath = () => {
        const params = new URLSearchParams();
        if (type) params.set("type", type);
        if (search) params.set("search", search);
        if (distance) params.set("distance", distance);
        const qs = params.toString();
        return qs ? `/workshops?${qs}` : "/workshops";
    };

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-50 px-38 py-10 dark:bg-black">
            <h1 className="mb-6 text-2xl font-semibold">Workshops</h1>
            <WorkshopFilters
                search={search}
                onSearchChange={setSearch}
                type={type}
                onTypeChange={setType}
                distance={distance}
                onDistanceChange={setDistance}
                useGeo={useGeo}
            />
            <div className="mb-4 min-h-0 w-full flex-1 items-start overflow-y-auto rounded-xl bg-white px-8 py-2 shadow dark:bg-zinc-900">
                {loading ? (
                    <p className="px-4 text-zinc-500">Loading...</p>
                ) : workshops.length === 0 ? (
                    <p className="px-4 text-zinc-500">No workshops found.</p>
                ) : (
                    <ul className="w-full divide-y divide-zinc-200 px-4 dark:divide-zinc-800">
                        {paginatedWorkshops.map((w) => (
                            <WorkshopListItem key={w.id} workshop={w} />
                        ))}
                    </ul>
                )}
            </div>
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath={buildBasePath()}
                totalItems={workshops.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>
    );
}
