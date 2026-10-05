import React from 'react';
import { FacultyBadge } from './ClearfeedIcons';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
};

// Curated avatar background palette
const AVATAR_BG_COLORS = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-cyan-500',
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
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : '';
  if (url.startsWith('/api') || url.startsWith('/')) {
    return `${apiBase}${url}`;
  }
  return url;
};

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
  showRoleBadge = false,
  role = 'student',
}) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const initials = getInitials(name);
  const bgClass = getInitialsClass(name);

  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'user')}&backgroundColor=1d9bf0,00ba7c,7856ff,f91880&textColor=ffffff&fontSize=40`;
  const resolvedSrc = resolveAvatarUrl(src);

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className={`${sizeClasses} rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-800 transition-opacity duration-200 hover:opacity-90 shadow-2xs`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-sans font-bold text-white shadow-2xs ring-1 ring-neutral-200 dark:ring-neutral-800 ${bgClass}`}
          title={name}
        >
          {initials || '?'}
        </div>
      )}
    </div>
  );
};

export default Avatar;
