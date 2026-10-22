"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import QuickAddCard from "@/components/QuickAddCard";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import ListingCard from "@/components/ui/ListingCard";
import { apiRequest } from "@/lib/api";

export default function DonorDashboard() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setLoadError("");
      const results = await Promise.allSettled([
        apiRequest("/listings/categories"),
        apiRequest("/listings/mine?status=available", { auth: true }),
        apiRequest("/reports/impact", { auth: true }),
      ]);

      if (cancelled) return;
      const [categoryResult, listingResult, impactResult] = results;
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.categories || []);
      if (listingResult.status === "fulfilled") setActiveListings(listingResult.value.listings || []);
      if (impactResult.status === "fulfilled") setImpact(impactResult.value.impact || null);

      const failed = results.find((result) => result.status === "rejected");
      if (failed) setLoadError(failed.reason?.message || "Some dashboard data could not be loaded.");
      setLoading(false);
    };

    loadDashboard();
    return () => { cancelled = true; };
  }, [user]);

  const handleListingCreated = (newListing) => {
    setActiveListings(prev => [newListing, ...prev]);
  };

  if (!user) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="mb-8 border-b border-subtle pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2433] mb-1">Your donation dashboard</h1>
          <p className="text-secondary text-sm">Welcome, {user.organization_name || user.name}. Post surplus for nearby community organisations.</p>
        </div>
      </div>

      {loadError && <p className="auth-error" role="status">{loadError}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Food saved" value={loading ? "—" : `${Number(impact?.total_kg_saved || 0).toLocaleString()} kg`} />
        <StatCard title="Completed pickups" value={loading ? "—" : Number(impact?.total_donations || 0).toLocaleString()} />
        <StatCard title="Active listings" value={loading ? "—" : activeListings.length.toString()} />
        <StatCard title="Estimated CO₂ avoided" value={loading ? "—" : `${Number(impact?.co2_saved_kg || 0).toLocaleString()} kg`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Add Section */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#2D2433] mb-4">Quick Add Surplus</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => (
                <QuickAddCard key={category._id} category={category} onListingCreated={handleListingCreated} />
              ))}
              {!loading && categories.length === 0 && (
                <Card className="text-sm text-secondary">Food categories aren’t available right now. Please refresh in a moment.</Card>
              )}
            </div>
          </div>

          <div className="pt-4">
            <h2 className="text-lg font-bold text-[#2D2433] mb-4">My Active Listings</h2>
            {activeListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeListings.map(listing => (
                  <ListingCard key={listing._id} listing={listing} role="donor" />
                ))}
              </div>
            ) : (
              <Card className="text-center py-10 border-dashed border-subtle bg-transparent">
                <p className="text-secondary text-sm mb-1">You have no active listings.</p>
                <p className="text-xs text-[#D45D43]">Use the Quick Add above to create one.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-[#2D2433] mb-3 uppercase tracking-wider">Food Safety Guidelines</h3>
            <ul className="text-sm text-secondary space-y-2 list-disc pl-4">
              <li>Store food at safe temperatures prior to pickup.</li>
              <li>Do not list food that has expired.</li>
              <li>Provide accurate pickup windows to ensure rapid transfer.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
