"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 hover:opacity-90"
      style={{
        background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)",
        boxShadow: "0 8px 20px rgba(255,141,138,0.30)",
        animation: "fadeSlideUp 300ms ease-out forwards",
      }}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4 text-on-primary-fixed" />
    </button>
  );
}
