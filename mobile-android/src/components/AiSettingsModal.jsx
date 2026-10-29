import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../theme/colors";
import api from "../api/client";
import { useNotifications } from "../context/NotificationContext";

const RELATIONSHIP_PRESETS = [
  {
    id: "best friend",
    label: "Best Friend 🤝",
    desc: "Chill, hilarious, deeply supportive, talks about life and code",
  },
  {
    id: "english partner",
    label: "English Chatting Partner 🇬🇧",
    desc: "Fluent English partner who chats, teaches vocabulary, and gently fixes mistakes",
  },
  {
    id: "girlfriend",
    label: "Girlfriend ❤️",
    desc: "Affectionate, caring, sweet, playful, and emotionally attentive",
  },
  {
    id: "boyfriend",
    label: "Boyfriend 💙",
    desc: "Supportive, protective, warm, thoughtful, and playful",
  },
  {
    id: "coding mentor",
    label: "Coding Mentor 💡",
    desc: "Expert senior developer who patiently debugs code with you",
  },
  {
    id: "study buddy",
    label: "Study Buddy 📚",
    desc: "Focused classmate who studies lessons and motivates you",
  },
];

const LANGUAGE_OPTIONS = [
  {
    id: "auto",
    label: "Auto Detect 🌐",
    desc: "Automatically matches Bangla, English, or mixed",
  },
  {
    id: "bangla",
    label: "বাংলা (Bangla) 🇧🇩",
    desc: "Warm, natural Bengali conversation",
  },
  {
    id: "english",
    label: "English 🇬🇧",
    desc: "Natural conversational English",
  },
  {
    id: "both",
    label: "Both / Banglish 💬",
    desc: "Young, casual mix of English & Bangla",
  },
];

export const AiSettingsModal = ({
  isOpen,
  onClose,
  conversationId,
  currentSettings,
  onSaved,
}) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();

  const [customName, setCustomName] = useState("Clearfeed AI");
  const [relationship, setRelationship] = useState("best friend");
  const [isCustomRel, setIsCustomRel] = useState(false);
  const [languagePref, setLanguagePref] = useState("auto");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setCustomName(currentSettings.customName || "Clearfeed AI");
      const rel = currentSettings.relationship || "best friend";
      setRelationship(rel);
      const isPreset = RELATIONSHIP_PRESETS.some((p) => p.id === rel);
      setIsCustomRel(!isPreset);
      setLanguagePref(currentSettings.languagePref || "auto");
    }
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    const nameToSave = customName.trim() || "Clearfeed AI";
    const relToSave = relationship.trim() || "best friend";

    try {
      const res = await api.put(
        `/messages/conversations/${conversationId}/ai-settings`,
        {
          customName: nameToSave,
          relationship: relToSave,
          languagePref,
        },
      );

      if (res.data?.success) {
        showToast("AI Companion updated!", "success");
        if (onSaved) {
          onSaved(res.data.customAiSettings);
        }
        onClose();
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update settings",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[styles.card, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Customize AI Companion</Text>
                <Text style={styles.headerSubtitle}>
                  Personalize your AI friend's persona, name & language
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form Scroll Area */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Name */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NAME YOUR AI FRIEND</Text>
              <Text style={styles.sectionDesc}>
                Give your companion a real name you like (e.g. Emma, Maya, Alex,
                Buddy).
              </Text>
              <TextInput
                style={styles.input}
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. Emma, Maya, Alex"
                placeholderTextColor={colors.textSecondary}
                maxLength={40}
              />
            </View>

            {/* 2. Relationship / Persona */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RELATIONSHIP & PERSONA</Text>
              <Text style={styles.sectionDesc}>
                Choose how your companion interacts with you:
              </Text>

              <View style={styles.presetsGrid}>
                {RELATIONSHIP_PRESETS.map((p) => {
                  const isSelected =
                    !isCustomRel && relationship.toLowerCase() === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.presetCard,
                        isSelected && styles.presetCardSelected,
                      ]}
                      onPress={() => {
                        setRelationship(p.id);
                        setIsCustomRel(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cardTopRow}>
                        <Text
                          style={[
                            styles.presetLabel,
                            isSelected && styles.presetLabelSelected,
                          ]}
                        >
                          {p.label}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.accent}
                          />
                        )}
                      </View>
                      <Text style={styles.presetDesc}>{p.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Persona Toggle */}
              <TouchableOpacity
                onPress={() => setIsCustomRel(!isCustomRel)}
                style={styles.customToggleBtn}
              >
                <Text style={styles.customToggleText}>
                  {isCustomRel
                    ? "✓ Using custom relationship"
                    : "+ Define custom relationship / persona"}
                </Text>
              </TouchableOpacity>
              {isCustomRel && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="e.g. Caring older sister, late-night philosopher"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={50}
                />
              )}
            </View>

            {/* 3. Language Preference */}
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Ionicons
                  name="globe-outline"
                  size={14}
                  color={colors.accent}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.sectionLabel}>LANGUAGE PREFERENCE</Text>
              </View>

              <View style={styles.presetsGrid}>
                {LANGUAGE_OPTIONS.map((l) => {
                  const isSelected = languagePref === l.id;
                  return (
                    <TouchableOpacity
                      key={l.id}
                      style={[
                        styles.presetCard,
                        isSelected && styles.presetCardSelected,
                      ]}
                      onPress={() => setLanguagePref(l.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cardTopRow}>
                        <Text
                          style={[
                            styles.presetLabel,
                            isSelected && styles.presetLabelSelected,
                          ]}
                        >
                          {l.label}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.accent}
                          />
                        )}
                      </View>
                      <Text style={styles.presetDesc}>{l.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons
                    name="sparkles"
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.saveBtnText}>Save Settings</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: colors.surface || "#16181c",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border || "#2f3336",
    maxHeight: "90%",
    display: "flex",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || "#2f3336",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  sparkleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0, 166, 244, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(0, 166, 244, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    color: colors.text || "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: colors.textSecondary || "#71767b",
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionLabel: {
    color: colors.textSecondary || "#71767b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  sectionDesc: {
    color: colors.textSecondary || "#71767b",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.elevated || "#202327",
    borderWidth: 1,
    borderColor: colors.border || "#2f3336",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text || "#ffffff",
    fontSize: 14,
  },
  presetsGrid: {
    gap: 8,
  },
  presetCard: {
    backgroundColor: colors.elevated || "#202327",
    borderWidth: 1,
    borderColor: colors.border || "#2f3336",
    borderRadius: 16,
    padding: 12,
  },
  presetCardSelected: {
    borderColor: colors.accent || "#00A6F4",
    backgroundColor: "rgba(0, 166, 244, 0.12)",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  presetLabel: {
    color: colors.text || "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  presetLabelSelected: {
    color: colors.accent || "#00A6F4",
  },
  presetDesc: {
    color: colors.textSecondary || "#71767b",
    fontSize: 11,
    lineHeight: 16,
  },
  customToggleBtn: {
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  customToggleText: {
    color: colors.accent || "#00A6F4",
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border || "#2f3336",
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: colors.textSecondary || "#71767b",
    fontSize: 13,
    fontWeight: "600",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent || "#00A6F4",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default AiSettingsModal;
