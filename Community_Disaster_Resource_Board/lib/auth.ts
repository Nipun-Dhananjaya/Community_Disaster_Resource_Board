export interface DemoUser { name: string; email: string; org: boolean }

const KEY = "cdrb-user";
const EVENT = "cdrb-auth";

export function getUser(): DemoUser | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
}
export function setUser(u: DemoUser) {
  try { localStorage.setItem(KEY, JSON.stringify(u)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}
export function clearUser() {
  try { localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new Event(EVENT));
}
export function onAuthChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", fn);
  return () => { window.removeEventListener(EVENT, fn); window.removeEventListener("storage", fn); };
}
/** Only allow same-site paths, so a crafted ?next= can't send people elsewhere. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
