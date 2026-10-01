import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useNotifications } from '../context/NotificationContext';

export const Toast = () => {
  const { toast, hideToast } = useNotifications();
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  const bgColors = {
    info: colors.surface,
    success: 'rgba(0, 186, 124, 0.95)',
    error: 'rgba(244, 33, 46, 0.95)',
  };

  const borderColors = {
    info: colors.accent,
    success: colors.success,
    error: colors.danger,
  };

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[
          styles.content,
          {
            backgroundColor: bgColors[toast.type] || colors.surface,
            borderColor: borderColors[toast.type] || colors.border,
          },
        ]}
      >
        <Text style={styles.text}>{toast.message}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9999, // Pill
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '92%',
  },
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Toast;
