export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[.4em] ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-[1.35em] w-[1.35em]"
        fill="currentColor"
        role="img"
        aria-label="Zellr"
      >
        <path d="M20 10v20M10 20h20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <circle cx="20" cy="6" r="5" />
        <circle cx="34" cy="20" r="5" />
        <circle cx="20" cy="34" r="5" />
        <circle cx="6" cy="20" r="5" />
      </svg>
      zellr
    </span>
  );
}
