import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 1024"
        className={className}
        aria-hidden="true"
    >
        <defs>
            <linearGradient id="logo-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
        </defs>
        <rect width="1024" height="1024" rx="256" fill="url(#logo-g)" />
        <text
            x="512"
            y="512"
            dy="0.05em"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="420"
            letterSpacing="-10"
        >
            Axon
        </text>
    </svg>
);

export default Logo;
