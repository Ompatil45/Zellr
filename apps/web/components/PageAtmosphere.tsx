/** Decorative frame + scattered lines — background only */
export function PageAtmosphere() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Soft dashed frame — top / right */}
      <div className="absolute top-6 right-6 bottom-[22%] left-[14%] rounded-tr-[min(28vw,11rem)] border-t-2 border-r-2 border-dashed border-foreground/35 sm:top-8 sm:right-8 sm:left-[18%]" />

      {/* Partial dashed frame — bottom / left */}
      <div className="absolute top-[36%] right-[28%] bottom-8 left-6 rounded-bl-[min(22vw,8rem)] border-b-2 border-l-2 border-dashed border-foreground/30 sm:bottom-10 sm:left-8" />

      <svg
        className="absolute inset-0 h-full w-full text-foreground/40"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontals */}
        <line x1="5%" y1="16%" x2="26%" y2="16%" stroke="currentColor" strokeWidth="1.75" strokeDasharray="4 8" />
        <line x1="70%" y1="24%" x2="95%" y2="24%" stroke="currentColor" strokeWidth="1.75" />
        <line x1="62%" y1="48%" x2="90%" y2="48%" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 7" />
        <line x1="8%" y1="68%" x2="30%" y2="68%" stroke="currentColor" strokeWidth="1.75" />
        <line x1="55%" y1="82%" x2="86%" y2="82%" stroke="currentColor" strokeWidth="1.75" strokeDasharray="5 6" />

        {/* Verticals */}
        <line x1="10%" y1="6%" x2="10%" y2="28%" stroke="currentColor" strokeWidth="1.75" strokeDasharray="5 7" />
        <line x1="86%" y1="40%" x2="86%" y2="70%" stroke="currentColor" strokeWidth="1.75" />
        <line x1="38%" y1="4%" x2="38%" y2="14%" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 6" />
        <line x1="22%" y1="74%" x2="22%" y2="94%" stroke="currentColor" strokeWidth="1.75" strokeDasharray="4 6" />

        {/* Diagonals */}
        <line x1="76%" y1="10%" x2="92%" y2="20%" stroke="currentColor" strokeWidth="1.75" strokeDasharray="4 6" />
        <line x1="4%" y1="54%" x2="14%" y2="62%" stroke="currentColor" strokeWidth="1.75" />

        {/* Crosshair marks */}
        <g stroke="currentColor" strokeWidth="1.75">
          <line x1="8.5%" y1="15.2%" x2="11.5%" y2="15.2%" />
          <line x1="10%" y1="13.8%" x2="10%" y2="16.6%" />
          <line x1="84.5%" y1="47.2%" x2="87.5%" y2="47.2%" />
          <line x1="86%" y1="45.8%" x2="86%" y2="48.6%" />
          <line x1="20.5%" y1="81.2%" x2="23.5%" y2="81.2%" />
          <line x1="22%" y1="79.8%" x2="22%" y2="82.6%" />
        </g>
      </svg>

      {/* Corner ticks */}
      <span className="absolute top-5 left-5 size-2.5 border-t-2 border-l-2 border-foreground/45 sm:top-6 sm:left-6" />
      <span className="absolute right-5 bottom-5 size-2.5 border-r-2 border-b-2 border-foreground/45 sm:right-6 sm:bottom-6" />
    </div>
  );
}
