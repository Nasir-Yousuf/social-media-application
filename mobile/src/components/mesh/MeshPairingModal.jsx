import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'qrcode';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { computeFingerprint } from '../../mesh/crypto/meshCrypto';

export const MeshPairingModal = ({
  visible,
  onClose,
  onConnect,
  identity,
}) => {
  const { colors: currentColors } = useTheme();
  const [activeTab, setActiveTab] = useState('my_qr'); // 'my_qr' | 'manual'
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Manual input state
  const [inputVal, setInputVal] = useState('');
  const [nickVal, setNickVal] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  // Parse QR or direct payload
  const parsePeerString = (raw) => {
    if (!raw) return null;
    const trimmed = raw.trim();

    // Case 1: cfm1://peer?pk=<64hex>&nick=<name>
    if (trimmed.startsWith('cfm1://')) {
      try {
        const dummyUrl = trimmed.replace('cfm1://', 'http://cfm1/');
        const url = new URL(dummyUrl);
        const pk = url.searchParams.get('pk') || '';
        const nick = url.searchParams.get('nick') || undefined;
        if (/^[a-fA-F0-9]{64}$/.test(pk)) {
          return { pubkey: pk.toLowerCase(), nickname: nick };
        }
      } catch {}
    }

    // Case 2: Plain 64-hex string
    if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
      return { pubkey: trimmed.toLowerCase() };
    }

    return null;
  };

  // Generate QR code base64 image on open or identity change
  useEffect(() => {
    if (!visible || !identity?.publicKeyHex) return;

    let isMounted = true;
    setLoadingQr(true);

    const payload = `cfm1://peer?pk=${identity.publicKeyHex}&nick=${encodeURIComponent(
      identity.nickname || 'Peer'
    )}`;

    QRCode.toDataURL(payload, {
      margin: 2,
      width: 256,
      color: {
        dark: '#052e16', // Deep emerald
        light: '#ecfdf5', // Soft emerald tint
      },
    })
      .then((dataUrl) => {
        if (isMounted) {
          setQrDataUrl(dataUrl);
          setLoadingQr(false);
        }
      })
      .catch((err) => {
        console.warn('[MeshPairing] QR Generation error:', err);
        if (isMounted) setLoadingQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, identity]);

  const handleCopyLink = async () => {
    if (!identity) return;
    const link = `cfm1://peer?pk=${identity.publicKeyHex}&nick=${encodeURIComponent(
      identity.nickname || 'Peer'
    )}`;
    await Clipboard.setStringAsync(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyKey = async () => {
    if (!identity) return;
    await Clipboard.setStringAsync(identity.publicKeyHex);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setInputVal(text.trim());
      }
    } catch {}
  };

  const handleManualConnect = () => {
    setErrorMessage(null);
    const parsed = parsePeerString(inputVal);
    if (!parsed) {
      setErrorMessage(
        'Please enter a valid cfm1:// link or 64-character hex public key.'
      );
      return;
    }

    const peer = {
      publicKeyHex: parsed.pubkey,
      nickname:
        nickVal.trim() ||
        parsed.nickname ||
        `Peer_${parsed.pubkey.substring(0, 6)}`,
      status: 'discovered',
      fingerprint: computeFingerprint(parsed.pubkey),
      lastSeen: Date.now(),
      reachability: 'direct',
      hops: 0,
    };

    onConnect(peer);
    onClose();
    setInputVal('');
    setNickVal('');
  };

  const safetyFingerprint = identity?.publicKeyHex
    ? computeFingerprint(identity.publicKeyHex)
    : '----';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: currentColors.border },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <View style={styles.iconBadge}>
                <Ionicons name="qr-code-outline" size={20} color="#00ba7c" />
              </View>
              <View>
                <Text
                  style={[styles.modalTitle, { color: currentColors.text }]}
                >
                  Scan & Connect Nearby
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: currentColors.textSecondary },
                  ]}
                >
                  100% Offline Peer Pairing | অফলাইন পেয়ারিং
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={currentColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View
            style={[
              styles.tabRow,
              {
                backgroundColor: currentColors.bg,
                borderColor: currentColors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('my_qr')}
              style={[
                styles.tabBtn,
                activeTab === 'my_qr' && { backgroundColor: '#00ba7c' },
              ]}
            >
              <Ionicons
                name="qr-code"
                size={16}
                color={activeTab === 'my_qr' ? '#fff' : currentColors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color:
                      activeTab === 'my_qr'
                        ? '#fff'
                        : currentColors.textSecondary,
                  },
                ]}
              >
                My QR Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('manual')}
              style={[
                styles.tabBtn,
                activeTab === 'manual' && { backgroundColor: '#00ba7c' },
              ]}
            >
              <Ionicons
                name="key-outline"
                size={16}
                color={activeTab === 'manual' ? '#fff' : currentColors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color:
                      activeTab === 'manual'
                        ? '#fff'
                        : currentColors.textSecondary,
                  },
                ]}
              >
                Paste Key / Link
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.bodyContent}>
            {/* TAB 1: SHOW MY QR CODE */}
            {activeTab === 'my_qr' && (
              <View style={styles.qrSection}>
                <View style={styles.qrCard}>
                  {loadingQr || !qrDataUrl ? (
                    <View style={styles.qrLoadingBox}>
                      <ActivityIndicator size="large" color="#00ba7c" />
                      <Text style={styles.loadingText}>
                        Generating offline QR code...
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: qrDataUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                <Text
                  style={[styles.nodeNick, { color: currentColors.text }]}
                >
                  {identity?.nickname || 'Nearby Node'}
                </Text>
                <Text
                  style={[
                    styles.qrExplanation,
                    { color: currentColors.textSecondary },
                  ]}
                >
                  Show this QR code to a nearby phone or laptop to establish an instant end-to-end encrypted session.
                </Text>

                {/* Fingerprint Box */}
                <View
                  style={[
                    styles.fingerprintBox,
                    {
                      backgroundColor: currentColors.bg,
                      borderColor: currentColors.border,
                    },
                  ]}
                >
                  <View style={styles.fingerprintHeader}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color="#00ba7c"
                    />
                    <Text style={styles.fingerprintLabel}>
                      CRYPTO SAFETY FINGERPRINT (ED25519)
                    </Text>
                  </View>
                  <Text style={styles.fingerprintText}>
                    {safetyFingerprint}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: currentColors.bg },
                    ]}
                    onPress={handleCopyLink}
                  >
                    <Ionicons
                      name={copiedLink ? 'checkmark' : 'share-outline'}
                      size={16}
                      color={copiedLink ? '#00ba7c' : currentColors.text}
                    />
                    <Text
                      style={[
                        styles.actionBtnLabel,
                        {
                          color: copiedLink ? '#00ba7c' : currentColors.text,
                        },
                      ]}
                    >
                      {copiedLink ? 'Link Copied!' : 'Copy Mesh Link'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: currentColors.bg },
                    ]}
                    onPress={handleCopyKey}
                  >
                    <Ionicons
                      name={copiedKey ? 'checkmark' : 'copy-outline'}
                      size={16}
                      color={copiedKey ? '#00ba7c' : currentColors.text}
                    />
                    <Text
                      style={[
                        styles.actionBtnLabel,
                        {
                          color: copiedKey ? '#00ba7c' : currentColors.text,
                        },
                      ]}
                    >
                      {copiedKey ? 'Key Copied!' : 'Copy Hex Key'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* TAB 2: MANUAL PASTE / CONNECT */}
            {activeTab === 'manual' && (
              <View style={styles.manualSection}>
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    Peer Nickname (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: currentColors.bg,
                        borderColor: currentColors.border,
                        color: currentColors.text,
                      },
                    ]}
                    placeholder="e.g. Study Partner / Laptop"
                    placeholderTextColor={currentColors.textSecondary}
                    value={nickVal}
                    onChangeText={setNickVal}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: currentColors.textSecondary },
                      ]}
                    >
                      Peer Mesh Link or 64-Hex Key
                    </Text>
                    <TouchableOpacity onPress={handlePasteClipboard}>
                      <Text style={styles.pasteBtnText}>Paste from Clipboard</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.multilineInput,
                      {
                        backgroundColor: currentColors.bg,
                        borderColor: currentColors.border,
                        color: currentColors.text,
                      },
                    ]}
                    placeholder="cfm1://peer?pk=... or 64-char hex key"
                    placeholderTextColor={currentColors.textSecondary}
                    value={inputVal}
                    onChangeText={setInputVal}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline
                  />
                </View>

                {errorMessage && (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color="#f43f5e"
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.connectBtn}
                  onPress={handleManualConnect}
                >
                  <Text style={styles.connectBtnText}>Pair & Open Chat</Text>
                </TouchableOpacity>

                <View
                  style={[
                    styles.tipCard,
                    {
                      backgroundColor: currentColors.bg,
                      borderColor: currentColors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#00ba7c"
                  />
                  <Text
                    style={[
                      styles.tipText,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    When connecting with a desktop or phone nearby, you can also keep Mesh open on both devices to let the Auto-Discovery Radar find them automatically!
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,186,124,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  tabRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyContent: {
    padding: 20,
  },
  qrSection: {
    alignItems: 'center',
  },
  qrCard: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#00ba7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  qrImage: {
    width: 210,
    height: 210,
  },
  qrLoadingBox: {
    width: 210,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 11,
    color: '#052e16',
    marginTop: 8,
  },
  nodeNick: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  qrExplanation: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  fingerprintBox: {
    width: '100%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  fingerprintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  fingerprintLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00ba7c',
    letterSpacing: 0.5,
  },
  fingerprintText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#34d399',
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  manualSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  pasteBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#00ba7c',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(244,63,94,0.1)',
  },
  errorText: {
    fontSize: 12,
    color: '#f43f5e',
    flex: 1,
  },
  connectBtn: {
    backgroundColor: '#00ba7c',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#00ba7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});

export default MeshPairingModal;
