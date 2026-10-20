/** Shown in development only. Remove (or leave it hidden) before deploying. */
export function DemoAccounts() {
  if (process.env.NODE_ENV === "production") return null;
  const rows = [
    ["Individual", "nimali@example.org", "Nimali#2026"],
    ["Volunteer", "volunteer@example.org", "Volunteer#2026"],
    ["Organization (approved)", "org@example.org", "Org#2026demo"],
    ["Organization (pending)", "neworg@example.org", "Org#2026demo"],
    ["Moderator (needs 2FA)", "mod@example.org", "Moderator#2026"],
    ["Admin (needs 2FA)", "admin@example.org", "Admin#2026demo"],
  ];
  return (
    <details className="mt-5 rounded-xl border border-dashed border-[#b9c6d3] bg-white/60 p-4 text-[14px]">
      <summary className="cursor-pointer font-bold">Demo accounts (development only)</summary>
      <table className="mt-3 w-full text-left">
        <tbody>
          {rows.map(([r, e, p]) => (
            <tr key={e} className="border-t border-line"><td className="py-1.5 pr-2 font-semibold">{r}</td><td className="pr-2">{e}</td><td className="font-mono">{p}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 leading-6 text-muted">
        Admin and moderator 2FA: add the secret <span className="font-mono">JBSWY3DPEHPK3PXP</span> to an authenticator app, or read the code printed in the terminal running <span className="font-mono">npm run dev</span>.
      </p>
    </details>
  );
}
