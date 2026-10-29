import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getBaseUrl, setBaseUrl, CLOUD_URL, LOCAL_DEV_URL } from '../api/client';
import { ClearfeedLogo, VerifiedBadge } from '../components/TwitterIcons';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, register, loginGuest } = useAuth();
  const { showToast } = useNotifications();

  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [guestLoading, setGuestLoading] = useState(false);

  // Configurable backend URL state
  const [showConfig, setShowConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    getBaseUrl().then(setServerUrl);
  }, []);

  const handleSaveUrl = async () => {
    if (!serverUrl.trim()) return;
    await setBaseUrl(serverUrl.trim());
    showToast('API URL saved', 'success');
    setShowConfig(false);
  };

  const handleSelectPreset = async (url) => {
    setServerUrl(url);
    await setBaseUrl(url);
    showToast(`Connected to: ${url.includes('railway') ? 'Cloud (Vercel/Railway)' : 'Local PC'}`, 'success');
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      await loginGuest();
      showToast('Welcome! Browsing as Guest.', 'success');
    } catch (err) {
      showToast(err.data?.message || err.message || 'Guest login failed.', 'error');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim() || !username.trim() || !email.trim() || !password) {
          showToast('Please fill all fields', 'error');
          setLoading(false);
          return;
        }
        await register({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        });
        showToast('Account created successfully!', 'success');
      } else {
        if (!emailOrUsername.trim() || !password) {
          showToast('Please enter username/email and password', 'error');
          setLoading(false);
          return;
        }
        await login(emailOrUsername.trim(), password);
        showToast('Logged in successfully', 'success');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <ClearfeedLogo size={46} style={{ marginBottom: 10 }} />
          <Text style={styles.brandTitle}>
            Clear<Text style={{ color: colors.accent }}>feed</Text>
          </Text>
          <Text style={styles.brandTagline}>
            The Anti-Algorithm Minimalist Social Network
          </Text>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {isRegister ? 'Create your account' : 'Sign in to Clearfeed'}
          </Text>

          {isRegister ? (
            <>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                placeholder="Username (e.g., alice_dev)"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={styles.input}
              />
              <TextInput
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <TextInput
                placeholder="Password (min 6 characters)"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </>
          ) : (
            <>
              <TextInput
                placeholder="Email or Username"
                placeholderTextColor={colors.textSecondary}
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                autoCapitalize="none"
                style={styles.input}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </>
          )}

          <Button
            variant="primary"
            size="md"
            onPress={handleSubmit}
            isLoading={loading}
            style={styles.submitBtn}
          >
            {isRegister ? 'Sign Up' : 'Log In'}
          </Button>

          {/* Elegant Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue as Guest Button (Modern Pill with Compass Icon) */}
          <TouchableOpacity
            onPress={handleGuestLogin}
            disabled={guestLoading || loading}
            activeOpacity={0.8}
            style={[
              styles.guestBtn,
              (guestLoading || loading) && styles.guestBtnDisabled,
            ]}
          >
            {guestLoading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="compass" size={19} color={colors.accent} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.guestBtnText}>
              {guestLoading ? 'Entering as Guest...' : 'Continue as Guest'}
            </Text>
          </TouchableOpacity>

          {/* Standalone Offline Mesh Chat Entry (No server or login needed) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MeshHome')}
            activeOpacity={0.8}
            style={styles.meshBtn}
          >
            <Ionicons name="radio" size={18} color="#00ba7c" style={{ marginRight: 8 }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.meshBtnText}>Open Mesh Chat (Offline)</Text>
              <Text style={styles.meshBtnSubtext}>Connect nearby without internet or account</Text>
            </View>
          </TouchableOpacity>



          {/* Toggle Login / Register */}
          <TouchableOpacity
            onPress={() => {
              if (navigation?.navigate) {
                navigation.navigate('Register');
              } else {
                setIsRegister(!isRegister);
              }
            }}
            style={styles.switchAuthBtn}
          >
            <Text style={styles.switchAuthText}>
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? "}
              {!isRegister && <Text style={styles.switchAuthHighlight}>Create one</Text>}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Backend Host Configurator */}
        <TouchableOpacity
          onPress={() => setShowConfig(!showConfig)}
          style={styles.configToggle}
        >
          <Ionicons name="settings-outline" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.configToggleText}>
            Server Connection ({serverUrl.includes('railway') ? '☁️ Cloud' : serverUrl.includes('10.0.2.2') ? '📱 Emulator' : '💻 Local'})
          </Text>
          <Ionicons name={showConfig ? "chevron-up" : "chevron-down"} size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {showConfig && (
          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Select Target Server:</Text>
            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  serverUrl.includes('railway') && styles.presetBtnActive,
                ]}
                onPress={() => handleSelectPreset(CLOUD_URL)}
              >
                <Text style={styles.presetBtnText}>☁️ Cloud</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  (serverUrl.includes('192.168.') || serverUrl.includes('localhost')) && styles.presetBtnActive,
                ]}
                onPress={() => handleSelectPreset(LOCAL_DEV_URL)}
              >
                <Text style={styles.presetBtnText}>💻 Phone Wi-Fi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  serverUrl.includes('10.0.2.2') && styles.presetBtnActive,
                ]}
                onPress={() => handleSelectPreset('http://10.0.2.2:5180/api')}
              >
                <Text style={styles.presetBtnText}>📱 Emulator</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.configLabel, { marginTop: 8 }]}>Custom API Base URL:</Text>
            <TextInput
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              style={styles.configInput}
            />
            <Button variant="secondary" size="sm" onPress={handleSaveUrl}>
              Save Custom URL
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoDot: {
    color: colors.accent,
    fontSize: 16,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandTagline: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 4,
    paddingVertical: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 12,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  guestBtnDisabled: {
    opacity: 0.6,
  },
  guestBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  meshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 186, 124, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 186, 124, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  meshBtnText: {
    color: '#00ba7c',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  meshBtnSubtext: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  switchAuthBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchAuthText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  switchAuthHighlight: {
    color: colors.accent,
    fontWeight: '700',
  },
  configToggle: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  configToggleText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  configCard: {
    marginTop: 10,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  configLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  configInput: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },

  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(29, 155, 240, 0.15)',
  },
  presetBtnText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default LoginScreen;
