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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getBaseUrl, setBaseUrl } from '../api/client';
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

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await loginGuest();
      showToast('Welcome! Browsing as Guest.', 'success');
    } catch (err) {
      showToast(err.message || 'Guest login failed.', 'error');
    } finally {
      setLoading(false);
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
                : "Don't have an account? Create one with photo & bio"}
            </Text>
          </TouchableOpacity>

          {/* Guest Explorer Login */}
          <View style={styles.demoSection}>
            <TouchableOpacity
              onPress={handleGuestLogin}
              style={[styles.demoBtn, { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }]}
              disabled={loading}
            >
              <Text style={[styles.demoBtnName, { color: colors.primary, fontSize: 14 }]}>Continue as Guest</Text>
              <Text style={[styles.demoBtnRole, { marginTop: 2 }]}>Explore without an account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backend Host Configurator */}
        <TouchableOpacity
          onPress={() => setShowConfig(!showConfig)}
          style={styles.configToggle}
        >
          <Ionicons name="settings-outline" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.configToggleText}>Server Connection</Text>
          <Ionicons name={showConfig ? "chevron-up" : "chevron-down"} size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {showConfig && (
          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Backend API Base URL:</Text>
            <TextInput
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.X:5180/api"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              style={styles.configInput}
            />
            <Button variant="secondary" size="sm" onPress={handleSaveUrl}>
              Save Server URL
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
  switchAuthBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchAuthText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  demoBtnName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  demoBtnRole: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
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
});

export default LoginScreen;
