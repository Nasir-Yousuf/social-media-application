import React, { useState, useEffect } from 'react';
import { FacultyBadge } from './ClearfeedIcons';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
};

// ClearUI curated avatar background palette
const AVATAR_BG_COLORS = [
  'bg-teal-600',
  'bg-amber-600',
  'bg-indigo-600',
  'bg-cyan-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-slate-700',
];

const getInitialsClass = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length];
};

const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const resolveAvatarUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('pulse518_api_url');
    if (custom) {
      const origin = custom.trim().replace(/\/+$/, '').replace(/\/api$/, '');
      const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      return `${origin}${cleanPath}`;
    }
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const Avatar = ({
  src = '',
  user = null,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
  showRoleBadge = false,
  role = 'student',
  status = null, // 'online' | 'mesh' | 'space' | 'idle'
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const effectiveSrc = src || user?.avatarUrl;
  const effectiveName = name || user?.name || user?.username || '';
  const effectiveRole = user?.role || role;
  const effectiveStatus = status || (user?.isMeshOnline ? 'mesh' : user?.isOnline ? 'online' : null);

  const sizeClasses = sizeMap[size] || sizeMap.md;
  const initials = getInitials(effectiveName);
  const bgClass = getInitialsClass(effectiveName);

  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(effectiveName || 'user')}&backgroundColor=14b8a6,f59e0b,6366f1,06b6d4,22c55e&textColor=ffffff&fontSize=40`;
  const resolvedSrc = resolveAvatarUrl(effectiveSrc);

  useEffect(() => {
    setImgFailed(false);
  }, [resolvedSrc]);

  // Status ring configuration
  let ringClass = 'ring-1 ring-[#334155]/60';
  let statusBadge = null;

  if (effectiveStatus === 'online') {
    ringClass = 'ring-2 ring-[#14B8A6]';
    statusBadge = (
      <span
        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#14B8A6] ring-2 ring-[#090D16]"
        title="Online Signal"
      />
    );
  } else if (effectiveStatus === 'mesh') {
    ringClass = 'ring-2 ring-[#F59E0B]';
    statusBadge = (
      <span
        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#F59E0B] ring-2 ring-[#090D16] animate-pulse"
        title="Offline Mesh Node Active"
      />
    );
  } else if (effectiveStatus === 'space') {
    ringClass = 'ring-2 ring-[#6366F1] animate-pulse';
    statusBadge = (
      <span
        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#6366F1] ring-2 ring-[#090D16]"
        title="In Live Space"
      />
    );
  }

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {resolvedSrc && !imgFailed ? (
        <img
          key={resolvedSrc}
          src={resolvedSrc}
          alt={alt}
          className={`${sizeClasses} rounded-full object-cover ${ringClass} transition-opacity duration-200 hover:opacity-90 shadow-2xs`}
          onError={(e) => {
            if (e.target.src !== defaultAvatar) {
              e.target.src = defaultAvatar;
            } else {
              setImgFailed(true);
            }
          }}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-sans font-bold text-white shadow-2xs ${ringClass} ${bgClass}`}
          title={name}
        >
          {initials || '?'}
        </div>
      )}

      {/* Network / Space Status Ring Dot */}
      {statusBadge}

      {/* Faculty / Maintainer Badge */}
      {showRoleBadge && effectiveRole === 'faculty' && !statusBadge && (
        <span
          className="absolute -bottom-0.5 -right-0.5 bg-[#090D16] rounded-full p-0.5 shadow-xs ring-1 ring-[#334155]"
          title="Verified Faculty / Maintainer"
        >
          <FacultyBadge className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
};

export default Avatar;
