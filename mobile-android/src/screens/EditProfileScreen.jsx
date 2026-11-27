/**
 * Clearfeed Edit Profile Screen
 * Allows editing bio, display name, status line, website/github links, and avatar image picking.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api, { resolveAvatarUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/Avatar';
import Button from '../components/Button';

export const EditProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [github, setGithub] = useState(user?.github || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);
  const [coverUri, setCoverUri] = useState(user?.coverUrl || null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handlePickCover = async () => {
    try {
      const { status: permissionStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to upload a cover image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.55,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingCover(true);
        const base64Data = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;

        const res = await api.patch('/users/profile', { coverBase64: base64Data });
        if (res.data?.user) {
          updateUser(res.data.user);
          setCoverUri(res.data.user.coverUrl || base64Data);
          showToast('Cover image updated successfully', 'success');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update cover image', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const { status: permissionStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to upload an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingAvatar(true);

        const base64Data = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;

        // Upload avatar
        const res = await api.patch('/users/profile', { avatarUrl: base64Data });
        if (res.data?.user) {
          updateUser(res.data.user);
          setAvatarUri(res.data.user.avatarUrl);
          showToast('Avatar updated successfully', 'success');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch('/users/profile', {
        name: name.trim(),
        bio: bio.trim(),
        status: status.trim(),
        website: website.trim(),
        github: github.trim(),
      });

      if (res.data?.user) {
        updateUser(res.data.user);
      }
      showToast('Profile updated', 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Button
          title={saving ? 'Saving...' : 'Save'}
          variant="primary"
          size="sm"
          onPress={handleSave}
          disabled={saving}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover Section */}
        <TouchableOpacity onPress={handlePickCover} activeOpacity={0.85} style={styles.coverWrapper}>
          {coverUri ? (
            <Image source={{ uri: resolveAvatarUrl(coverUri) }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image-outline" size={24} color="#64748B" />
              <Text style={styles.coverHint}>Tap to add cover image</Text>
            </View>
          )}
          <View style={styles.coverOverlay}>
            {uploadingCover ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
            <Avatar uri={avatarUri} name={name} size={90} />
            <View style={styles.avatarOverlay}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={22} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change avatar</Text>
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#64748B"
            maxLength={50}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>STATUS LINE</Text>
          <TextInput
            style={styles.input}
            value={status}
            onChangeText={setStatus}
            placeholder="e.g. Building distributed systems"
            placeholderTextColor="#64748B"
            maxLength={80}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>BIO</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community about yourself..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            maxLength={280}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>WEBSITE / PORTFOLIO</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="https://..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>GITHUB USERNAME</Text>
          <TextInput
            style={styles.input}
            value={github}
            onChangeText={setGithub}
            placeholder="octocat"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  coverWrapper: {
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 18,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coverHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  coverOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 6,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: 45,
    overflow: 'hidden',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    fontSize: 12,
    color: '#14B8A6',
    marginTop: 8,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  bioInput: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});

export default EditProfileScreen;
