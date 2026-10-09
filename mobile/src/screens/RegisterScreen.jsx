import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import colors from '../theme/colors';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { ClearfeedLogo } from '../components/TwitterIcons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('Thinking, building, and exploring code.');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow photo library access to choose a profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4, // Downscale to keep file size lightweight under 100KB
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setAvatarBase64(`data:image/jpeg;base64,${asset.base64}`);
        showToast('Profile photo selected!', 'success');
      }
    } catch {
      showToast('Could not load selected image', 'error');
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        bio: bio.trim(),
      };

      if (avatarBase64) {
        payload.avatarBase64 = avatarBase64;
      }

      await register(payload);
      showToast('Account created! Welcome to Clearfeed.', 'success');
    } catch (err) {
      showToast(err.data?.message || err.message || 'Registration failed', 'error');
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
        {/* Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <ClearfeedLogo size={24} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.brandText}>Clear<Text style={{ color: colors.accent }}>feed</Text></Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Join the chronological social learning network for students & engineers.
          </Text>

          {/* Avatar Picker Circle */}
          <View style={styles.avatarPickerWrapper}>
            <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarTouch}>
              <Avatar src={avatarUri} name={name || 'U'} size="xl" />
              <View style={styles.avatarCameraBadge}>
                <Ionicons name="camera" size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Upload profile photo (optional)</Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Nasir Yousuf"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>USERNAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. nasir"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={(t) => setUsername(t.replace(/[^a-zA-Z0-9_]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. student@clearfeed.edu"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD * (MIN 6 CHARS)</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>BIO / INTERESTS</Text>
            <TextInput
              style={[styles.input, { height: 72, textAlignVertical: 'top', paddingTop: 8 }]}
              placeholder="What are you building or studying?"
              placeholderTextColor={colors.textSecondary}
              value={bio}
              onChangeText={setBio}
              multiline={true}
              maxLength={160}
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleRegister}
            isLoading={loading}
            style={styles.submitBtn}
          >
            Create Account
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={{ color: colors.accent, fontWeight: '700' }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  formContainer: {
    marginTop: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 20,
  },
  avatarPickerWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarTouch: {
    position: 'relative',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
    color: colors.text,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  eyeBtn: {
    paddingHorizontal: 12,
  },
  submitBtn: {
    marginTop: 10,
    borderRadius: 24,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default RegisterScreen;
