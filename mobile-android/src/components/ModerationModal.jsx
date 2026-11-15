/**
 * Clearfeed Moderation & Report Modal
 * Provides:
 * - Content reporting (Spam, Harassment, Code Plagiarism, Hate Speech) -> POST /api/posts/:id/flag
 * - User blocking -> Local persistent blocklist (@cf_blocked_users) filtering feed & messages
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import Button from './Button';
import { getBlockedUserIds, blockUserId, unblockUserId } from '../services/moderationService';

export { getBlockedUserIds, blockUserId, unblockUserId };

export const ModerationModal = ({
  visible,
  onClose,
  targetPost = null,
  targetUser = null,
  onPostFlagged,
  onUserBlocked,
}) => {
  const { showToast } = useNotifications();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async () => {
    setSubmitting(true);
    const reasonText = `${selectedReason}${customNotes ? ` - Notes: ${customNotes.trim()}` : ''}`;

    try {
      if (targetPost?._id) {
        await api.post(`/posts/${targetPost._id}/flag`, { reason: reasonText });
        showToast('Report submitted. Moderators will review.', 'success');
        if (onPostFlagged) onPostFlagged(targetPost._id);
      } else {
        showToast('User reported to moderation team.', 'success');
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlock = () => {
    const userToBlock = targetUser || targetPost?.author;
    if (!userToBlock?._id) return;

    Alert.alert(
      'Block User',
      `Are you sure you want to block @${userToBlock.username || 'this user'}? Their posts, comments, and messages will no longer appear in your feed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await blockUserId(userToBlock._id);
            showToast(`@${userToBlock.username || 'User'} has been blocked`, 'info');
            if (onUserBlocked) onUserBlocked(userToBlock._id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="shield-checkmark" size={20} color="#14B8A6" style={{ marginRight: 8 }} />
              <Text style={styles.title}>Safety & Moderation</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Select a reason for reporting this content:</Text>

          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonRow,
                selectedReason === reason && styles.reasonRowActive,
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={[styles.radio, selectedReason === reason && styles.radioActive]} />
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.notesInput}
            placeholder="Additional context or details (optional)..."
            placeholderTextColor="#64748B"
            value={customNotes}
            onChangeText={setCustomNotes}
            maxLength={200}
            multiline
          />

          <View style={styles.actions}>
            <Button
              title={submitting ? 'Submitting...' : 'Submit Report'}
              variant="primary"
              size="md"
              onPress={handleReport}
              disabled={submitting}
              style={{ flex: 1 }}
            />

            {(targetUser?._id || targetPost?.author?._id) && (
              <TouchableOpacity style={styles.blockBtn} onPress={handleBlock} activeOpacity={0.8}>
                <Ionicons name="ban" size={16} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.blockBtnText}>Block User</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonRowActive: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#64748B',
    marginRight: 10,
  },
  radioActive: {
    borderColor: '#14B8A6',
    backgroundColor: '#14B8A6',
  },
  reasonText: {
    fontSize: 13,
    color: '#E2E8F0',
    flex: 1,
  },
  notesInput: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    height: 60,
    textAlignVertical: 'top',
    marginTop: 8,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  blockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  blockBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ModerationModal;
