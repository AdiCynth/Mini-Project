"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";

const formatKg = (value) => `${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg`;

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeListings, setActiveListings] = useState(0);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        apiRequest("/admin/users?role=receiver", { auth: true }),
        apiRequest("/reports/impact", { auth: true }),
        apiRequest("/listings?status=available"),
      ]);
      if (cancelled) return;

      const [usersResult, impactResult, listingsResult] = results;
      if (usersResult.status === "fulfilled") setUsers(usersResult.value.users || []);
      if (impactResult.status === "fulfilled") setImpact(impactResult.value.impact || null);
      if (listingsResult.status === "fulfilled") setActiveListings((listingsResult.value.listings || []).length);
      const failed = results.find((result) => result.status === "rejected");
      setError(failed ? failed.reason?.message || "Some platform data could not be loaded." : "");
      setLoading(false);
    };

    loadDashboard();
    return () => { cancelled = true; };
  }, [user]);

  const handleVerification = async (partner) => {
    setActionId(partner._id);
    setError("");
    try {
      const data = await apiRequest(`/admin/users/${partner._id}/verify`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ is_verified: !partner.is_verified }),
      });
      setUsers((current) => current.map((item) => item._id === partner._id ? data.user : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionId(null);
    }
  };

  if (!user) return null;

  const pendingCount = users.filter((partner) => !partner.is_verified).length;
  const verifiedCount = users.length - pendingCount;

  return (
    <main className="py-10">
      <div className="container">
        <div className="mb-8 border-b border-subtle pb-6">
          <p className="section-kicker">FoodBridge operations</p>
          <h1 className="text-3xl font-bold text-[#2D2433] mb-1">Partner oversight</h1>
          <p className="text-secondary text-sm">Review partner status and keep an eye on the live rescue network.</p>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3"><StatCard title="Food saved" value={loading ? "—" : formatKg(impact?.total_kg_saved)} subtitle="Completed pickups" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard title="Active listings" value={loading ? "—" : activeListings.toLocaleString("en-IN")} subtitle="Available for collection" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard title="NGOs to review" value={loading ? "—" : pendingCount.toLocaleString("en-IN")} subtitle="Not yet verified" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard title="Verified NGOs" value={loading ? "—" : verifiedCount.toLocaleString("en-IN")} subtitle="Community partners" /></div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="p-4 border-b border-subtle bg-background/50">
            <h2 className="text-base font-bold text-[#2D2433]">NGO partner verification</h2>
            <p className="text-secondary text-xs mt-1">Verification status is stored on each partner account.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2D2433]">
              <thead className="bg-background/80 text-secondary border-b border-subtle">
                <tr>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Partner status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-secondary">Loading NGO partners…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-secondary">No NGO accounts found.</td></tr>
                ) : users.map((partner) => (
                  <tr key={partner._id} className="hover:bg-[#F8F4EC] transition-colors">
                    <td className="px-4 py-4 font-semibold">{partner.organization_name || partner.name}</td>
                    <td className="px-4 py-4 text-secondary">{partner.email}</td>
                    <td className="px-4 py-4 text-secondary">{partner.address || "Not provided"}</td>
                    <td className="px-4 py-4">
                      {partner.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-800"><CheckCircle size={14} /> Verified</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-700"><AlertTriangle size={14} /> Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant={partner.is_verified ? "outline" : "primary"}
                        className="px-3 py-2 text-xs"
                        onClick={() => handleVerification(partner)}
                        disabled={actionId === partner._id}
                      >
                        {actionId === partner._id ? <Loader2 size={14} className="animate-spin" /> : partner.is_verified ? "Mark pending" : "Verify partner"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
