import React from 'react';

interface ShieldLensIconProps {
  className?: string;
  size?: number;
}

export const ShieldLensIcon: React.FC<ShieldLensIconProps> = ({ className = 'w-6 h-6', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lensGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#0284c7" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      {/* Outer Shield Boundary */}
      <path
        d="M12 2.5L4 6V11.5C4 16.5 7.5 20.8 12 22C16.5 20.8 20 16.5 20 11.5V6L12 2.5Z"
        stroke="url(#lensGradient)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Precision Lens Aperture Concentric Circles */}
      <circle
        cx="12"
        cy="11.5"
        r="4.5"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      <circle
        cx="12"
        cy="11.5"
        r="2"
        fill="#38bdf8"
        fillOpacity="0.8"
      />
      {/* Lens Optical Crosshairs */}
      <line x1="12" y1="5.5" x2="12" y2="7.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="15.5" x2="12" y2="17.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="11.5" x2="8" y2="11.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="11.5" x2="18" y2="11.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};
