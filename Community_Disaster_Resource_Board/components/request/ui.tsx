export const inputClass =
  "w-full rounded-lg border border-[#b9c6d3] bg-white px-4 py-3 text-[16px] placeholder:text-muted aria-[invalid=true]:border-alert aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-alert";

export function Field({
  id, label, hint, error, optional, children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[16px] font-bold">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-1 text-[14px] text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-[14px] font-bold text-alert">{error}</p>}
    </div>
  );
}

export function Progress({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol aria-label="Progress" className="grid grid-cols-4 gap-3 sm:gap-5">
      {labels.map((l, i) => (
        <li key={l} aria-current={i === step ? "step" : undefined}>
          <div className={`h-2 rounded-full ${i <= step ? "bg-navy" : "bg-[#c8d3de]"}`} />
          <p className={`mt-2 text-[12px] sm:text-[14px] ${i === step ? "font-bold text-navy" : "text-muted"}`}>
            {i + 1}. <span className={i === step ? "" : "hidden sm:inline"}>{l}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
