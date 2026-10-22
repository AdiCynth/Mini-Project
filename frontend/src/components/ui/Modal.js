"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fb-modal-overlay">
      <button
        type="button"
        className="fb-modal-backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <section
        className="relative z-10 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-subtle bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-modal-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-subtle bg-surface p-5">
          <h2 id="fb-modal-title" className="text-lg font-bold text-[#2D2433]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary transition-colors hover:text-[#2D2433]"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
