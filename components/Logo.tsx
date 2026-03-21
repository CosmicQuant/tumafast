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

        <defs>
            <radialGradient id="sphere" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>
            <radialGradient id="core" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#14532d" />
            </radialGradient>

            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="16" stdDeviation="24" floodOpacity="0.4" />
            </filter>
        </defs>

        {/* 3D Cylindrical Connections */}
        <path
            d="M 512 512 L 512 240 M 512 512 L 748 648 M 512 512 L 276 648"
            fill="none"
            stroke="url(#sphere)"
            strokeWidth="32"
            strokeLinecap="round"
            filter="url(#shadow)"
        />

        {/* Outer 3D Spheres */}
        <circle cx="512" cy="240" r="80" fill="url(#sphere)" filter="url(#shadow)" />
        <circle cx="748" cy="648" r="80" fill="url(#sphere)" filter="url(#shadow)" />
        <circle cx="276" cy="648" r="80" fill="url(#sphere)" filter="url(#shadow)" />

        {/* Central 3D Sphere (Soma) */}
        <circle cx="512" cy="512" r="140" fill="url(#sphere)" filter="url(#shadow)" />

        {/* Inner 3D Glowing Cores */}
        <circle cx="512" cy="512" r="60" fill="url(#core)" />
        <circle cx="512" cy="240" r="32" fill="url(#core)" />
        <circle cx="748" cy="648" r="32" fill="url(#core)" />
        <circle cx="276" cy="648" r="32" fill="url(#core)" />
    </svg>
);

export default Logo;
