"use client";

import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Navigation, Clock, Check, Loader2, MapPin } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import ListingCard from "@/components/ui/ListingCard";
import { apiRequest } from "@/lib/api";

// Dynamically import MapComponent to disable Server-Side Rendering
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => <div className="h-[500px] w-full bg-surface animate-pulse rounded-xl" /> });

export default function ReceiverDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimStatus, setClaimStatus] = useState("idle"); // idle, loading, success
  const [claimError, setClaimError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [filterRadius, setFilterRadius] = useState(5);

  const centerLat = user?.location?.coordinates?.[1] ?? currentLocation?.[0] ?? null;
  const centerLng = user?.location?.coordinates?.[0] ?? currentLocation?.[1] ?? null;
  const center = centerLat !== null && centerLng !== null ? [centerLat, centerLng] : null;

  const requestCurrentLocation = () => {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Location lookup is not available in this browser. Add coordinates to your profile to find nearby food.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation([coords.latitude, coords.longitude]);
        setLocationMessage("Showing food near your current location.");
      },
      () => setLocationMessage("Location was not shared. Add coordinates to your profile or allow location access to continue."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  useEffect(() => {
    let cancelled = false;
    const fetchNearby = async () => {
      try {
        setLoadError("");
        const data = await apiRequest(`/listings/nearby?lat=${centerLat}&lng=${centerLng}&radius=${filterRadius}`);
        if (!cancelled) setListings(data.listings || []);
      } catch (requestError) {
        if (!cancelled) setLoadError(requestError.message);
      }
    };
    if (centerLat !== null && centerLng !== null) fetchNearby();
    return () => { cancelled = true; };
  }, [filterRadius, centerLat, centerLng]);

  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
    setClaimStatus("idle");
    setClaimError("");
    setIsModalOpen(true);
  };

  const handleClaim = async () => {
    if (!selectedListing) return;
    setClaimStatus("loading");
    setClaimError("");

    try {
      await apiRequest('/claims', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ listing_id: selectedListing._id }),
      });
      setClaimStatus("success");
      setListings((current) => current.filter((listing) => listing._id !== selectedListing._id));
      setTimeout(() => setIsModalOpen(false), 2000);
    } catch (requestError) {
      setClaimError(requestError.message);
      setClaimStatus("idle");
    }
  };

  if (!user) return null;

  return (
    <main className="receiver-page">
      <div className="container">
        <div className="receiver-heading">
          <div>
            <p className="section-kicker">Local availability</p>
            <h1>Food near you</h1>
            <p>Browse surplus within {filterRadius} km, then check the pickup window before claiming.</p>
            {!center && (
              <Button variant="secondary" className="mt-3" onClick={requestCurrentLocation}>
                <MapPin size={15} /> Use current location
              </Button>
            )}
            {locationMessage && <p className="mt-2 text-xs text-secondary" role="status">{locationMessage}</p>}
          </div>

          <div className="receiver-radius" role="group" aria-label="Search radius">
            <Button variant={filterRadius === 2 ? 'primary' : 'secondary'} onClick={() => setFilterRadius(2)} aria-pressed={filterRadius === 2}>2 km</Button>
            <Button variant={filterRadius === 5 ? 'primary' : 'secondary'} onClick={() => setFilterRadius(5)} aria-pressed={filterRadius === 5}>5 km</Button>
            <Button variant={filterRadius === 10 ? 'primary' : 'secondary'} onClick={() => setFilterRadius(10)} aria-pressed={filterRadius === 10}>10 km</Button>
          </div>
        </div>

        <div className="receiver-content">
          <section className="receiver-list-panel" aria-labelledby="receiver-list-heading">
            <div className="receiver-list-panel__heading">
              <h2 id="receiver-list-heading">Available nearby</h2>
              <span>{listings.length} {listings.length === 1 ? 'listing' : 'listings'}</span>
            </div>
            {loadError && <p className="auth-error" role="alert">{loadError}</p>}
            <div className="receiver-list-scroll">
              {listings.length === 0 ? (
                <Card className="text-center py-10 border-dashed border-subtle">
                  <p className="text-secondary text-sm">{center ? "No surplus food currently available in this radius." : "Share your location to find nearby food."}</p>
                </Card>
              ) : (
                listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    role="receiver"
                    onAction={handleSelectListing}
                    actionLabel="View pickup details"
                  />
                ))
              )}
            </div>
          </section>

          <section className="receiver-map-panel" aria-label="Map of nearby food listings">
            {center ? (
              <MapComponent key={`${centerLat}-${centerLng}`} center={center} radius={filterRadius} listings={listings} />
            ) : (
              <Card className="flex h-full min-h-[310px] items-center justify-center text-center">
                <div className="max-w-xs">
                  <MapPin className="mx-auto mb-3 text-[#D45D43]" size={22} />
                  <p className="font-semibold text-[#2D2433]">Your neighbourhood, your map</p>
                  <p className="mt-2 text-sm text-secondary">Use your current location or add a location to your profile to see nearby listings.</p>
                </div>
              </Card>
            )}
          </section>
        </div>

      {/* Listing Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Listing Details">
        {selectedListing && (
          <div>
            {claimStatus === "success" ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-[#D45D43]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#D45D43]">
                  <Check size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#2D2433] mb-2">Food Claimed!</h3>
                <p className="text-secondary text-sm mb-6">The donor has been notified.</p>
                <div className="bg-background p-4 rounded-lg text-left mb-6 border border-subtle">
                  <p className="text-xs text-secondary mb-1">Pickup Window</p>
                  <p className="text-[#2D2433] text-sm font-medium flex items-center gap-2">
                    <Clock size={16} className="text-secondary" />
                    {new Date(selectedListing.pickup_window_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                    {new Date(selectedListing.pickup_window_end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <p className="text-xs text-[#D45D43]">Navigate to your Claims tab to mark as picked up later.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {claimError && <p className="auth-error" role="alert">{claimError}</p>}
                <div className="flex justify-between items-start border-b border-subtle pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#2D2433] mb-1">
                      {selectedListing.quantity}x {selectedListing.item_name}
                    </h3>
                    <p className="text-[#D45D43] font-medium text-sm">{selectedListing.donor_name}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <StatusBadge status={selectedListing.status} />
                    <p className="text-xs text-secondary mt-2">{selectedListing.distance_km} km away</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background p-3 rounded-lg border border-subtle">
                    <p className="text-[11px] text-secondary mb-1 uppercase tracking-wider">Food Category</p>
                    <p className="text-[#2D2433] text-sm font-medium flex items-center gap-1.5">
                      <span>{selectedListing.category_icon}</span> {selectedListing.category_name}
                    </p>
                  </div>
                  <div className="bg-background p-3 rounded-lg border border-subtle">
                    <p className="text-[11px] text-secondary mb-1 uppercase tracking-wider">Posted</p>
                    <p className="text-[#2D2433] text-sm font-medium">Recently</p>
                  </div>
                </div>

                <div className="bg-background p-4 rounded-lg border border-subtle">
                  <p className="text-[11px] text-secondary mb-1 uppercase tracking-wider">Pickup Window</p>
                  <p className="text-[#2D2433] text-sm font-medium flex items-center gap-2">
                    <Clock size={16} className="text-secondary" />
                    {new Date(selectedListing.pickup_window_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                    {new Date(selectedListing.pickup_window_end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>

                <Button 
                  onClick={handleClaim} 
                  className="w-full mt-2" 
                  disabled={claimStatus === "loading"}
                >
                  {claimStatus === "loading" ? <Loader2 className="animate-spin" /> : "Claim This Food"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
      </div>
    </main>
  );
}
