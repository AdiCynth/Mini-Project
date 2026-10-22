"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Navigation, Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function ReceiverClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiRequest('/claims/my', { auth: true })
      .then((data) => { if (!cancelled) setClaims(data.claims || []); })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  const handleMarkPickedUp = async (claimId) => {
    setLoadingId(claimId);
    try {
      await apiRequest(`/claims/${claimId}`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ status: "picked_up" }),
      });
      setClaims((current) => current.map((claim) => claim._id === claimId ? { ...claim, status: "picked_up" } : claim));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="mb-8 border-b border-subtle pb-6">
        <h1 className="text-2xl font-bold text-[#2D2433] mb-1">My Food Claims</h1>
        <p className="text-secondary text-sm">Track your claimed surplus and manage pickups.</p>
      </div>

      {error && <p className="auth-error" role="alert">{error}</p>}
      
      <div className="space-y-3">
        {loading ? (
          <Card className="text-center py-10 text-secondary">Loading your pickups…</Card>
        ) : claims.length === 0 ? (
          <Card className="text-center py-10 border-dashed border-subtle bg-transparent">
            <p className="text-secondary text-sm">You have not claimed any food yet.</p>
          </Card>
        ) : (
          claims.map((claim) => {
            const coordinates = claim.donor_location;
            const destination = coordinates?.length === 2
              ? `${coordinates[1]},${coordinates[0]}`
              : claim.donor_address;
            const directionsUrl = destination
              ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
              : null;
            const canConfirmPickup = ["pending", "accepted"].includes(claim.status);

            return (
            <Card key={claim._id} className={claim.status === 'pending' ? 'border-l-4 border-l-amber-500' : ''}>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-[#2D2433]">
                      {claim.quantity}x {claim.item_name}
                    </h3>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-[#D45D43] font-medium text-sm">{claim.donor_name}</p>
                  <p className="text-secondary text-sm mt-1">{claim.donor_address || "Address hidden"}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {canConfirmPickup ? (
                    <>
                      {directionsUrl ? (
                        <a className="fb-button fb-button--light w-full sm:w-auto text-xs py-2 px-3" href={directionsUrl} target="_blank" rel="noopener noreferrer">
                          <Navigation size={14} /> Get Directions
                        </a>
                      ) : (
                        <Button variant="outline" className="w-full sm:w-auto text-xs py-2 px-3" disabled>
                          <Navigation size={14} /> Address unavailable
                        </Button>
                      )}
                      <Button 
                        variant="primary" 
                        className="w-full sm:w-auto text-xs py-2 px-3"
                        onClick={() => handleMarkPickedUp(claim._id)}
                        disabled={loadingId === claim._id}
                      >
                        {loadingId === claim._id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Mark Picked Up</>}
                      </Button>
                    </>
                  ) : claim.status === 'picked_up' ? (
                    <div className="text-right">
                      <p className="text-[#D45D43] font-medium flex items-center justify-end gap-1 text-sm"><Check size={16}/> Pickup Completed</p>
                      <p className="text-xs text-secondary mt-1">+{claim.weight_kg} kg food rescued</p>
                    </div>
                  ) : claim.status === "cancelled" ? (
                    <p className="text-xs text-secondary">This claim was cancelled.</p>
                  ) : null}
                </div>

              </div>
            </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
