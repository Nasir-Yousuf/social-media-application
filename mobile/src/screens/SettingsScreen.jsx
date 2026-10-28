import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import Avatar from "../components/Avatar";
import { getBaseUrl, setBaseUrl, CLOUD_URL, LOCAL_DEV_URL } from "../api/client";
import socketService from "../services/socket";

const THEME_ICONS = {
  dark: { name: "moon", library: Ionicons },
  dim: { name: "cloudy-night", library: Ionicons },
  light: { name: "sunny", library: Ionicons },
  emerald: { name: "code-working", library: Ionicons },
  sunset: { name: "partly-sunny", library: Ionicons },
  hacker: { name: "terminal", library: Ionicons },
};

export const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, themes, setTheme, colors: currentColors } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useNotifications();

  const [serverUrl, setServerUrl] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [socketConnected, setSocketConnected] = useState(socketService.isConnected);

  useEffect(() => {
    getBaseUrl().then((url) => {
      setServerUrl(url);
      setCustomInput(url);
    });

    const interval = setInterval(() => {
      setSocketConnected(socketService.isConnected);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectServer = async (targetUrl) => {
    try {
      await setBaseUrl(targetUrl);
      setServerUrl(targetUrl);
      setCustomInput(targetUrl);
      setShowCustomInput(false);
      showToast(
        targetUrl.includes('railway')
          ? '☁️ Switched to Cloud (Railway)'
          : '💻 Switched to Local server',
        'success'
      );
    } catch {
      showToast('Failed to switch server', 'error');
    }
  };

  const handleSaveCustom = async () => {
    if (!customInput.trim()) return;
    try {
      await setBaseUrl(customInput.trim());
      setServerUrl(customInput.trim());
      setShowCustomInput(false);
      showToast('Custom server saved & connected', 'success');
    } catch {
      showToast('Failed to save server', 'error');
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out of Clearfeed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: currentColors.bg },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: currentColors.border,
            backgroundColor: currentColors.bg,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>
            Settings
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentColors.textSecondary },
            ]}
          >
            Display & theme preferences
          </Text>
        </View>
        <Ionicons
          name="settings-sharp"
          size={24}
          color={currentColors.accent}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info Pill */}
        {user && (
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              },
            ]}
          >
            <Avatar src={user.avatarUrl} name={user.name} size="md" />
            <TouchableOpacity
              style={styles.userInfo}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("Profile", {
                  username: user.username,
                  userId: user._id,
                })
              }
            >
              <Text style={[styles.userName, { color: currentColors.text }]}>
                {user.name}
              </Text>
              <Text
                style={[
                  styles.userHandle,
                  { color: currentColors.textSecondary },
                ]}
              >
                @{user.username}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profileBtn, { borderColor: currentColors.border }]}
              onPress={() =>
                navigation.navigate("Profile", {
                  username: user.username,
                  userId: user._id,
                })
              }
            >
              <Text
                style={[styles.profileBtnText, { color: currentColors.accent }]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Ionicons
            name="color-palette-outline"
            size={18}
            color={currentColors.accent}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Display & Themes
          </Text>
        </View>
        <Text
          style={[
            styles.sectionSubtitle,
            { color: currentColors.textSecondary },
          ]}
        >
          Personalize your Clearfeed appearance. Saved automatically across
          devices.
        </Text>

        {/* Live Preview Post Box */}
        <View
          style={[
            styles.previewBox,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <View style={styles.previewHeader}>
            <Avatar name="Clearfeed" size="sm" showRoleBadge={false} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={[styles.previewAuthor, { color: currentColors.text }]}
                >
                  Clearfeed
                </Text>
                <Text
                  style={[
                    styles.previewHandle,
                    { color: currentColors.textSecondary },
                  ]}
                >
                  {" "}
                  · preview
                </Text>
              </View>
              <Text style={[styles.previewBody, { color: currentColors.text }]}>
                A modern chronological platform for developers and learners.
                Selected theme updates instantly!
              </Text>
              <Text
                style={[styles.previewTag, { color: currentColors.accent }]}
              >
                #cleanarchitecture #pulse518
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Cards Grid */}
        <View style={styles.themesList}>
          {themes.map((t) => {
            const isSelected = theme === t.id;
            const iconConfig = THEME_ICONS[t.id] || {
              name: "color-palette",
              library: Ionicons,
            };
            const IconComp = iconConfig.library;

            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: t.bg,
                    borderColor: isSelected ? t.accent : t.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  setTheme(t.id);
                  showToast(`Theme switched to ${t.name}`, "success");
                }}
                activeOpacity={0.85}
              >
                <View style={styles.themeLeft}>
                  <View
                    style={[
                      styles.themeIconBox,
                      {
                        backgroundColor: t.surface,
                        borderColor: t.border,
                      },
                    ]}
                  >
                    <IconComp
                      name={iconConfig.name}
                      size={18}
                      color={t.accent}
                    />
                  </View>

                  <View style={styles.themeMeta}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={[styles.themeName, { color: t.text }]}>
                        {t.name}
                      </Text>
                      <View
                        style={[
                          styles.themeBadge,
                          {
                            backgroundColor: t.surface,
                            borderColor: t.border,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.themeBadgeText, { color: t.accent }]}
                        >
                          {t.badge}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.themeSubtitle, { color: t.textSecondary }]}
                    >
                      {t.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Radio Selection Dot */}
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: isSelected ? t.accent : t.border,
                      backgroundColor: isSelected ? t.accent : "transparent",
                    },
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={13} color="#ffffff" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clearfeed Mesh Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="transit-connection-variant"
            size={18}
            color="#00ba7c"
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Clearfeed Mesh
          </Text>
        </View>
        <Text
          style={[
            styles.sectionSubtitle,
            { color: currentColors.textSecondary },
          ]}
        >
          Connect nearby. Communicate offline.
        </Text>

        <TouchableOpacity
          style={[
            styles.meshCard,
            {
              backgroundColor: currentColors.surface,
              borderColor: 'rgba(0, 186, 124, 0.35)',
            },
          ]}
          onPress={() => navigation.navigate('MeshHome')}
          activeOpacity={0.8}
        >
          <View style={styles.meshCardLeft}>
            <View style={styles.meshIconCircle}>
              <Ionicons name="radio" size={20} color="#00ba7c" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.meshCardTitle, { color: currentColors.text }]}>
                Mesh Chat (Offline)
              </Text>
              <Text
                style={[
                  styles.meshCardSubtitle,
                  { color: currentColors.textSecondary },
                ]}
              >
                Local peer discovery & end-to-end encrypted messaging without internet
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#00ba7c" />
        </TouchableOpacity>

        {/* Server & Network Connectivity Card */}
        <View
          style={[
            styles.serverCard,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <View style={styles.serverCardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
              <Ionicons
                name="cloud-outline"
                size={18}
                color={currentColors.accent}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[styles.serverCardTitle, { color: currentColors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Backend Server & Calling
              </Text>
            </View>
            <View
              style={[
                styles.socketBadge,
                {
                  backgroundColor: socketConnected ? "rgba(0,186,124,0.15)" : "rgba(239,68,68,0.15)",
                },
              ]}
            >
              <View
                style={[
                  styles.socketDot,
                  { backgroundColor: socketConnected ? "#00ba7c" : "#ef4444" },
                ]}
              />
              <Text
                style={[
                  styles.socketBadgeText,
                  { color: socketConnected ? "#00ba7c" : "#ef4444" },
                ]}
              >
                {socketConnected ? "Online" : "Connecting..."}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.serverCardSubtitle,
              { color: currentColors.textSecondary },
            ]}
          >
            Connected to:{" "}
            <Text style={{ fontWeight: "700", color: currentColors.text }}>
              {serverUrl.includes("railway") ? "☁️ Railway Cloud" : "💻 Local LAN"}
            </Text>
          </Text>
          <View
            style={[
              styles.serverUrlBox,
              {
                backgroundColor: currentColors.bg,
                borderColor: currentColors.borderLight || currentColors.border,
              },
            ]}
          >
            <Text
              style={[styles.serverUrlText, { color: currentColors.textSecondary }]}
              numberOfLines={2}
            >
              {serverUrl}
            </Text>
          </View>

          {/* Quick Preset Buttons */}
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: serverUrl.includes("railway")
                    ? currentColors.accent
                    : currentColors.elevated,
                  borderColor: serverUrl.includes("railway")
                    ? currentColors.accent
                    : currentColors.border,
                },
              ]}
              onPress={() =>
                handleSelectServer(CLOUD_URL)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.presetChipText,
                  {
                    color: serverUrl.includes("railway") ? "#ffffff" : currentColors.text,
                    fontWeight: serverUrl.includes("railway") ? "800" : "600",
                  },
                ]}
              >
                ☁️ Railway Cloud
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: (serverUrl.includes("192.168.") || serverUrl.includes("localhost"))
                    ? currentColors.accent
                    : currentColors.elevated,
                  borderColor: (serverUrl.includes("192.168.") || serverUrl.includes("localhost"))
                    ? currentColors.accent
                    : currentColors.border,
                },
              ]}
              onPress={() =>
                handleSelectServer(LOCAL_DEV_URL)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.presetChipText,
                  {
                    color: serverUrl.includes("192.168.") ? "#ffffff" : currentColors.text,
                    fontWeight: serverUrl.includes("192.168.") ? "800" : "600",
                  },
                ]}
              >
                💻 Local Wi-Fi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: showCustomInput
                    ? currentColors.accent
                    : currentColors.elevated,
                  borderColor: showCustomInput
                    ? currentColors.accent
                    : currentColors.border,
                },
              ]}
              onPress={() => setShowCustomInput(!showCustomInput)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.presetChipText,
                  {
                    color: showCustomInput ? "#ffffff" : currentColors.text,
                    fontWeight: showCustomInput ? "800" : "600",
                  },
                ]}
              >
                ✏️ Custom
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomInput && (
            <View style={{ marginTop: 10 }}>
              <TextInput
                value={customInput}
                onChangeText={setCustomInput}
                placeholder="https://your-api.up.railway.app/api"
                placeholderTextColor={currentColors.textSecondary}
                style={[
                  styles.customInput,
                  {
                    color: currentColors.text,
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.bg,
                  },
                ]}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.customSaveBtn, { backgroundColor: currentColors.accent }]}
                onPress={handleSaveCustom}
              >
                <Text style={styles.customSaveBtnText}>Save & Connect</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* App Info & Logout Section */}
        <View
          style={[
            styles.footerSection,
            { borderTopColor: currentColors.border },
          ]}
        >
          <Text
            style={[styles.footerText, { color: currentColors.textSecondary }]}
          >
            Clearfeed v2.4 · Pulse CS518 Architecture
          </Text>

          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: "#f4212e" }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons
              name="log-out-outline"
              size={16}
              color="#f4212e"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.logoutBtnText}>Log out of Clearfeed</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
  },
  userHandle: {
    fontSize: 12,
    marginTop: 1,
  },
  profileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  profileBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  previewBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: "row",
  },
  previewAuthor: {
    fontSize: 13,
    fontWeight: "800",
  },
  previewHandle: {
    fontSize: 12,
  },
  previewBody: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  previewTag: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  themesList: {
    marginBottom: 16,
  },
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  themeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  themeMeta: {
    marginLeft: 12,
    flex: 1,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "800",
  },
  themeBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  themeBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },
  themeSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  meshCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  meshCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  meshIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 186, 124, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  meshCardTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  meshCardSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  footerSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    width: "100%",
  },
  logoutBtnText: {
    color: "#f4212e",
    fontSize: 13,
    fontWeight: "700",
  },
  serverCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  serverCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  serverCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    flexShrink: 1,
  },
  serverCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  serverUrlBox: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  serverUrlText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  socketBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexShrink: 0,
  },
  socketDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  socketBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  presetChip: {
    flexGrow: 1,
    flexBasis: "28%",
    minWidth: 95,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipText: {
    fontSize: 11,
    textAlign: "center",
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 8,
  },
  customSaveBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  customSaveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default SettingsScreen;
