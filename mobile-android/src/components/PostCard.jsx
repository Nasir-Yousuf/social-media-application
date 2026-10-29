import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { formatDistanceToNowStrict } from 'date-fns';
import colors from '../theme/colors';
import Avatar from './Avatar';
import CodeSnippetView from './CodeSnippetView';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  HeartIcon,
  CommentIcon,
  RetweetIcon,
  BookmarkIcon,
  ShareIcon,
  PinIcon,
  VerifiedBadge,
} from './TwitterIcons';

export const PostCard = ({
  post,
  onPress,
  onDeleted,
  onUpdated,
  navigation,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const author = post.author || {};
  const [likesCount, setLikesCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : (post.likesCount || 0)
  );
  const [isLiked, setIsLiked] = useState(
    Array.isArray(post.likes) && user ? post.likes.includes(user._id) : (post.isLiked || false)
  );
  const [commentsCount, setCommentsCount] = useState(
    Array.isArray(post.comments) ? post.comments.length : (post.commentsCount || 0)
  );
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [reposted, setReposted] = useState(false);

  // Format relative timestamp
  const getFormattedDate = (dateStr) => {
    try {
      return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: false });
    } catch {
      return 'now';
    }
  };

  // Like Toggle
  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      showToast('Failed to update like', 'error');
    }
  };

  // Bookmark Toggle
  const handleBookmark = async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      const res = await api.post(`/posts/${post._id}/bookmark`);
      setIsBookmarked(res.data.isBookmarked);
      showToast(res.data.isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
    } catch (err) {
      setIsBookmarked(prev);
      showToast('Failed to update bookmark', 'error');
    }
  };

  // Repost
  const handleRepost = () => {
    setReposted(!reposted);
    showToast(reposted ? 'Undo repost' : 'Reposted to feed', 'success');
  };

  // Share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${author.name || 'Clearfeed user'}: "${post.content?.substring(0, 100)}..."\n\nShared via Clearfeed`,
      });
    } catch (err) {
      // User cancelled
    }
  };

  const hasCode =
    post.codeSnippet &&
    ((Array.isArray(post.codeSnippet.files) && post.codeSnippet.files.length > 0) ||
      post.codeSnippet.code);

  return (
    <View style={styles.card}>
      {/* Pinned or Announcement Header */}
      {(post.isPinned || post.isAnnouncement) && (
        <View style={styles.badgeHeader}>
          <PinIcon size={12} color={colors.gold} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>
            {post.isPinned ? 'Pinned Post' : 'Announcement'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress && onPress(post)}
        style={styles.innerContent}
      >
        <View style={styles.row}>
          {/* Author Avatar */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation?.navigate('Profile', { username: author.username })
            }
          >
            <Avatar
              src={author.avatarUrl}
              name={author.name}
              role={author.role}
              size="md"
              showRoleBadge={true}
            />
          </TouchableOpacity>

          {/* Author Details & Content */}
          <View style={styles.mainCol}>
            <View style={styles.authorRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {author.name || 'Member'}
              </Text>

              {/* Verified Shield Badge for Admin */}
              {author.role === 'admin' && (
                <VerifiedBadge size={13} style={{ marginLeft: 4 }} />
              )}

              <Text style={styles.authorHandle} numberOfLines={1}>
                @{author.username || 'user'}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.timestamp}>{getFormattedDate(post.createdAt)}</Text>
            </View>

            {/* Post Content */}
            <Text style={styles.content}>{post.content}</Text>

            {/* Code Snippet Block */}
            {hasCode && (
              <View style={styles.snippetContainer}>
                <CodeSnippetView snippet={post.codeSnippet} />
              </View>
            )}

            {/* Action Bar (Twitter Icons & Counts) */}
            <View style={styles.actionBar}>
              {/* Comment / Reply */}
              <TouchableOpacity
                onPress={() => onPress && onPress(post)}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <CommentIcon size={16} />
                {commentsCount > 0 && (
                  <Text style={styles.actionCount}>{commentsCount}</Text>
                )}
              </TouchableOpacity>

              {/* Repost / Retweet */}
              <TouchableOpacity
                onPress={handleRepost}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <RetweetIcon size={16} active={reposted} />
                {reposted && <Text style={[styles.actionCount, { color: colors.retweet }]}>1</Text>}
              </TouchableOpacity>

              {/* Like / Heart */}
              <TouchableOpacity
                onPress={handleLike}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <HeartIcon size={16} filled={isLiked} />
                {likesCount > 0 && (
                  <Text style={[styles.actionCount, isLiked && { color: colors.like }]}>
                    {likesCount}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Bookmark */}
              <TouchableOpacity
                onPress={handleBookmark}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <BookmarkIcon size={16} filled={isBookmarked} />
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity
                onPress={handleShare}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <ShareIcon size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 38,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  badgeText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  innerContent: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainCol: {
    flex: 1,
    marginLeft: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    marginBottom: 4,
  },
  authorName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    maxWidth: '40%',
  },
  goldBadge: {
    backgroundColor: colors.gold,
    borderRadius: 6,
    width: 13,
    height: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  goldBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  authorHandle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 4,
    maxWidth: '30%',
  },
  dot: {
    color: colors.textSecondary,
    marginHorizontal: 4,
    fontSize: 13,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  content: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  snippetContainer: {
    marginTop: 8,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingRight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionCount: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default PostCard;
