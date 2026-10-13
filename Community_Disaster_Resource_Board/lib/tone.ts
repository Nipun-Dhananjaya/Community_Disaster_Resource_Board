import type { Tone } from "./data";

export const toneBg: Record<Tone, string> = {
  ok: "bg-ok", warn: "bg-warn", alert: "bg-alert", care: "bg-care", ride: "bg-ride",
};
export const toneBorder: Record<Tone, string> = {
  ok: "border-l-ok", warn: "border-l-warn", alert: "border-l-alert", care: "border-l-care", ride: "border-l-ride",
};
export const toneBadge: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-[#8a4a0a]", alert: "bg-alert-soft text-alert",
  care: "bg-[#e9e1f7] text-care", ride: "bg-[#d7eeef] text-ride",
};
export function minutes(m: number) {
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
}
