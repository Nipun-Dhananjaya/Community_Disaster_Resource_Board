import type { FeatureCollection } from "geojson";

// PLACEHOLDER polygon. Replace with the official flood-risk layer
// from your disaster management authority (export it as GeoJSON).
export const floodZone: FeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "Kelani River flood-risk zone" },
            geometry: {
                type: "Polygon",
                // GeoJSON order is [longitude, latitude]
                coordinates: [[[79.9, 6.99], [79.94, 6.98], [79.955, 6.95], [79.93, 6.92], [79.9, 6.94], [79.9, 6.99]]],
            },
        },
    ],
};