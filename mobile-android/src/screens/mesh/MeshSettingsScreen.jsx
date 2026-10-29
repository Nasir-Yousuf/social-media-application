import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useMesh } from '../../mesh/context/MeshContext';
import { CFM_MAGIC, CFM_VERSION } from '../../mesh/protocol/wireProtocol';

export const MeshSettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: currentColors } = useTheme();
  const {
    identity,
    settings,
    updateNickname,
    updateSettings,
    resetIdentity,
    clearAllData,
  } = useMesh();

  const [editingNick, setEditingNick] = useState(false);
  const [nickInput, setNickInput] = useState(identity?.nickname || '');

  const handleSaveNickname = async () => {
    if (!nickInput.trim()) return;
    await updateNickname(nickInput.trim());
    setEditingNick(false);
  };

  const handleResetIdentity = () => {
    Alert.alert(
      'Reset Local Mesh Identity?',
      'Warning: Generating a new cryptographic identity will prevent earlier encrypted conversations from being decrypted, and your nearby contacts will see your key change. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Identity',
          style: 'destructive',
          onPress: async () => {
            const fresh = await resetIdentity();
            setNickInput(fresh.nickname);
            Alert.alert('Identity Reset', 'New cryptographic keypair created successfully.');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear Local Mesh Data?',
      'This will delete all locally stored offline messages, peer lists, and relay queues on this device. Your online Clearfeed account will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Data Cleared', 'Local Mesh storage has been purged.');
          },
        },
      ]
    );
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
            backgroundColor: currentColors.surface,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>
            Mesh Settings
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentColors.textSecondary },
            ]}
          >
            Offline identity, routing & storage
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Section */}
        <Text
          style={[styles.sectionHeading, { color: currentColors.textSecondary }]}
        >
          LOCAL CRYPTOGRAPHIC IDENTITY
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                Display Nickname
              </Text>
              {editingNick ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={[
                      styles.nickInput,
                      {
                        backgroundColor: currentColors.bg,
                        borderColor: currentColors.border,
                        color: currentColors.text,
                      },
                    ]}
                    value={nickInput}
                    onChangeText={setNickInput}
                  />
                  <TouchableOpacity
                    style={[styles.saveNickBtn, { backgroundColor: '#00ba7c' }]}
                    onPress={handleSaveNickname}
                  >
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text
                  style={[
                    styles.rowValue,
                    { color: currentColors.textSecondary },
                  ]}
                >
                  {identity?.nickname || 'MeshNode'}
                </Text>
              )}
            </View>
            {!editingNick && (
              <TouchableOpacity
                onPress={() => {
                  setNickInput(identity?.nickname || '');
                  setEditingNick(true);
                }}
                style={styles.editBtn}
              >
                <Feather name="edit-2" size={16} color="#00ba7c" />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[styles.divider, { backgroundColor: currentColors.border }]}
          />

          <View style={styles.fingerprintSection}>
            <Text
              style={[
                styles.fingerprintHeading,
                { color: currentColors.textSecondary },
              ]}
            >
              Public Key Fingerprint (Ed25519)
            </Text>
            <Text style={styles.fingerprintCode}>
              {identity?.fingerprint}
            </Text>
          </View>
        </View>

        {/* Network & Routing Section */}
        <Text
          style={[styles.sectionHeading, { color: currentColors.textSecondary }]}
        >
          MESH NETWORKING & RELAY
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                Enable Mesh Chat
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  { color: currentColors.textSecondary },
                ]}
              >
                Allows your phone to discover and exchange messages with nearby compatible devices.
              </Text>
            </View>
            <Switch
              value={settings.meshEnabled}
              onValueChange={(val) => updateSettings({ meshEnabled: val })}
              trackColor={{ false: '#71767b', true: '#00ba7c' }}
            />
          </View>

          <View
            style={[styles.divider, { backgroundColor: currentColors.border }]}
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                Participate in Multi-Hop Relay
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  { color: currentColors.textSecondary },
                ]}
              >
                Forwards encrypted packets for intermediate nodes. Relays cannot decrypt message contents.
              </Text>
            </View>
            <Switch
              value={settings.relayEnabled}
              onValueChange={(val) => updateSettings({ relayEnabled: val })}
              trackColor={{ false: '#71767b', true: '#00ba7c' }}
            />
          </View>

          <View
            style={[styles.divider, { backgroundColor: currentColors.border }]}
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                Battery-Saving Mode
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  { color: currentColors.textSecondary },
                ]}
              >
                Reduces background scan frequencies to conserve device battery.
              </Text>
            </View>
            <Switch
              value={settings.batterySaving}
              onValueChange={(val) => updateSettings({ batterySaving: val })}
              trackColor={{ false: '#71767b', true: '#00ba7c' }}
            />
          </View>
        </View>

        {/* Diagnostics & Specifications */}
        <Text
          style={[styles.sectionHeading, { color: currentColors.textSecondary }]}
        >
          DIAGNOSTICS & PROTOCOL SPEC
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <View style={styles.diagRow}>
            <Text
              style={[styles.diagLabel, { color: currentColors.textSecondary }]}
            >
              Wire Protocol
            </Text>
            <Text style={[styles.diagVal, { color: currentColors.text }]}>
              {CFM_MAGIC} (v{CFM_VERSION})
            </Text>
          </View>
          <View style={styles.diagRow}>
            <Text
              style={[styles.diagLabel, { color: currentColors.textSecondary }]}
            >
              Identity & Signatures
            </Text>
            <Text style={[styles.diagVal, { color: currentColors.text }]}>
              Ed25519 (256-bit)
            </Text>
          </View>
          <View style={styles.diagRow}>
            <Text
              style={[styles.diagLabel, { color: currentColors.textSecondary }]}
            >
              Key Agreement & Cipher
            </Text>
            <Text style={[styles.diagVal, { color: currentColors.text }]}>
              X25519 + ChaCha20-Poly1305
            </Text>
          </View>
          <View style={styles.diagRow}>
            <Text
              style={[styles.diagLabel, { color: currentColors.textSecondary }]}
            >
              Max Hop TTL
            </Text>
            <Text style={[styles.diagVal, { color: currentColors.text }]}>
              5 Hops (Configurable)
            </Text>
          </View>
        </View>

        {/* Danger Zone */}
        <Text
          style={[styles.sectionHeading, { color: currentColors.textSecondary }]}
        >
          DATA MANAGEMENT
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dangerActionRow}
            onPress={handleResetIdentity}
          >
            <Ionicons name="refresh" size={20} color="#ffd700" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.dangerLabel, { color: '#ffd700' }]}>
                Reset Local Identity
              </Text>
              <Text
                style={[
                  styles.dangerSub,
                  { color: currentColors.textSecondary },
                ]}
              >
                Generates a fresh cryptographic keypair.
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={[styles.divider, { backgroundColor: currentColors.border }]}
          />

          <TouchableOpacity
            style={styles.dangerActionRow}
            onPress={handleClearAllData}
          >
            <Ionicons name="trash-outline" size={20} color="#f4212e" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.dangerLabel, { color: '#f4212e' }]}>
                Clear Local Mesh Data
              </Text>
              <Text
                style={[
                  styles.dangerSub,
                  { color: currentColors.textSecondary },
                ]}
              >
                Wipes stored offline conversations and relay cache.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  rowValue: { fontSize: 13, marginTop: 2 },
  editBtn: { padding: 6 },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  nickInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 13,
    flex: 1,
  },
  saveNickBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: { height: 1, marginVertical: 14 },
  fingerprintSection: {},
  fingerprintHeading: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  fingerprintCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#00ba7c',
    letterSpacing: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowSubtitle: { fontSize: 12, lineHeight: 16, marginTop: 3 },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  diagLabel: { fontSize: 12 },
  diagVal: { fontSize: 12, fontWeight: '700' },
  dangerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerLabel: { fontSize: 14, fontWeight: '800' },
  dangerSub: { fontSize: 11, marginTop: 2 },
});

export default MeshSettingsScreen;
