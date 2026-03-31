import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoltageDropResult } from '../utils/voltageDropCalculator';
import { StatusBadge } from './StatusBadge';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface ResultsCardProps {
  result: VoltageDropResult | null;
}

function ResultRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValueContainer}>
        <Text style={styles.rowValue}>{value}</Text>
        <Text style={styles.rowUnit}>{unit}</Text>
      </View>
    </View>
  );
}

export function ResultsCard({ result }: ResultsCardProps) {
  const placeholder = !result;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Results</Text>

      <View style={styles.divider} />

      <ResultRow
        label="Voltage Drop"
        value={placeholder ? '—' : result.voltageDrop.toFixed(3)}
        unit={placeholder ? '' : 'V'}
      />
      <ResultRow
        label="Drop Percentage"
        value={placeholder ? '—' : result.voltageDropPercent.toFixed(2)}
        unit={placeholder ? '' : '%'}
      />
      <ResultRow
        label="Voltage at Load"
        value={placeholder ? '—' : result.voltageAtLoad.toFixed(3)}
        unit={placeholder ? '' : 'V'}
      />

      {result && (
        <>
          <StatusBadge status={result.status} />
          {result.recommendation && (
            <Text style={styles.recommendation}>{result.recommendation}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.subtitle,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
  },
  rowValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rowValue: {
    color: colors.textPrimary,
    fontSize: fontSize.title,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  rowUnit: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    marginLeft: spacing.xs,
  },
  recommendation: {
    color: colors.warning,
    fontSize: fontSize.caption,
    marginTop: spacing.sm + 2,
    lineHeight: 18,
  },
});
