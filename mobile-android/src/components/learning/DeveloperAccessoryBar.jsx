import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

const DEVELOPER_KEYS = [
  { label: 'Tab', value: '  ' },
  { label: '{', value: '{' },
  { label: '}', value: '}' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: '[', value: '[' },
  { label: ']', value: ']' },
  { label: ';', value: ';' },
  { label: '=', value: ' = ' },
  { label: '=>', value: ' => ' },
  { label: '"', value: '"' },
  { label: "'", value: "'" },
  { label: ':', value: ': ' },
  { label: '</>', value: '<></>' },
  { label: '/>', value: ' />' },
  { label: '<', value: '<' },
  { label: '>', value: '>' },
];

export const DeveloperAccessoryBar = ({ onInsertKey }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        {DEVELOPER_KEYS.map((k, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.keyButton}
            onPress={() => onInsertKey(k.value)}
            activeOpacity={0.6}
          >
            <Text style={styles.keyText}>{k.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 42,
    backgroundColor: '#16181c',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2f3336',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  keyButton: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 10,
    backgroundColor: '#202327',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2f3336',
  },
  keyText: {
    color: '#e7e9ea',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export default DeveloperAccessoryBar;
