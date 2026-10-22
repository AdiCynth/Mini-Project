"use client";

import { useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import { apiRequest } from "@/lib/api";

const unitOptions = ["kg", "pieces", "portions", "trays", "boxes"];

export default function QuickAddCard({ category, onListingCreated }) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [weightKg, setWeightKg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pickupStart, setPickupStart] = useState("");
  const [pickupEnd, setPickupEnd] = useState("");

  const handleOpenModal = () => {
    const now = new Date();
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setPickupStart(now.toTimeString().slice(0, 5));
    setPickupEnd(end.toTimeString().slice(0, 5));
    setError("");
    setSuccess(false);
    setIsModalOpen(true);
  };

  const handlePost = async (event) => {
    event.preventDefault();
    setError("");

    if (!itemName.trim() || Number(quantity) <= 0 || Number(weightKg) <= 0) {
      setError("Add the food name, a quantity, and its measured weight to continue.");
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 10);
      const startDateTime = new Date(`${localDate}T${pickupStart}:00`);
      let endDateTime = new Date(`${localDate}T${pickupEnd}:00`);
      if (endDateTime <= startDateTime) endDateTime.setDate(endDateTime.getDate() + 1);
      const expiryDateTime = new Date(endDateTime.getTime() + 60 * 60 * 1000);

      const data = await apiRequest("/listings", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          category_id: category._id,
          item_name: itemName.trim(),
          quantity: Number(quantity),
          unit,
          weight_kg: Number(weightKg),
          pickup_window_start: startDateTime.toISOString(),
          pickup_window_end: endDateTime.toISOString(),
          expiry_time: expiryDateTime.toISOString(),
        }),
      });

      setSuccess(true);
      onListingCreated?.(data.listing);
      window.setTimeout(() => setIsModalOpen(false), 1600);
    } catch (requestError) {
      setError(requestError.message || "The listing could not be published.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="card group w-full p-5 text-left transition-all hover:-translate-y-1 hover:border-[#D45D43] hover:shadow-lg"
        onClick={handleOpenModal}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F5E4DA] text-2xl" aria-hidden="true">
              {category.icon}
            </span>
            <span>
              <span className="block text-sm font-bold text-[#2D2433]">{category.name}</span>
              <span className="mt-1 block text-xs text-secondary">Add a fresh surplus listing</span>
            </span>
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D45D43] text-white transition-transform group-hover:scale-105">
            <Plus size={17} aria-hidden="true" />
          </span>
        </span>
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Share ${category.name.toLowerCase()}`}>
        {success ? (
          <div className="py-7 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#F5E4DA] text-[#A94733]">
              <Check size={23} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#2D2433]">Listing published</h3>
            <p className="text-sm text-secondary">Receivers nearby can now find {itemName.trim()}.</p>
          </div>
        ) : (
          <form onSubmit={handlePost} className="space-y-4">
            {error && <p className="auth-error" role="alert">{error}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="auth-field sm:col-span-2">
                <label htmlFor={`item-name-${category._id}`}>What food is available?</label>
                <input
                  id={`item-name-${category._id}`}
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="e.g. Vegetable biryani"
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor={`quantity-${category._id}`}>Quantity</label>
                <input
                  id={`quantity-${category._id}`}
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="e.g. 12"
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor={`unit-${category._id}`}>Unit</label>
                <select id={`unit-${category._id}`} value={unit} onChange={(event) => setUnit(event.target.value)}>
                  {unitOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="auth-field sm:col-span-2">
                <label htmlFor={`weight-${category._id}`}>Total food weight (kg)</label>
                <input
                  id={`weight-${category._id}`}
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                  placeholder="Enter the measured weight"
                  required
                />
                <span className="mt-1 block text-[11px] text-secondary">Used for accurate rescue and impact reporting.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="auth-field">
                <label htmlFor={`pickup-start-${category._id}`}>Pickup available from</label>
                <input id={`pickup-start-${category._id}`} type="time" required value={pickupStart} onChange={(event) => setPickupStart(event.target.value)} />
              </div>
              <div className="auth-field">
                <label htmlFor={`pickup-end-${category._id}`}>Pickup available until</label>
                <input id={`pickup-end-${category._id}`} type="time" required value={pickupEnd} onChange={(event) => setPickupEnd(event.target.value)} />
              </div>
            </div>

            <p className="text-center text-xs text-secondary">The listing closes when its pickup window ends.</p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={17} className="animate-spin" /> : "Publish surplus listing"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
