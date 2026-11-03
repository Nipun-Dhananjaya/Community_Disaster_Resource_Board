"use client";

import { useEffect } from "react";

/** Applies the saved display choices (low-bandwidth mode, larger text) on every page it is placed on. */
export function DisplayPrefs() {
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("lowbw", localStorage.getItem("cdrb-lowbw") === "1");
      document.documentElement.classList.toggle("larger-text", localStorage.getItem("cdrb-larger") === "1");
    } catch {}
  }, []);
  return null;
}
