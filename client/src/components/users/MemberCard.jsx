import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Check, UserPlus } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';

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
        showToast(`Now following @${member.username}`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update follow status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between gap-3 hover:border-zinc-700/80 transition-all hover:shadow-lg hover:shadow-black/20">
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
              <span className="font-bold text-sm text-zinc-100 hover:text-indigo-400 truncate">
                {member.name}
              </span>
              {member.role === 'admin' && (
                <Badge variant="admin" size="xs">
                  Instructor
                </Badge>
              )}
            </div>
            <span className="text-xs text-zinc-400 block truncate">@{member.username}</span>
          </div>
        </NavLink>

        {!member.isSelf && (
          <Button
            variant={isFollowing ? 'outline' : 'primary'}
            size="xs"
            onClick={handleFollowToggle}
            isLoading={loading}
          >
            {isFollowing ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" />
                <span>Follow</span>
              </>
            )}
          </Button>
        )}
      </div>

      {member.bio && (
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {member.bio}
        </p>
      )}

      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <strong className="text-zinc-200">{followersCount}</strong> followers
        </span>
        <NavLink
          to={`/profile/${member.username}`}
          className="text-indigo-400 hover:underline text-[11px]"
        >
          View Profile &rarr;
        </NavLink>
      </div>
    </div>
  );
};

export default MemberCard;
