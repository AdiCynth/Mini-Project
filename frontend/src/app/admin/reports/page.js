"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { apiRequest } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const number = (value, digits = 0) => Number(value || 0).toLocaleString("en-IN", {
  maximumFractionDigits: digits,
  minimumFractionDigits: digits,
});

export default function Reports() {
  const { user } = useAuth();
  const [impact, setImpact] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadReports = async () => {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        apiRequest("/reports/impact", { auth: true }),
        apiRequest("/reports/monthly", { auth: true }),
      ]);
      if (cancelled) return;

      const [impactResult, monthlyResult] = results;
      if (impactResult.status === "fulfilled") setImpact(impactResult.value.impact || null);
      if (monthlyResult.status === "fulfilled") setMonthly(monthlyResult.value.monthly || []);
      const failed = results.find((result) => result.status === "rejected");
      if (failed) setError(failed.reason?.message || "Impact data could not be loaded.");
      setLoading(false);
    };

    loadReports();
    return () => { cancelled = true; };
  }, [user]);

  const chartData = useMemo(() => {
    const foodByMonth = Array(12).fill(0);
    monthly.forEach((entry) => {
      const index = Number(entry._id) - 1;
      if (index >= 0 && index < 12) foodByMonth[index] += Number(entry.total_kg_saved || 0);
    });

    return {
      labels: monthNames,
      datasets: [
        {
          fill: true,
          label: "Food saved (kg)",
          data: foodByMonth,
          borderColor: "#D45D43",
          backgroundColor: "rgba(212, 93, 67, 0.12)",
          tension: 0.32,
          borderWidth: 2.5,
          pointBackgroundColor: "#D45D43",
          pointRadius: 3,
        },
        {
          fill: false,
          label: "Estimated CO₂e avoided (kg)",
          data: foodByMonth.map((weight) => weight * 2.5),
          borderColor: "#6F596F",
          tension: 0.32,
          borderWidth: 2,
          pointBackgroundColor: "#6F596F",
          pointRadius: 3,
          borderDash: [5, 5],
        },
      ],
    };
  }, [monthly]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#706975", usePointStyle: true, boxWidth: 8, font: { family: "Inter", size: 11 } } },
      title: { display: false },
      tooltip: {
        backgroundColor: "#2D2433",
        titleColor: "#FFFDFA",
        bodyColor: "#FFFDFA",
        borderColor: "rgba(45, 36, 51, 0.18)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#706975", font: { family: "Inter", size: 11 } },
        grid: { color: "rgba(45, 36, 51, 0.08)" },
      },
      x: {
        ticks: { color: "#706975", font: { family: "Inter", size: 11 } },
        grid: { display: false },
      },
    },
  };

  if (!user) return null;

  return (
    <main className="py-10">
      <div className="container">
        <div className="mb-8 border-b border-subtle pb-6">
          <p className="section-kicker">Measured after collection</p>
          <h1 className="text-3xl font-bold text-[#2D2433] mb-1">Food rescue impact</h1>
          <p className="text-secondary text-sm">Live totals from completed pickups recorded by FoodBridge.</p>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <StatCard title="Food saved" value={loading ? "—" : `${number(impact?.total_kg_saved, 1)} kg`} subtitle="Completed pickups" />
          </div>
          <div className="col-md-4">
            <StatCard title="Estimated CO₂e avoided" value={loading ? "—" : `${number(impact?.co2_saved_kg, 1)} kg`} subtitle="Calculated at 2.5 kg CO₂e per kg saved" />
          </div>
          <div className="col-md-4">
            <StatCard title="Completed pickups" value={loading ? "—" : number(impact?.total_donations)} subtitle="Recorded as collected" />
          </div>
        </div>

        <Card className="p-5">
          <div className="mb-5">
            <h2 className="text-base font-bold text-[#2D2433]">Food saved by calendar month</h2>
            <p className="text-secondary text-xs mt-1">Completed rescue events grouped by month; CO₂e is derived from the same food weight.</p>
          </div>
          {loading ? (
            <div className="h-[360px] flex items-center justify-center text-sm text-secondary">Loading impact data…</div>
          ) : monthly.length === 0 ? (
            <div className="h-[360px] flex flex-col items-center justify-center text-center">
              <p className="font-semibold text-[#2D2433]">No completed pickups to chart yet</p>
              <p className="mt-2 max-w-sm text-sm text-secondary">Monthly impact will appear here after a receiver confirms a collection.</p>
            </div>
          ) : (
            <div className="h-[360px] w-full">
              <Line options={options} data={chartData} />
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
