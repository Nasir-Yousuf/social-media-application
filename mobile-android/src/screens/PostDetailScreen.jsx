/**
 * Clearfeed Post Detail Screen
 * Features:
 * - Full post display with CodeSnippetView and media
 * - Threaded / nested comments
 * - Comment creation & deletion (DELETE /api/comments/:id)
 * - Moderation & report integration
 * - Back button & ClearUI design tokens
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNowStrict } from 'date-fns';
import colors from '../theme/colors';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import Button from '../components/Button';
import ModerationModal from '../components/ModerationModal';
import ClassroomMentorSheet from '../components/ai/ClassroomMentorSheet';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { VerifiedBadge } from '../components/TwitterIcons';

export const PostDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { postId, post: initialPost } = route.params;
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [post, setPost] = useState(initialPost || null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(!initialPost);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [showMentorSheet, setShowMentorSheet] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const res = await api.get(`/posts/${postId}`);
        setPost(res.data.post || res.data);

        // Fetch comments
        const commentsRes = await api.get(`/posts/${postId}/comments`);
        setComments(commentsRes.data.comments || []);
      } catch (err) {
        showToast('Could not load post details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId, showToast]);

  const handleSendComment = async () => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: replyText.trim(),
      });
      setComments((prev) => [res.data.comment, ...prev]);
      setReplyText('');
      showToast('Reply published', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post reply', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Delete Reply', 'Are you sure you want to delete this reply?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            showToast('Reply removed', 'info');
          } catch {
            showToast('Failed to delete reply', 'error');
          }
        },
      },
    ]);
  };

  const renderComment = ({ item }) => {
    const author = item.author || {};
    const canDelete = user && (user._id === author._id || user.role === 'admin');
    let timeStr = 'now';
    try {
      timeStr = formatDistanceToNowStrict(new Date(item.createdAt));
    } catch {}

    return (
      <View style={styles.commentItem}>
        <Avatar src={author.avatarUrl} name={author.name} size="sm" />
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <View style={styles.authorRow}>
              <Text style={styles.commentAuthor}>{author.name || 'Member'}</Text>
              {author.role === 'admin' && (
                <VerifiedBadge size={12} style={{ marginLeft: 4 }} />
              )}
              <Text style={styles.commentHandle}>@{author.username}</Text>
              <Text style={styles.commentDot}>·</Text>
              <Text style={styles.commentTime}>{timeStr}</Text>
            </View>

            {canDelete && (
              <TouchableOpacity
                onPress={() => handleDeleteComment(item._id)}
                style={styles.deleteCommentBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Post</Text>
        <TouchableOpacity onPress={() => setShowModeration(true)} style={styles.flagNavBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id || String(Math.random())}
          renderItem={renderComment}
          ListHeaderComponent={
            post ? (
              <View>
                <PostCard
                  post={post}
                  onFlag={() => setShowModeration(true)}
                  navigation={navigation}
                />
                {(post?.codeSnippet?.code || (Array.isArray(post?.codeSnippet?.files) && post.codeSnippet.files.length > 0)) && (
                  <TouchableOpacity
                    style={styles.aiCodeBanner}
                    onPress={() => setShowMentorSheet(true)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.aiCodeBannerLeft}>
                      <Ionicons name="sparkles" size={15} color="#14B8A6" />
                      <Text style={styles.aiCodeBannerTitle}>Ask AI Mentor about this code</Text>
                    </View>
                    <View style={styles.aiCodeBannerBtn}>
                      <Text style={styles.aiCodeBannerBtnText}>Ask AI</Text>
                    </View>
                  </TouchableOpacity>
                )}
                <View style={styles.repliesDivider}>
                  <Text style={styles.repliesTitle}>Replies ({comments.length})</Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyReplies}>
              <Text style={styles.emptyRepliesText}>No replies yet. Start the conversation!</Text>
            </View>
          }
        />
      )}

      {/* Reply Input Bar */}
      <View style={[styles.replyBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Avatar src={user?.avatarUrl} name={user?.name} size="xs" />
        <TextInput
          placeholder="Post your reply..."
          placeholderTextColor="#64748B"
          value={replyText}
          onChangeText={setReplyText}
          style={styles.replyInput}
        />
        <Button
          variant="primary"
          size="sm"
          onPress={handleSendComment}
          disabled={!replyText.trim() || submitting}
          isLoading={submitting}
          style={styles.replyBtn}
        >
          Reply
        </Button>
      </View>

      {/* Moderation Modal */}
      <ModerationModal
        visible={showModeration}
        onClose={() => setShowModeration(false)}
        targetPost={post}
        onUserBlocked={() => {
          navigation.goBack();
        }}
      />

      {/* Contextual AI Classroom Mentor Sheet */}
      <ClassroomMentorSheet
        isOpen={showMentorSheet}
        onClose={() => setShowMentorSheet(false)}
        lessonId={post?._id}
        trackId={post?.codeSnippet?.language || 'code'}
        initialCode={post?.codeSnippet?.code || post?.codeSnippet?.files?.[0]?.code || ''}
        contextTitle={post?.content?.slice(0, 45)}
        navigation={navigation}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  flagNavBtn: {
    padding: 4,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repliesDivider: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  repliesTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  commentBody: {
    marginLeft: 12,
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  commentAuthor: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  commentHandle: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 4,
  },
  commentDot: {
    color: '#64748B',
    marginHorizontal: 4,
  },
  commentTime: {
    color: '#64748B',
    fontSize: 11,
  },
  deleteCommentBtn: {
    padding: 4,
    marginLeft: 8,
  },
  commentText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
  },
  emptyReplies: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyRepliesText: {
    color: '#64748B',
    fontSize: 13,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyBtn: {
    paddingHorizontal: 14,
  },
  aiCodeBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiCodeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  aiCodeBannerTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  aiCodeBannerBtn: {
    backgroundColor: '#14B8A6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  aiCodeBannerBtnText: {
    color: '#090D16',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default PostDetailScreen;
