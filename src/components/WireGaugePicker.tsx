import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { WIRE_DATA } from '../constants/wireData';

interface WireGaugePickerProps {
  selectedGauge: string;
  onSelect: (gauge: string) => void;
}

export function WireGaugePicker({
  selectedGauge,
  onSelect,
}: WireGaugePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempGauge, setTempGauge] = useState(selectedGauge);

  const selectedWire = WIRE_DATA.find((w) => w.awg === selectedGauge);

  const handleDone = () => {
    onSelect(tempGauge);
    setModalVisible(false);
  };

  const handleOpen = () => {
    setTempGauge(selectedGauge);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Wire Gauge</Text>
      <Pressable style={styles.pickerButton} onPress={handleOpen}>
        <Text style={styles.pickerButtonText}>
          {selectedWire?.label ?? selectedGauge}
        </Text>
        <Text style={styles.chevron}>&#x25BC;</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Wire Gauge</Text>
              <Pressable onPress={handleDone} hitSlop={12}>
                <Text style={styles.doneButton}>Done</Text>
              </Pressable>
            </View>
            <Picker
              selectedValue={tempGauge}
              onValueChange={(value) => setTempGauge(value as string)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {WIRE_DATA.map((wire) => (
                <Picker.Item
                  key={wire.awg}
                  label={`${wire.label}  (${wire.maxAmps}A max)`}
                  value={wire.awg}
                  color={
                    Platform.OS === 'ios'
                      ? colors.textPrimary
                      : colors.textPrimary
                  }
                />
              ))}
            </Picker>
          </View>
        </Pressable>
      </Modal>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  pickerButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.subtitle,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.subtitle,
    fontWeight: '600',
  },
  doneButton: {
    color: colors.primary,
    fontSize: fontSize.subtitle,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: colors.surface,
  },
  pickerItem: {
    color: colors.textPrimary,
    fontSize: fontSize.subtitle,
  },
});
