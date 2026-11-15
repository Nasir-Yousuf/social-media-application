import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'qrcode';
import colors from '../../theme/colors';

export const CertificateModal = ({ visible, certificate, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    if (!certificate) return;
    const verifyUrl =
      certificate.verificationUrl ||
      `https://clearfeed.app/verify-cert/${certificate.certificateId}`;

    QRCode.toDataURL(verifyUrl, { width: 160, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [certificate]);

  if (!visible || !certificate) return null;

  const dateFormatted = new Date(certificate.issuedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    try {
      const verifyUrl =
        certificate.verificationUrl ||
        `https://clearfeed.app/verify-cert/${certificate.certificateId}`;
      await Share.share({
        title: `Clearfeed Academy Certificate - ${certificate.trackTitle}`,
        message: `🎓 I just completed the ${certificate.trackTitle} curriculum on Clearfeed with an official score of ${certificate.score || 100}%!\n\nVerify my Ed25519-signed certificate: ${verifyUrl}`,
      });
    } catch {}
  };

  const handleOpenVerify = () => {
    const verifyUrl =
      certificate.verificationUrl ||
      `https://clearfeed.app/verify-cert/${certificate.certificateId}`;
    Linking.openURL(verifyUrl).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="certificate" size={20} color="#f59e0b" style={{ marginRight: 6 }} />
              <Text style={styles.headerTitle}>Verified Completion Certificate</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#e7e9ea" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Certificate Frame */}
            <View style={styles.certFrame}>
              <View style={styles.innerBorder}>
                {/* Seal Icon */}
                <View style={styles.sealCircle}>
                  <MaterialCommunityIcons name="seal" size={32} color="#16181c" />
                </View>

                <Text style={styles.orgHeader}>CLEARFEED ACADEMY · VERIFIED CREDENTIAL</Text>
                <Text style={styles.certTitle}>Certificate of Completion</Text>

                <Text style={styles.certSubtext}>This officially certifies that</Text>
                <Text style={styles.studentName}>{certificate.studentName || 'Learner'}</Text>

                <Text style={styles.certSubtext}>has demonstrated comprehensive mastery in</Text>
                <Text style={styles.trackTitle}>{certificate.trackTitle}</Text>

                <View style={styles.gradeBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 4 }} />
                  <Text style={styles.gradeText}>
                    Grade: {certificate.score || 100}% · {certificate.score >= 90 ? 'High Honors' : 'Verified Pass'}
                  </Text>
                </View>

                {/* QR Code & Verification Block */}
                <View style={styles.qrSection}>
                  {qrDataUrl && (
                    <Image source={{ uri: qrDataUrl }} style={styles.qrImage} resizeMode="contain" />
                  )}
                  <View style={styles.qrMeta}>
                    <Text style={styles.credIdLabel}>Credential ID:</Text>
                    <Text style={styles.credIdValue} numberOfLines={1}>
                      {certificate.certificateId}
                    </Text>
                    <Text style={styles.dateLabel}>Issued: {dateFormatted}</Text>
                    <View style={styles.cryptoBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#10b981" style={{ marginRight: 4 }} />
                      <Text style={styles.cryptoBadgeText}>Ed25519 Cryptographically Signed</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                <Feather name="share-2" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.shareBtnText}>Share Certificate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.verifyBtn} onPress={handleOpenVerify} activeOpacity={0.8}>
                <Feather name="external-link" size={16} color="#f59e0b" style={{ marginRight: 6 }} />
                <Text style={styles.verifyBtnText}>Verify Online</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#0b0e14',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#111827',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  certFrame: {
    backgroundColor: '#0d1117',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(245, 158, 11, 0.6)',
    padding: 8,
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sealCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  orgHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f59e0b',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  certTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fbbf24',
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
  },
  certSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(245, 158, 11, 0.5)',
    marginBottom: 10,
    textAlign: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 10,
    textAlign: 'center',
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 16,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    marginTop: 8,
    gap: 12,
  },
  qrImage: {
    width: 74,
    height: 74,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  qrMeta: {
    flex: 1,
  },
  credIdLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  credIdValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  cryptoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoBadgeText: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d9bf0',
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
});

export default CertificateModal;
