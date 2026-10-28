"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({
    lat,
    lng,
    onChange,
}: {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}) {
    const map = useMap();

    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);

    return <Marker position={[lat, lng]} />;
}

export default function MapPicker({
    lat,
    lng,
    onChange,
}: {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}) {
    return (
        <div className="h-64 w-full overflow-hidden rounded-lg">
            <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker lat={lat} lng={lng} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
