import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../theme/colors';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { CURRICULUM_DATA, TRACK_METADATA } from '../data/learningCurriculum';

const TRACKS = [
  { id: 'html', title: 'HTML5', icon: 'html5', library: FontAwesome5, color: '#e34f26' },
  { id: 'css', title: 'CSS3', icon: 'css3-alt', library: FontAwesome5, color: '#264de4' },
  { id: 'javascript', title: 'JavaScript', icon: 'js', library: FontAwesome5, color: '#f7df1e' },
  { id: 'bootstrap', title: 'Bootstrap', icon: 'bootstrap', library: FontAwesome5, color: '#7952b3' },
];

export const LearnScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [selectedTrack, setSelectedTrack] = useState('html');
  const [lang, setLang] = useState('both'); // 'en' | 'bn' | 'both'
  const [progress, setProgress] = useState({
    completedLessons: [],
    xp: 0,
    streak: 1,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch student learning progress from server
  const fetchProgress = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/learning/progress');
      if (res.data?.progress) {
        setProgress(res.data.progress);
      }
    } catch {
      // Ignored if offline or fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress(false);
  }, [fetchProgress]);

  // Current track curriculum data
  const currentTrackData = CURRICULUM_DATA[selectedTrack] || CURRICULUM_DATA.html;
  const trackMeta = TRACK_METADATA[selectedTrack] || TRACK_METADATA.html;

  // Calculate completion percentage for this track
  const allTrackLessons = (currentTrackData.modules || []).flatMap((m) => m.lessons || []);
  const totalLessonsCount = allTrackLessons.length;
  const completedTrackLessons = allTrackLessons.filter((l) =>
    (progress.completedLessons || []).includes(l.id)
  );
  const completionPercent =
    totalLessonsCount > 0
      ? Math.round((completedTrackLessons.length / totalLessonsCount) * 100)
      : 0;

  const handleLessonPress = (lesson) => {
    navigation.navigate('LessonDetail', {
      trackId: selectedTrack,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lang,
      onCompleted: () => {
        fetchProgress(true);
      },
    });
  };

  const renderModule = ({ item: moduleItem, index: moduleIdx }) => (
    <View style={styles.moduleSection}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleBadge}>
          <Text style={styles.moduleBadgeText}>MODULE {moduleIdx + 1}</Text>
        </View>
        <Text style={styles.moduleTitle}>
          {lang === 'bn' ? moduleItem.titleBn || moduleItem.title : moduleItem.title}
        </Text>
        {moduleItem.description && (
          <Text style={styles.moduleDesc}>
            {lang === 'bn' ? moduleItem.descriptionBn || moduleItem.description : moduleItem.description}
          </Text>
        )}
      </View>

      {/* Lessons List inside this module */}
      {(moduleItem.lessons || []).map((lesson, lessonIdx) => {
        const isDone = (progress.completedLessons || []).includes(lesson.id);

        return (
          <TouchableOpacity
            key={lesson.id}
            style={[styles.lessonCard, isDone && styles.lessonCardDone]}
            activeOpacity={0.7}
            onPress={() => handleLessonPress(lesson)}
          >
            <View style={[styles.lessonStatusIcon, isDone && styles.lessonStatusIconDone]}>
              {isDone ? (
                <Ionicons name="checkmark-circle" size={22} color="#00ba7c" />
              ) : (
                <Ionicons name="play-circle-outline" size={22} color={colors.accent} />
              )}
            </View>

            <View style={styles.lessonInfo}>
              <View style={styles.lessonMetaRow}>
                <Text style={styles.lessonIndexText}>
                  Lesson {moduleIdx + 1}.{lessonIdx + 1}
                </Text>
                <View style={styles.xpPill}>
                  <Text style={styles.xpPillText}>+25 XP</Text>
                </View>
                {lesson.difficulty && (
                  <View style={styles.diffPill}>
                    <Text style={styles.diffPillText}>{lesson.difficulty}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.lessonTitle}>
                {lang === 'bn' ? lesson.titleBn || lesson.title : lesson.title}
              </Text>

              {lang === 'both' && lesson.titleBn && (
                <Text style={styles.lessonTitleBn}>{lesson.titleBn}</Text>
              )}

              {lesson.summary && (
                <Text style={styles.lessonSummary} numberOfLines={2}>
                  {lang === 'bn' ? lesson.summaryBn || lesson.summary : lesson.summary}
                </Text>
              )}
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Learn Studio</Text>
            <Text style={styles.headerSubtitle}>Interactive web architecture curriculum</Text>
          </View>

          {/* Bilingual Selector (EN / BN / Both) */}
          <View style={styles.langSwitchWrapper}>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
              onPress={() => setLang('en')}
            >
              <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'bn' && styles.langBtnActive]}
              onPress={() => setLang('bn')}
            >
              <Text style={[styles.langBtnText, lang === 'bn' && styles.langBtnTextActive]}>বাং</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'both' && styles.langBtnActive]}
              onPress={() => setLang('both')}
            >
              <Text style={[styles.langBtnText, lang === 'both' && styles.langBtnTextActive]}>ALL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Track Selector Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tracksScroll}
          contentContainerStyle={styles.tracksContainer}
        >
          {TRACKS.map((t) => {
            const isSelected = selectedTrack === t.id;
            const IconLib = t.library;

            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.trackPill,
                  isSelected && { backgroundColor: t.color, borderColor: t.color },
                ]}
                onPress={() => setSelectedTrack(t.id)}
                activeOpacity={0.8}
              >
                <IconLib
                  name={t.icon}
                  size={15}
                  color={isSelected ? '#ffffff' : t.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.trackPillText, isSelected && { color: '#ffffff' }]}>
                  {t.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Track Stats Overview Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statsCol}>
          <Text style={styles.statsLabel}>TRACK PROGRESS</Text>
          <Text style={styles.statsValue}>{completionPercent}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completionPercent}%` }]} />
          </View>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.statsCol}>
          <Text style={styles.statsLabel}>LEARNING XP</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sparkles" size={16} color="#ffd700" style={{ marginRight: 4 }} />
            <Text style={styles.statsValue}>{progress.xp || 0} XP</Text>
          </View>
          <Text style={styles.statsSub}>
            {completedTrackLessons.length} of {totalLessonsCount} completed
          </Text>
        </View>
      </View>

      {/* Modules & Lessons List */}
      <FlatList
        data={currentTrackData.modules || []}
        keyExtractor={(item, index) => `module-${index}`}
        renderItem={renderModule}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProgress(true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  langSwitchWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: colors.accent,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langBtnTextActive: {
    color: '#ffffff',
  },
  tracksScroll: {
    marginTop: 6,
  },
  tracksContainer: {
    paddingRight: 16,
    paddingBottom: 4,
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsCol: {
    flex: 1,
  },
  statsDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  statsSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  moduleSection: {
    marginTop: 14,
  },
  moduleHeader: {
    marginBottom: 10,
  },
  moduleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#16222f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  moduleDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lessonCardDone: {
    borderColor: '#0f3a2c',
    backgroundColor: '#071510',
  },
  lessonStatusIcon: {
    marginRight: 12,
  },
  lessonStatusIconDone: {},
  lessonInfo: {
    flex: 1,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  lessonIndexText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: 6,
  },
  xpPill: {
    backgroundColor: '#272005',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  xpPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffc107',
  },
  diffPill: {
    backgroundColor: '#1b2330',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diffPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  lessonTitleBn: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  lessonSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
});

export default LearnScreen;
