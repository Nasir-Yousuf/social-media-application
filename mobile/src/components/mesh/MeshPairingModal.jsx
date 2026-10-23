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
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [activeTab, setActiveTab] = useState('my_qr'); // 'my_qr' | 'scan' | 'manual'
  const [qrMatrix, setQrMatrix] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Camera permissions & scanner state
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Manual input state
  const [inputVal, setInputVal] = useState('');
  const [nickVal, setNickVal] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  // Reset scanner state when tab changes or modal opens
  useEffect(() => {
    if (visible && activeTab === 'scan') {
      setScanned(false);
    }
  }, [visible, activeTab]);

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

  // Generate pure JS QR code matrix synchronously without Canvas or Node streams
  useEffect(() => {
    if (!visible || !identity?.publicKeyHex) return;

    try {
      const payload = `cfm1://peer?pk=${identity.publicKeyHex}&nick=${encodeURIComponent(
        identity.nickname || 'Peer'
      )}`;

      const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
      const size = qr.modules.size;
      const rows = [];
      for (let r = 0; r < size; r++) {
        const row = [];
        let currentVal = qr.modules.get(r, 0);
        let count = 0;
        for (let c = 0; c < size; c++) {
          const val = qr.modules.get(r, c);
          if (val === currentVal) {
            count++;
          } else {
            row.push({ dark: Boolean(currentVal), count });
            currentVal = val;
            count = 1;
          }
        }
        row.push({ dark: Boolean(currentVal), count });
        rows.push(row);
      }
      setQrMatrix({ size, rows });
    } catch (err) {
      console.warn('[MeshPairing] Pure JS QR Matrix error:', err);
    }
  }, [visible, identity]);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    const parsed = parsePeerString(data);
    if (parsed) {
      setScanned(true);
      const peer = {
        publicKeyHex: parsed.pubkey,
        nickname: parsed.nickname || `Peer_${parsed.pubkey.substring(0, 6)}`,
        status: 'discovered',
        fingerprint: computeFingerprint(parsed.pubkey),
        lastSeen: Date.now(),
        reachability: 'direct',
        hops: 0,
      };

      setTimeout(() => {
        onConnect(peer);
        onClose();
      }, 300);
    }
  };

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

          {/* Navigation Tabs (3 Tabs: My QR | Scan Camera | Paste Key) */}
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
                size={15}
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
                My QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('scan')}
              style={[
                styles.tabBtn,
                activeTab === 'scan' && { backgroundColor: '#00ba7c' },
              ]}
            >
              <Ionicons
                name="camera"
                size={15}
                color={activeTab === 'scan' ? '#fff' : currentColors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color:
                      activeTab === 'scan'
                        ? '#fff'
                        : currentColors.textSecondary,
                  },
                ]}
              >
                Scan Camera
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
                size={15}
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
                Paste Key
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.bodyContent}>
            {/* TAB 1: SHOW MY QR CODE */}
            {activeTab === 'my_qr' && (
              <View style={styles.qrSection}>
                <View style={styles.qrCard}>
                  {!qrMatrix ? (
                    <View style={styles.qrLoadingBox}>
                      <ActivityIndicator size="large" color="#00ba7c" />
                      <Text style={styles.loadingText}>
                        Generating offline QR code...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.qrGridWrapper}>
                      {(() => {
                        const pixelSize = Math.max(4, Math.floor(210 / qrMatrix.size));
                        return qrMatrix.rows.map((row, rIdx) => (
                          <View key={`r-${rIdx}`} style={{ flexDirection: 'row', height: pixelSize }}>
                            {row.map((run, cIdx) => (
                              <View
                                key={`c-${cIdx}`}
                                style={{
                                  width: run.count * pixelSize,
                                  height: pixelSize,
                                  backgroundColor: run.dark ? '#052e16' : '#ffffff',
                                }}
                              />
                            ))}
                          </View>
                        ));
                      })()}
                    </View>
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

            {/* TAB 2: LIVE CAMERA SCANNER */}
            {activeTab === 'scan' && (
              <View style={styles.cameraSection}>
                {!permission ? (
                  <View style={styles.cameraCenterBox}>
                    <ActivityIndicator size="large" color="#00ba7c" />
                    <Text
                      style={[
                        styles.permissionText,
                        { color: currentColors.textSecondary },
                      ]}
                    >
                      Checking camera permission...
                    </Text>
                  </View>
                ) : !permission.granted ? (
                  <View
                    style={[
                      styles.permissionCard,
                      {
                        backgroundColor: currentColors.bg,
                        borderColor: currentColors.border,
                      },
                    ]}
                  >
                    <View style={styles.permissionIconBadge}>
                      <Ionicons name="camera-outline" size={32} color="#00ba7c" />
                    </View>
                    <Text
                      style={[
                        styles.permissionTitle,
                        { color: currentColors.text },
                      ]}
                    >
                      Camera Access Needed
                    </Text>
                    <Text
                      style={[
                        styles.permissionDesc,
                        { color: currentColors.textSecondary },
                      ]}
                    >
                      Camera permission is needed to scan nearby Clearfeed Mesh QR codes on other phones and laptops.
                    </Text>
                    <TouchableOpacity
                      style={styles.permissionBtn}
                      onPress={requestPermission}
                    >
                      <Text style={styles.permissionBtnText}>
                        Grant Camera Permission
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.scannerWrapper}>
                    <View style={styles.cameraPreviewBox}>
                      <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        barcodeScannerSettings={{
                          barcodeTypes: ['qr'],
                        }}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                      />

                      {/* Reticle Overlay */}
                      <View style={styles.reticleOverlay}>
                        <View style={styles.reticleBox}>
                          <View style={[styles.corner, styles.topLeft]} />
                          <View style={[styles.corner, styles.topRight]} />
                          <View style={[styles.corner, styles.bottomLeft]} />
                          <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                      </View>
                    </View>

                    {scanned ? (
                      <View style={styles.scannedSuccessPill}>
                        <Ionicons name="checkmark-circle" size={16} color="#00ba7c" />
                        <Text style={styles.scannedSuccessText}>
                          QR Detected! Connecting...
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.cameraHintPill}>
                        <Ionicons name="scan-outline" size={14} color="#00ba7c" />
                        <Text style={styles.cameraHintText}>
                          Point camera at Clearfeed Mesh QR code
                        </Text>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.scannerNote,
                        { color: currentColors.textSecondary },
                      ]}
                    >
                      Scan your friend's laptop or phone screen to pair and start chatting in less than 1 second.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* TAB 3: MANUAL PASTE / CONNECT */}
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
    gap: 5,
  },
  tabBtnText: {
    fontSize: 11,
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
  qrGridWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 8,
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
  // Camera Scanner Styles
  cameraSection: {
    alignItems: 'center',
  },
  cameraCenterBox: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  permissionText: {
    fontSize: 12,
  },
  permissionCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  permissionIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,186,124,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  permissionDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  permissionBtn: {
    backgroundColor: '#00ba7c',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  scannerWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  cameraPreviewBox: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    marginBottom: 14,
  },
  reticleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleBox: {
    width: 170,
    height: 170,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00ba7c',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  cameraHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,186,124,0.15)',
    marginBottom: 8,
  },
  cameraHintText: {
    fontSize: 11,
    color: '#00ba7c',
    fontWeight: '600',
  },
  scannedSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0,186,124,0.25)',
    marginBottom: 8,
  },
  scannedSuccessText: {
    fontSize: 12,
    color: '#00ba7c',
    fontWeight: 'bold',
  },
  scannerNote: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  // Manual Tab Styles
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
