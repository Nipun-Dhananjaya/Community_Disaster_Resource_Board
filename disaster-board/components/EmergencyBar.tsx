import { emergencyLines } from "/lib/data";

export function EmergencyBar() {
  return (
    <div className="bg-alert px-4 py-3 text-center text-[15px] font-bold text-white">
      Life in danger? Call{" "}
      <a href={`tel:${emergencyLines.life}`} className="underline underline-offset-2">{emergencyLines.life} now</a>
      <span className="mx-3" aria-hidden="true">|</span>
      Disaster hotline{" "}
      <a href={`tel:${emergencyLines.hotline}`} className="underline underline-offset-2">{emergencyLines.hotline}</a>
    </div>
  );
}
