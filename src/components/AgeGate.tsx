"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "hv_age_confirmed";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const confirmed = localStorage.getItem(STORAGE_KEY);
    if (!confirmed) setShow(true);
  }, []);

  const confirm = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const deny = () => {
    window.location.href = "https://www.google.com";
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(14,14,19,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Ambient blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(255,141,138,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      <div
        className="relative w-full max-w-sm animate-reveal"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "1.5rem",
          padding: "2rem",
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div
            className="w-16 h-16 flex items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(255,141,138,0.15) 0%, rgba(255,121,75,0.10) 100%)",
              border: "1px solid rgba(255,141,138,0.25)",
            }}
          >
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
        </div>

        {/* Copy */}
        <div className="text-center mb-6">
          <p className="section-label mb-2">Age Verification</p>
          <h2 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight mb-3">
            Adults only
          </h2>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            This site contains explicit adult content. You must be{" "}
            <span className="text-primary font-semibold">18 years or older</span> to enter.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={confirm}
            className="btn-primary"
          >
            I am 18+ — Enter
          </button>
          <button
            onClick={deny}
            className="w-full py-3 rounded-full text-sm font-headline font-semibold text-on-surface-variant transition-all duration-200 active:scale-95 hover:text-on-surface"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="flex items-center justify-center gap-2">
              <X className="h-4 w-4" />
              I am under 18 — Leave
            </span>
          </button>
        </div>

        {/* Legal */}
        <p className="text-center text-[10px] font-body text-outline mt-4 leading-relaxed">
          By entering you confirm you are of legal age in your jurisdiction
          and consent to viewing adult content.
        </p>
      </div>
    </div>
  );
}
