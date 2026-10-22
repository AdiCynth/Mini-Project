"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import ListingCard from "@/components/ui/ListingCard";
import Card from "@/components/ui/Card";
import { apiRequest } from "@/lib/api";

export default function DonorListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    apiRequest('/listings/mine', { auth: true })
      .then((data) => { if (!cancelled) setListings(data.listings || []); })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="mb-8 border-b border-subtle pb-6">
        <h1 className="text-2xl font-bold text-[#2D2433] mb-1">My Past Listings</h1>
        <p className="text-secondary text-sm">History of food surplus you have contributed.</p>
      </div>
      
      {error && <p className="auth-error" role="alert">{error}</p>}

      {loading ? (
        <Card className="p-10 text-center text-secondary">Loading your listings…</Card>
      ) : listings.length === 0 ? (
        <Card className="p-10 text-center border-dashed bg-transparent border-subtle">
          <p className="text-secondary text-sm mb-1">You have not posted any food recently.</p>
          <p className="text-[#D45D43] text-xs font-medium">Go to your dashboard to post instantly.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(l => (
            <ListingCard key={l._id} listing={l} role="donor" />
          ))}
        </div>
      )}
    </div>
  );
}
