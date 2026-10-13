/**
 * Mango logo mark drawn as inline SVG. Used by the generated app icons
 * (see app/icon.tsx, app/apple-icon.tsx). Plain SVG only — ImageResponse
 * renders it without fetching any external assets.
 */
export function MangoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffdc80" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="fruit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#ea8a00" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#bg)" />
      <path
        d="M262 150 C 374 128 430 232 404 322 C 380 404 318 430 262 396 C 206 430 144 404 120 322 C 94 232 150 128 262 150 Z"
        fill="url(#fruit)"
      />
      <path
        d="M262 168 C 300 118 360 104 398 118 C 372 160 322 178 262 168 Z"
        fill="#15803d"
      />
      <path
        d="M226 214 C 246 196 270 194 286 204"
        stroke="#fff7e8"
        strokeOpacity="0.7"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
