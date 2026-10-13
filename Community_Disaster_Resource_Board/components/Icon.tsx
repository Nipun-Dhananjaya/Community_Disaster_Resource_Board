import type { IconName } from "/lib/data";

const paths: Record<IconName, React.ReactNode> = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  box: <><rect x="5" y="5" width="14" height="14" rx="2.5" /><rect x="9" y="9" width="6" height="6" rx="1" fill="#fff" stroke="none" /></>,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  arrow: <path d="M5 12h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  alert: <><rect x="10.8" y="5" width="2.4" height="9" rx="1.2" /><circle cx="12" cy="17.8" r="1.5" /></>,
  plus: <path d="M10.5 5h3v5.5H19v3h-5.5V19h-3v-5.5H5v-3h5.5z" />,
  bolt: <path d="M13 3.5 6 13.5h4.5L9.5 20.5 17 10.5h-4.5z" />,
  dots: <><circle cx="6" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="18" cy="12" r="1.8" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
};

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        {paths[name]}
      </svg>
  );
}
