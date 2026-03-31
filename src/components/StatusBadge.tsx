import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoltageDropStatus } from '../utils/voltageDropCalculator';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface StatusBadgeProps {
  status: VoltageDropStatus;
}

const STATUS_CONFIG: Record<
  VoltageDropStatus,
  { color: string; label: string; icon: string }
> = {
  good: { color: colors.good, label: 'PASS — Under 3%', icon: '✓' },
  warning: {
    color: colors.warning,
    label: 'CAUTION — 3% to 5%',
    icon: '!',
  },
  fail: { color: colors.fail, label: 'FAIL — Over 5%', icon: '✕' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.container, { backgroundColor: config.color + '1A' }]}>
      <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
