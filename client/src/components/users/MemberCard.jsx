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
    <div className="p-4 rounded-xl cf-surface border cf-border flex flex-col justify-between gap-3 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <NavLink to={`/profile/${member.username}`} className="flex items-center gap-3 min-w-0">
          <Avatar
            src={member.avatarUrl}
            name={member.name}
            size="md"
            showRoleBadge={true}
            role={member.role}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans font-bold text-sm cf-text hover:underline truncate">
                {member.name}
              </span>
              {member.role === 'admin' && (
                <FacultyBadge className="w-3.5 h-3.5 text-[var(--color-cf-amber)]" />
              )}
            </div>
            <span className="text-xs cf-text-muted block truncate font-sans">@{member.username}</span>
            {member.status && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)] text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] font-medium inline-block mt-1">
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
        <p className="text-xs cf-text/90 line-clamp-2 leading-relaxed font-serif">
          {member.bio}
        </p>
      )}

      <div className="pt-2 border-t cf-border flex items-center justify-between text-xs cf-text-muted font-sans">
        <span>
          <strong className="cf-text font-bold">{followersCount}</strong> follower{followersCount === 1 ? '' : 's'}
        </span>
        <NavLink
          to={`/profile/${member.username}`}
          className="text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] hover:underline font-semibold text-xs"
        >
          View profile &rarr;
        </NavLink>
      </div>
    </div>
  );
};

export default MemberCard;
