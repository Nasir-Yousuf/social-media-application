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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNowStrict } from 'date-fns';
import colors from '../theme/colors';
import Avatar from '../components/Avatar';
import CodeSnippetView from '../components/CodeSnippetView';
import PostCard from '../components/PostCard';
import Button from '../components/Button';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

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

  const renderComment = ({ item }) => {
    const author = item.author || {};
    let timeStr = 'now';
    try {
      timeStr = formatDistanceToNowStrict(new Date(item.createdAt));
    } catch {}

    return (
      <View style={styles.commentItem}>
        <Avatar src={author.avatarUrl} name={author.name} size="sm" />
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>{author.name || 'Member'}</Text>
            {author.role === 'admin' && (
              <View style={styles.goldBadge}>
                <Text style={styles.goldBadgeText}>★</Text>
              </View>
            )}
            <Text style={styles.commentHandle}>@{author.username}</Text>
            <Text style={styles.commentDot}>·</Text>
            <Text style={styles.commentTime}>{timeStr}</Text>
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
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id || String(Math.random())}
          renderItem={renderComment}
          ListHeaderComponent={
            post ? (
              <View>
                <PostCard post={post} navigation={navigation} />
                <View style={styles.repliesDivider}>
                  <Text style={styles.repliesTitle}>
                    Replies ({comments.length})
                  </Text>
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
          placeholderTextColor={colors.textSecondary}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  backBtnText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  navTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repliesDivider: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  repliesTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  commentBody: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'nowrap',
  },
  commentAuthor: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  goldBadge: {
    backgroundColor: colors.gold,
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  goldBadgeText: {
    color: '#000000',
    fontSize: 7,
    fontWeight: '900',
  },
  commentHandle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  commentDot: {
    color: colors.textSecondary,
    marginHorizontal: 4,
    fontSize: 12,
  },
  commentTime: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  commentText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  emptyReplies: {
    padding: 30,
    alignItems: 'center',
  },
  emptyRepliesText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    color: colors.text,
    backgroundColor: colors.bg,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});

export default PostDetailScreen;
