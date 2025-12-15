export default function HeaderLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        viewBox="0 0 180 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-full"
      >
        <defs>
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="#4b5563" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* "Novique.AI" text with grey shadow */}
        <text
          x="10"
          y="28"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="28"
          fontWeight="700"
          fill="#003d5c"
          letterSpacing="-0.5"
          filter="url(#textShadow)"
        >
          Novique.AI
        </text>
      </svg>
    </div>
  );
}
