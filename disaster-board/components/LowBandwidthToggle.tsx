"use client";

import { useEffect, useState } from "react";

const KEY = "cdrb-lowbw";

export function LowBandwidthToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) === "1";
      setOn(saved);
      document.documentElement.classList.toggle("lowbw", saved);
    } catch {}
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    document.documentElement.classList.toggle("lowbw", next);
    try { localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={on} className="text-[15px] font-bold hover:underline">
      Low-bandwidth mode: {on ? "On" : "Off"}
    </button>
  );
}
