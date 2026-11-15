import React from 'react';

/* ========================================================================
   CLEARFEED "CLEARUI" VECTOR ICONOGRAPHY & BRAND MARKS
   Original visual identity: Chrono-Prism, Pulse Beacon, and Offline Mesh.
   Zero generic or Twitter-derivative elements.
   ======================================================================== */

/**
 * Clearfeed Chrono-Prism / Pulse Beacon Logo
 * Three ascending chronological bars in Signal Teal paired with concentric
 * peer-to-peer beacon arcs and an Amber Mesh node on Obsidian squircle.
 */
export const ClearfeedLogo = ({ className = 'w-8 h-8', showSquircle = true, ...props }) => (
  <svg viewBox="0 0 512 512" fill="none" className={className} {...props}>
    <defs>
      <linearGradient id="cfIconTeal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="cfIconAmber" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FDE047" />
      </linearGradient>
    </defs>
    {showSquircle && (
      <>
        <rect width="512" height="512" rx="116" ry="116" fill="#090D16" />
        <rect x="6" y="6" width="500" height="500" rx="112" ry="112" fill="none" stroke="#1E293B" strokeWidth="4" opacity="0.6" />
      </>
    )}
    {/* Chrono-Prism Bars (Ascending Chronological Feed) */}
    <rect x="80" y="348" width="220" height="36" rx="18" fill="url(#cfIconTeal)" />
    <rect x="80" y="268" width="168" height="36" rx="18" fill="url(#cfIconTeal)" />
    <rect x="80" y="188" width="116" height="36" rx="18" fill="url(#cfIconTeal)" />

    {/* P2P Telemetry Synapse */}
    <path d="M 196 206 L 284 206" stroke="#334155" strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round" opacity="0.65" />

    {/* Concentric Peer-to-Peer Beacon Waves */}
    <path d="M 305 310 A 116 116 0 0 1 356 90" stroke="#06B6D4" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.85" />
    <circle cx="305" cy="310" r="11" fill="#14B8A6" />
    <path d="M 324 270 A 72 72 0 0 1 356 134" stroke="url(#cfIconTeal)" strokeWidth="18" strokeLinecap="round" fill="none" />

    {/* Amber Mesh Node */}
    <circle cx="356" cy="206" r="44" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6 6" fill="none" opacity="0.8" />
    <circle cx="356" cy="206" r="26" fill="url(#cfIconAmber)" />
    <circle cx="356" cy="206" r="12" fill="#FFFBEB" />
  </svg>
);

/**
 * Compact Clearfeed Mark (Chrono-Prism & Beacon without squircle)
 */
export const ClearfeedMark = ({ className = 'w-6 h-6', ...props }) => (
  <ClearfeedLogo className={className} showSquircle={false} {...props} />
);

/**
 * Mesh Mode Indicator Badge (Signal Teal = Online, Beacon Amber = Mesh)
 */
export const MeshBeaconBadge = ({ mode = 'cloud', className = 'w-4 h-4', ...props }) => {
  const isMesh = mode === 'mesh';
  const color = isMesh ? '#F59E0B' : '#14B8A6';
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" opacity="0.25" />
      <circle cx="12" cy="12" r="4" fill={color} />
      <path d="M17 7a7 7 0 0 1 0 10" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M7 17a7 7 0 0 1 0-10" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
};

// Platform Maintainer / Faculty Badge — Signal Teal & Amber Shield
export const FacultyBadge = ({ className = 'w-4 h-4 text-[#14B8A6]', ...props }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={`inline-block shrink-0 ${className}`} {...props}>
    <path d="M10 1l2.5 1.5L15 3v5c0 3.5-2 6.5-5 8-3-1.5-5-4.5-5-8V3l2.5-.5L10 1z" />
    <path d="M8.5 9.5l1.5 1.5 3-3" stroke="#090D16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Verified Member Badge — Teal ring checkmark
export const MemberBadge = ({ className = 'w-4 h-4 text-[#14B8A6]', ...props }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={`inline-block shrink-0 ${className}`} {...props}>
    <circle cx="10" cy="10" r="8" opacity="0.2" />
    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Boost / Chronological Amplify Icon
export const BoostIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14 3l2 2-2 2" />
    <path d="M4 9V7a2 2 0 012-2h10" />
    <path d="M6 17l-2-2 2-2" />
    <path d="M16 11v2a2 2 0 01-2 2H4" />
  </svg>
);

// Strictly Chronological Timeline Icon — Ascending time bars
export const ChronologicalIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} {...props}>
    <line x1="3" y1="5" x2="11" y2="5" />
    <line x1="3" y1="10" x2="14" y2="10" />
    <line x1="3" y1="15" x2="17" y2="15" />
  </svg>
);

// CodeHub Fork Icon — Git-like branching
export const ForkIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="7" cy="5" r="2" />
    <circle cx="7" cy="15" r="2" />
    <circle cx="14" cy="10" r="2" />
    <path d="M7 7v6M9 14l3-2.5" />
  </svg>
);

// Amber Bookmark Icon
export const BookmarkIcon = ({ className = 'w-4 h-4', filled = false, ...props }) => (
  <svg viewBox="0 0 20 20" className={className} {...props}>
    {filled ? (
      <path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3V3z" fill="currentColor" />
    ) : (
      <path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    )}
  </svg>
);
