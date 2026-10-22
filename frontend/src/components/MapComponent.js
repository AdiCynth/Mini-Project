"use client";

import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const listingIcon = L.divIcon({
  className: "foodbridge-listing-marker",
  html: '<span class="foodbridge-listing-marker__body"><span class="foodbridge-listing-marker__dot"></span></span>',
  iconSize: [36, 42],
  iconAnchor: [18, 39],
  popupAnchor: [0, -36],
});

function getListingPosition(listing) {
  const coordinates = listing?.location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const [longitude, latitude] = coordinates.map(Number);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return null;
  }

  return [latitude, longitude];
}

function MapViewport({ centerLatitude, centerLongitude, positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    const allPositions = [[centerLatitude, centerLongitude], ...positions];
    const uniquePositions = allPositions.filter(
      (position, index) =>
        allPositions.findIndex(
          ([latitude, longitude]) =>
            latitude === position[0] && longitude === position[1],
        ) === index,
    );

    if (uniquePositions.length === 1) {
      map.setView(uniquePositions[0], 13, { animate: false });
      return;
    }

    map.fitBounds(uniquePositions, { padding: [36, 36], maxZoom: 13, animate: false });
  }, [centerLatitude, centerLongitude, map, positions]);

  return null;
}

export default function MapComponent({ center, radius, listings }) {
  const mappedListings = useMemo(
    () => (listings || []).flatMap((listing) => {
      const position = getListingPosition(listing);
      return position ? [{ listing, position }] : [];
    }),
    [listings],
  );
  const markerPositions = useMemo(
    () => mappedListings.map(({ position }) => position),
    [mappedListings],
  );

  return (
    <div className="h-full min-h-[310px] w-full overflow-hidden rounded-xl border border-[#D9CFD6] shadow-md">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle
          center={center}
          pathOptions={{ fillColor: "#D45D43", color: "#D45D43", fillOpacity: 0.08 }}
          radius={radius * 1000}
        />

        <MapViewport
          centerLatitude={center[0]}
          centerLongitude={center[1]}
          positions={markerPositions}
        />

        {mappedListings.map(({ listing, position }) => (
          <Marker key={listing._id || `${position[0]}-${position[1]}`} position={position} icon={listingIcon}>
            <Popup>
              <div className="font-sans text-slate-800">
                <strong className="mb-1 block">{listing.item_name}</strong>
                <p className="m-0 text-sm">{listing.quantity} {listing.unit}</p>
                {listing.donor_name && <p className="m-0 text-xs text-slate-500">{listing.donor_name}</p>}
                {listing.distance_km !== undefined && (
                  <p className="m-0 text-xs text-slate-500">{listing.distance_km} km away</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
