import React from 'react';

/* ========================================================================
   CLEARFEED ICONS
   Custom brand icons — no Twitter, no corporate social media.
   Clean, minimal, warm.
   ======================================================================== */

// Clearfeed Logo — Signal circle with inner dot (represents clarity/signal)
export const ClearfeedLogo = ({ className = 'w-8 h-8', ...props }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} {...props}>
    <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="16" cy="16" r="4.5" fill="currentColor" />
    {/* Small signal arcs */}
    <path d="M22.5 9.5a10 10 0 010 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M9.5 22.5a10 10 0 010-13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Clearfeed Logo Mark (compact — just the circle+dot)
export const ClearfeedMark = ({ className = 'w-6 h-6', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
  </svg>
);

// Admin/Faculty badge — Twitter gold shield
export const FacultyBadge = ({ className = 'w-4 h-4 text-[var(--color-cf-amber)]', ...props }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={`inline-block shrink-0 ${className}`} {...props}>
    <path d="M10 1l2.5 1.5L15 3v5c0 3.5-2 6.5-5 8-3-1.5-5-4.5-5-8V3l2.5-.5L10 1z" />
    <path d="M8.5 9.5l1.5 1.5 3-3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Member badge — Simple checkmark in circle
export const MemberBadge = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={`inline-block shrink-0 ${className}`} {...props}>
    <circle cx="10" cy="10" r="8" opacity="0.15" />
    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Boost/Repost icon — Two curved arrows (NOT Twitter's retweet icon)
export const BoostIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14 3l2 2-2 2" />
    <path d="M4 9V7a2 2 0 012-2h10" />
    <path d="M6 17l-2-2 2-2" />
    <path d="M16 11v2a2 2 0 01-2 2H4" />
  </svg>
);

// Chronological icon — Clock with no algorithm
export const ChronologicalIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} {...props}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6v4l2.5 2.5" />
  </svg>
);

// Fork icon — Git-like branching
export const ForkIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="7" cy="5" r="2" />
    <circle cx="7" cy="15" r="2" />
    <circle cx="14" cy="10" r="2" />
    <path d="M7 7v6M9 14l3-2.5" />
  </svg>
);

// Bookmark icon (outline)
export const BookmarkIcon = ({ className = 'w-4 h-4', filled = false, ...props }) => (
  <svg viewBox="0 0 20 20" className={className} {...props}>
    {filled ? (
      <path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3V3z" fill="currentColor" />
    ) : (
      <path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3V3z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    )}
  </svg>
);
