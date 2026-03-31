import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface NumericInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  unit: string;
  helpText?: string;
  returnKeyType?: 'done' | 'next';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}

export function NumericInput({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  helpText,
  returnKeyType = 'done',
  onSubmitEditing,
  inputRef,
}: NumericInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChangeText = (text: string) => {
    // Allow only numbers and one decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) return;
    onChangeText(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
        ]}
      >
        <TextInput
          ref={inputRef as any}
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          keyboardAppearance="dark"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {helpText && <Text style={styles.helpText}>{helpText}</Text>}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: colors.inputBorderFocused,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.subtitle,
    height: '100%',
  },
  unit: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    marginLeft: spacing.sm,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});
