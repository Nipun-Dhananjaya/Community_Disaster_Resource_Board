// Pure helpers shared by the server store and the Volunteers page.
export type Slot = "morning" | "afternoon" | "night";
export const slots: Slot[] = ["morning", "afternoon", "night"];
export const slotLabel: Record<Slot, string> = { morning: "Morning", afternoon: "Afternoon", night: "Night" };
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface Cell { filled: number; needed: number; assigned: string[] }
export type Grid = Record<Slot, Cell[]>;

/** A shift needs cover when it is half staffed or less. */
export const needsCover = (c: Cell) => c.filled / c.needed <= 0.5;

export function weekStats(grid: Grid) {
  const cells = slots.flatMap((s) => grid[s].map((c, i) => ({ c, s, i })));
  const cover = cells.filter((x) => needsCover(x.c));
  const nightsWeekend = cover.filter((x) => x.s === "night" || x.i >= 5).length;
  return {
    unfilled: cover.length,
    note: cover.length === 0 ? "Every shift is covered" : nightsWeekend / cover.length >= 0.8 ? "Mostly nights and weekend" : "Spread across the week",
  };
}
