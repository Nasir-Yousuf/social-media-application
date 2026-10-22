import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
            <View style={styles.userInfo}>
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
            </View>
            <TouchableOpacity
              style={[styles.profileBtn, { borderColor: currentColors.border }]}
              onPress={() =>
                navigation.navigate("Profile", { userId: user._id })
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
});

export default SettingsScreen;
