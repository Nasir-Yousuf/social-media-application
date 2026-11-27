/**
 * Clearfeed Spaces Screen (Tab 3)
 * Hosts:
 * - Live Peer-to-Peer Spaces Audio Rooms
 * - Space creation and room joining
 * - Quick-Launch AI Study Companion Dock
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { useCall } from '../context/CallContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/Avatar';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

export const SpacesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();
  const {
    callState,
    spacesList,
    activeSpace,
    isSpaceMuted,
    isHandRaised,
    isSpaceHost,
    isSpaceSpeaker,
    speakingUsers,
    createSpace,
    joinSpace,
    leaveSpace,
    toggleSpaceMute,
    requestToSpeak,
    refreshSpaces,
  } = useCall();

  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [creating, setCreating] = useState(false);

  // AI Companion Dock State
  const [showAiModal, setShowAiModal] = useState(false);

  const fetchSpaces = useCallback(async () => {
    try {
      await refreshSpaces?.();
      const res = await api.get('/spaces');
      if (res?.data?.spaces) {
        setSpaces(res.data.spaces);
      } else if (Array.isArray(res?.data)) {
        setSpaces(res.data);
      } else {
        setSpaces([]);
      }
    } catch {
      // In offline or local mode, fall back to empty list gracefully
      setSpaces([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshSpaces]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSpaces();
  };

  const handleHostSpace = async () => {
    if (!newRoomTitle.trim()) {
      showToast('Please provide a room title', 'error');
      return;
    }
    setCreating(true);
    try {
      const selectedTopic = newRoomTopic.trim() || 'General Discussion';
      const created = await createSpace({
        title: newRoomTitle.trim(),
        topic: selectedTopic,
      });
      if (created) {
        setShowCreateModal(false);
        setNewRoomTitle('');
        setNewRoomTopic('');
        showToast('Space is live!', 'success');
        fetchSpaces();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to create Space', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSpace = (space) => {
    if (callState !== 'idle') {
      showToast('You are already on an active call', 'info');
      return;
    }
    joinSpace(space);
  };

  const displayedSpaces = spacesList?.length > 0 ? spacesList : spaces;

  const renderSpaceCard = ({ item }) => {
    const participantCount =
      item.speakers || item.listeners
        ? (item.speakers?.length || 0) + (item.listeners?.length || 0)
        : item.participants?.length || item.listenersCount || 1;

    return (
      <Card style={styles.spaceCard}>
        <View style={styles.cardHeader}>
          <Badge variant="success" text="LIVE AUDIO" style={styles.liveBadge} />
          <View style={styles.listenersBadge}>
            <Ionicons name="people" size={13} color="#14B8A6" style={{ marginRight: 4 }} />
            <Text style={styles.listenersText}>{participantCount} listening</Text>
          </View>
        </View>

        <Text style={styles.roomTitle}>{item.title || 'Developer Discussion'}</Text>
        {item.topic && <Text style={styles.roomTopic}>#{item.topic}</Text>}

        {/* Host Info */}
        <View style={styles.hostRow}>
          <Avatar
            uri={item.host?.avatarUrl}
            name={item.host?.name || 'Host'}
            size={28}
            status="space"
          />
          <Text style={styles.hostName} numberOfLines={1}>
            Hosted by {item.host?.name || 'Community Member'}
          </Text>
        </View>

        {/* Join Button */}
        <Button
          title="Join Space"
          variant="primary"
          size="sm"
          onPress={() => handleJoinSpace(item)}
          style={styles.joinBtn}
        />
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Spaces</Text>
          <Text style={styles.headerSubtitle}>Live peer-to-peer audio discussions</Text>
        </View>
        <Button
          title="Host Space"
          variant="primary"
          size="sm"
          onPress={() => setShowCreateModal(true)}
          style={{ paddingHorizontal: 12 }}
        />
      </View>

      {/* AI Study Companion Quick Dock */}
      <TouchableOpacity
        style={styles.aiDockCard}
        onPress={() => navigation?.navigate('AICompanion')}
        activeOpacity={0.85}
      >
        <View style={styles.aiLeft}>
          <View style={styles.aiIconBadge}>
            <Ionicons name="sparkles" size={18} color="#14B8A6" />
          </View>
          <View>
            <Text style={styles.aiDockTitle}>AI Study Companion & Mentor</Text>
            <Text style={styles.aiDockSub}>Multi-session chat, code analysis & mock interviews</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.aiLaunchBtn}
          onPress={() => navigation?.navigate('AICompanion')}
          activeOpacity={0.8}
        >
          <Text style={styles.aiLaunchText}>Launch</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Active Spaces List */}
      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      ) : (
        <FlatList
          data={displayedSpaces}
          keyExtractor={(item, idx) => item._id || item.id || item.roomId || String(idx)}
          renderItem={renderSpaceCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#14B8A6"
              colors={['#14B8A6']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="radio" size={48} color="#334155" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No Live Spaces Active</Text>
              <Text style={styles.emptySub}>
                Start a live developer room or practice coding with the AI Companion!
              </Text>
              <Button
                title="Start First Space"
                variant="primary"
                size="md"
                onPress={() => setShowCreateModal(true)}
                style={{ marginTop: 16 }}
              />
            </View>
          }
        />
      )}

      {/* Host Space Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Host a Live Space</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="What do you want to talk about?"
              placeholderTextColor="#64748B"
              value={newRoomTitle}
              onChangeText={setNewRoomTitle}
              maxLength={80}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Topic or Tag (e.g. React, Rust, Career)"
              placeholderTextColor="#64748B"
              value={newRoomTopic}
              onChangeText={setNewRoomTopic}
              maxLength={40}
            />

            <Button
              title={creating ? 'Starting...' : 'Go Live Now'}
              variant="primary"
              size="lg"
              onPress={handleHostSpace}
              disabled={creating}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* AI Companion Quick Modal */}
      <Modal visible={showAiModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Study Companion</Text>
              <TouchableOpacity onPress={() => setShowAiModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16 }}>
              Select an AI mode to assist your learning and programming session:
            </Text>

            <TouchableOpacity
              style={styles.aiOptionCard}
              onPress={() => {
                setShowAiModal(false);
                showToast('AI Code Reviewer initialized', 'success');
              }}
            >
              <Ionicons name="code-slash" size={20} color="#14B8A6" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiOptionTitle}>Code & Architecture Review</Text>
                <Text style={styles.aiOptionSub}>Instant feedback on algorithms and code style</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiOptionCard}
              onPress={() => {
                setShowAiModal(false);
                showToast('Interactive Study Mentor ready', 'success');
              }}
            >
              <Ionicons name="school" size={20} color="#6366F1" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiOptionTitle}>Lesson Q&A & Concept Deep Dive</Text>
                <Text style={styles.aiOptionSub}>Answers questions on all Clearfeed Academy tracks</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Active Live Space Stage Modal */}
      <Modal visible={Boolean(activeSpace)} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.container, { paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 24 }]}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Badge variant="success" text="LIVE SPACE" style={styles.liveBadge} />
              <Text style={[styles.roomTitle, { fontSize: 20, marginTop: 8 }]} numberOfLines={2}>
                {activeSpace?.title || 'Live Audio Space'}
              </Text>
              {activeSpace?.topic && <Text style={styles.roomTopic}>#{activeSpace.topic}</Text>}
            </View>
            <Button
              title={isSpaceHost ? 'End' : 'Leave'}
              variant="secondary"
              size="sm"
              onPress={leaveSpace}
            />
          </View>

          <Text style={[styles.listenersText, { marginBottom: 12 }]}>
            Speakers Stage ({activeSpace?.speakers?.length || 1}) • {activeSpace?.listeners?.length || 0} Listeners
          </Text>

          <FlatList
            data={activeSpace?.speakers || (activeSpace?.host ? [{ user: activeSpace.host, role: 'HOST', isMuted: false }] : [])}
            numColumns={2}
            keyExtractor={(s, idx) => s.user?._id || s.user?.id || String(idx)}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
            renderItem={({ item: spk }) => {
              const u = spk.user || {};
              const isSpkSpeaking = speakingUsers?.has?.(u._id);
              return (
                <Card style={[styles.spaceCard, { width: '48%', alignItems: 'center', padding: 14, borderColor: isSpkSpeaking ? '#14B8A6' : '#334155', borderWidth: 1 }]}>
                  <Avatar uri={u.avatarUrl} name={u.name || 'Speaker'} size={52} />
                  <Text style={[styles.roomTitle, { fontSize: 14, marginTop: 8, marginBottom: 2 }]} numberOfLines={1}>
                    {u.name || 'Speaker'}
                  </Text>
                  <Text style={styles.roomTopic}>
                    {spk.role || 'SPEAKER'} {spk.isMuted ? '• Muted' : '• Live'}
                  </Text>
                </Card>
              );
            }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1E293B' }}>
            {isSpaceSpeaker ? (
              <Button
                title={isSpaceMuted ? 'Unmute Mic' : 'Mute Mic'}
                variant={isSpaceMuted ? 'secondary' : 'primary'}
                size="lg"
                onPress={toggleSpaceMute}
                style={{ flex: 1 }}
              />
            ) : (
              <Button
                title={isHandRaised ? 'Lower Hand ✋' : 'Request to Speak'}
                variant={isHandRaised ? 'primary' : 'secondary'}
                size="lg"
                onPress={requestToSpeak}
                style={{ flex: 1 }}
              />
            )}

            <Button
              title={isSpaceHost ? 'End Space' : 'Leave'}
              variant="secondary"
              size="lg"
              onPress={leaveSpace}
              style={{ backgroundColor: '#7F1D1D', borderColor: '#DC2626' }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  aiDockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  aiDockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  aiDockSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  aiLaunchBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiLaunchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  spaceCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  liveBadge: {
    alignSelf: 'flex-start',
  },
  listenersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenersText: {
    fontSize: 11,
    color: '#14B8A6',
    fontWeight: '600',
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  roomTopic: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '600',
    marginBottom: 10,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostName: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
    flex: 1,
  },
  joinBtn: {
    marginTop: 4,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalInput: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  aiOptionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});

export default SpacesScreen;
