"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define world bounds to prevent infinite scrolling
const WORLD_BOUNDS = L.latLngBounds(
    L.latLng(-90, -180), // Southwest coordinates
    L.latLng(90, 180)    // Northeast coordinates
);

// Custom draggable pin icon with brown gradient theme
const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
        <div style="
            background: linear-gradient(135deg, #b8996f 0%, #a0814d 50%, #8b6f3f 100%);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
        ">
            <span style="
                transform: rotate(45deg);
                color: white;
                font-size: 16px;
                font-weight: bold;
            "></span>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

interface LocationPickerProps {
    latitude: string;
    longitude: string;
    onLocationChange: (lat: number, lng: number) => void;
}

function DraggableMarker({ position, onDragEnd }: {
    position: [number, number],
    onDragEnd: (lat: number, lng: number) => void
}) {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const pos = marker.getLatLng();
                onDragEnd(pos.lat, pos.lng);
            }
        },
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={customIcon}
        />
    );
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    const map = useMap();

    useMapEvents({
        click(e) {
            // Check if click is within bounds
            if (WORLD_BOUNDS.contains(e.latlng)) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    // Set map bounds on mount
    useEffect(() => {
        map.setMaxBounds(WORLD_BOUNDS);
        map.setMinZoom(2);
    }, [map]);

    return null;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number]>([59.9139, 10.7522]); // Default Oslo

    useEffect(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            setPosition([lat, lng]);
        }
    }, [latitude, longitude]);

    const handleLocationChange = (lat: number, lng: number) => {
        // Clamp coordinates within world bounds
        const clampedLat = Math.max(-90, Math.min(90, lat));
        const clampedLng = Math.max(-180, Math.min(180, lng));

        setPosition([clampedLat, clampedLng]);
        onLocationChange(clampedLat, clampedLng);
    };

    return (
        <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
                maxBounds={WORLD_BOUNDS}
                maxBoundsViscosity={1.0}
                minZoom={2}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                />

                <MapClickHandler onMapClick={handleLocationChange} />

                {!isNaN(position[0]) && !isNaN(position[1]) && (
                    <DraggableMarker position={position} onDragEnd={handleLocationChange} />
                )}
            </MapContainer>
        </div>
    );
}
