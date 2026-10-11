import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/** FoodLens mark: a leaf inside a scan viewfinder. Green/white, no gradients-as-decoration gimmicks. */
const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    role="img"
    aria-label="FoodLens logo"
  >
    <defs>
      <linearGradient id="fl-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#0f7a3d" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#fl-bg)" />
    <g stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" fill="none">
      <path d="M12 20V15a3 3 0 0 1 3-3h5" />
      <path d="M44 12h5a3 3 0 0 1 3 3v5" />
      <path d="M12 44v5a3 3 0 0 0 3 3h5" />
      <path d="M44 52h5a3 3 0 0 0 3-3v-5" />
    </g>
    <path
      d="M32 44c-9 0-15-6.5-15-16.2C17 20 22 14.5 32 12c10 2.5 15 8 15 15.8C47 37.5 41 44 32 44Z"
      fill="#ffffff"
    />
    <path
      d="M32 44c0-11 2.5-20.5 10-28.5"
      stroke="#0f7a3d"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="15" y="30.5" width="34" height="3" rx="1.5" fill="#0f7a3d" opacity="0.9" />
  </svg>
);

export default Logo;
