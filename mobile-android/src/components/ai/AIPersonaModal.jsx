/**
 * AIPersonaModal
 * 
 * Custom AI Identity & Persona settings modal for Android.
 * Lets users customize name, role preset, custom system instructions,
 * and English / বাংলা / Bilingual language preferences.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { PERSONA_PRESETS, LANGUAGE_OPTIONS } from '../../data/aiPersonaPresets.js';

export { PERSONA_PRESETS, LANGUAGE_OPTIONS };

export const AIPersonaModal = ({ isOpen, onClose, onSaved }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();

  const [customName, setCustomName] = useState('Clearfeed AI');
  const [rolePersona, setRolePersona] = useState('Socratic Coding Mentor');
  const [customInstructions, setCustomInstructions] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCurrentPersona();
    }
  }, [isOpen]);

  const loadCurrentPersona = async () => {
    setLoading(true);
    try {
      // 1. Try local cache first for instant response
      const cached = await AsyncStorage.getItem('@clearfeed_ai_persona_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.customName) setCustomName(parsed.customName);
        if (parsed.rolePersona) setRolePersona(parsed.rolePersona);
        if (parsed.systemInstructions) setCustomInstructions(parsed.systemInstructions);
        if (parsed.preferredLanguage) setPreferredLanguage(parsed.preferredLanguage);
      }

      // 2. Fetch from backend
      const res = await api.get('/ai/persona');
      if (res.data?.persona) {
        const p = res.data.persona;
        setCustomName(p.customName || 'Clearfeed AI');
        setRolePersona(p.rolePersona || 'Socratic Coding Mentor');
        setCustomInstructions(p.systemInstructions || '');
        setPreferredLanguage(p.preferredLanguage || 'auto');
        await AsyncStorage.setItem('@clearfeed_ai_persona_cache', JSON.stringify(p));
      }
    } catch (err) {
      console.warn('Failed to fetch AI persona from server, using cached settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      customName: customName.trim() || 'Clearfeed AI',
      rolePersona: rolePersona.trim() || 'Socratic Coding Mentor',
      systemInstructions: customInstructions.trim(),
      preferredLanguage,
    };

    try {
      const res = await api.put('/ai/persona', payload);
      await AsyncStorage.setItem('@clearfeed_ai_persona_cache', JSON.stringify(payload));

      showToast('AI Companion preferences updated! ✨', 'success');
      if (onSaved) onSaved(res.data?.persona || payload);
      onClose();
    } catch (err) {
      console.warn('Failed to save AI persona to backend:', err.message);
      // Still persist locally so offline mode works!
      await AsyncStorage.setItem('@clearfeed_ai_persona_cache', JSON.stringify(payload));
      showToast('Saved locally in offline mode ✨', 'info');
      if (onSaved) onSaved(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.iconCircle}>
                <Ionicons name="sparkles" size={18} color="#14B8A6" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Customize AI Companion</Text>
                <Text style={styles.headerSubtitle}>Personalize identity, teaching style & language</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#14B8A6" />
              <Text style={styles.loadingText}>Loading persona...</Text>
            </View>
          ) : (
            <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
              {/* 1. Custom Name */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Name Your Companion</Text>
                <Text style={styles.sectionSub}>What should your AI call itself?</Text>
                <TextInput
                  style={styles.textInput}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="e.g. Emma, Maya, Alex, Socratic Mentor"
                  placeholderTextColor="#64748B"
                  maxLength={50}
                />
              </View>

              {/* 2. Persona Role Presets */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Role & Teaching Persona</Text>
                <Text style={styles.sectionSub}>Choose how they interact and reason with you</Text>

                <View style={styles.presetGrid}>
                  {PERSONA_PRESETS.map((p) => {
                    const isSelected = rolePersona === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.presetCard, isSelected && styles.presetCardActive]}
                        onPress={() => setRolePersona(p.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.presetTitle, isSelected && styles.presetTitleActive]}>
                          {p.label}
                        </Text>
                        <Text style={styles.presetDesc}>{p.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. Language Preferences */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Preferred Language</Text>
                <Text style={styles.sectionSub}>Language style used for responses</Text>

                <View style={styles.langGrid}>
                  {LANGUAGE_OPTIONS.map((opt) => {
                    const isSelected = preferredLanguage === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.langCard, isSelected && styles.langCardActive]}
                        onPress={() => setPreferredLanguage(opt.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.langTitle, isSelected && styles.langTitleActive]}>
                          {opt.label}
                        </Text>
                        <Text style={styles.langDesc}>{opt.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. Custom System Instructions */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Custom Directives (Optional)</Text>
                <Text style={styles.sectionSub}>Extra instructions or focus areas for the mentor</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={customInstructions}
                  onChangeText={setCustomInstructions}
                  placeholder="e.g. Always emphasize memory safety; explain algorithms with real-life physical analogies..."
                  placeholderTextColor="#64748B"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#090D16" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#090D16" />
                    <Text style={styles.saveBtnText}>Save Persona</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalSheet: {
    backgroundColor: '#090D16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  bodyScroll: {
    maxHeight: 520,
  },
  bodyContent: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  presetGrid: {
    gap: 8,
  },
  presetCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
  },
  presetCardActive: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  presetTitleActive: {
    color: '#14B8A6',
  },
  presetDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 16,
  },
  langGrid: {
    gap: 8,
  },
  langCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
  },
  langCardActive: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  langTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  langTitleActive: {
    color: '#14B8A6',
  },
  langDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default AIPersonaModal;
