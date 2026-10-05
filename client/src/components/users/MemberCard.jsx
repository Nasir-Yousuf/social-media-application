import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { FacultyBadge } from '../common/ClearfeedIcons';

export const MemberCard = ({ member }) => {
  const { showToast } = useNotifications();
  const [isFollowing, setIsFollowing] = useState(member.isFollowing);
  const [followersCount, setFollowersCount] = useState(member.followersCount || 0);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${member._id}/follow`);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
        showToast(`Unfollowed @${member.username}`, 'info');
      } else {
        await api.post(`/users/${member._id}/follow`);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        showToast(`Following @${member.username}`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update follow status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between gap-3 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700/80 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <NavLink to={`/profile/${member.username}`} className="flex items-center gap-3 min-w-0">
          <Avatar
            src={member.avatarUrl}
            name={member.name}
            size="md"
            showRoleBadge={false}
            role={member.role}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:underline truncate">
                {member.name}
              </span>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block truncate font-sans">
              @{member.username}
            </span>
            {member.status && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium inline-block mt-1">
                {member.status}
              </span>
            )}
          </div>
        </NavLink>

        {!member.isSelf && (
          <Button
            variant={isFollowing ? 'outline' : 'secondary'}
            size="xs"
            onClick={handleFollowToggle}
            isLoading={loading}
            className="px-3.5 py-1 font-bold"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      {member.bio && (
        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed font-sans">
          {member.bio}
        </p>
      )}

      <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-sans">
        <span>
          <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{followersCount}</strong> follower{followersCount === 1 ? '' : 's'}
        </span>
        <NavLink
          to={`/profile/${member.username}`}
          className="text-sky-500 hover:underline font-semibold text-xs"
        >
          View profile &rarr;
        </NavLink>
      </div>
    </div>
  );
};

export default MemberCard;
