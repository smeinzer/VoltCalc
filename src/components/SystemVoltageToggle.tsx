import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface SystemVoltageToggleProps {
  value: 12 | 24;
  onChange: (voltage: 12 | 24) => void;
}

export function SystemVoltageToggle({
  value,
  onChange,
}: SystemVoltageToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>System Voltage</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.option, value === 12 && styles.optionActive]}
          onPress={() => onChange(12)}
        >
          <Text
            style={[
              styles.optionText,
              value === 12 && styles.optionTextActive,
            ]}
          >
            12V
          </Text>
        </Pressable>
        <Pressable
          style={[styles.option, value === 24 && styles.optionActive]}
          onPress={() => onChange(24)}
        >
          <Text
            style={[
              styles.optionText,
              value === 24 && styles.optionTextActive,
            ]}
          >
            24V
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md - 2,
    margin: 2,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: fontSize.subtitle,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
});
