import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Pressable,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SystemVoltageToggle } from '../components/SystemVoltageToggle';
import { WireGaugePicker } from '../components/WireGaugePicker';
import { NumericInput } from '../components/NumericInput';
import { ResultsCard } from '../components/ResultsCard';
import {
  calculateVoltageDrop,
  VoltageDropStatus,
} from '../utils/voltageDropCalculator';
import { DEFAULT_WIRE_GAUGE } from '../constants/wireData';
import { colors, spacing, fontSize } from '../theme';

export function CalculatorScreen() {
  const [systemVoltage, setSystemVoltage] = React.useState<12 | 24>(12);
  const [wireGauge, setWireGauge] = React.useState(DEFAULT_WIRE_GAUGE);
  const [wireLength, setWireLength] = React.useState('');
  const [current, setCurrent] = React.useState('');

  const currentInputRef = useRef<TextInput>(null);
  const prevStatusRef = useRef<VoltageDropStatus | null>(null);

  const result = useMemo(() => {
    const lengthNum = parseFloat(wireLength);
    const currentNum = parseFloat(current);
    if (isNaN(lengthNum) || isNaN(currentNum) || lengthNum <= 0 || currentNum <= 0) {
      return null;
    }
    return calculateVoltageDrop({
      systemVoltage,
      wireGaugeAwg: wireGauge,
      wireLengthFeet: lengthNum,
      currentAmps: currentNum,
    });
  }, [systemVoltage, wireGauge, wireLength, current]);

  useEffect(() => {
    if (!result) {
      prevStatusRef.current = null;
      return;
    }
    if (prevStatusRef.current !== result.status) {
      prevStatusRef.current = result.status;
      if (result.status === 'good') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (result.status === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [result]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>VoltCalc</Text>
              <Text style={styles.subtitle}>
                Van Build Voltage Drop Calculator
              </Text>
            </View>

            <SystemVoltageToggle
              value={systemVoltage}
              onChange={setSystemVoltage}
            />

            <WireGaugePicker
              selectedGauge={wireGauge}
              onSelect={setWireGauge}
            />

            <NumericInput
              label="One-Way Wire Length"
              value={wireLength}
              onChangeText={setWireLength}
              placeholder="e.g. 15"
              unit="ft"
              helpText="Distance from battery/fuse box to device. Return path is calculated automatically."
              returnKeyType="next"
              onSubmitEditing={() => currentInputRef.current?.focus()}
            />

            <NumericInput
              label="Current Draw"
              value={current}
              onChangeText={setCurrent}
              placeholder="e.g. 10"
              unit="A"
              inputRef={currentInputRef}
            />

            <ResultsCard result={result} />

            <Text style={styles.disclaimer}>
              For reference only. Always consult a qualified electrician and
              follow manufacturer specifications.
            </Text>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 34,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.headline,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    marginTop: spacing.xs,
  },
  disclaimer: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 16,
    opacity: 0.7,
  },
});
