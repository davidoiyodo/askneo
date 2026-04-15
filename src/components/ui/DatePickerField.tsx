import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, Platform, StyleSheet,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';

type Props = {
  value: string;          // ISO 'YYYY-MM-DD' or ''
  onChange: (iso: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  hasError?: boolean;
};

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplay(iso: string): string {
  const [yyyy, mm, dd] = iso.split('-');
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DatePickerField({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select a date',
  hasError,
}: Props) {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(() =>
    value ? isoToDate(value) : (minDate ?? new Date())
  );

  const handlePress = () => {
    const initial = value ? isoToDate(value) : (minDate ?? new Date());
    setTempDate(initial);
    setShow(true);
  };

  // Android: picker closes itself, value comes in event
  const handleAndroidChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (selected) onChange(dateToIso(selected));
  };

  // iOS: spinner stays open, we capture temp value
  const handleIOSChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const handleConfirm = () => {
    onChange(dateToIso(tempDate));
    setShow(false);
  };

  const handleCancel = () => setShow(false);

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.75}
        style={[
          styles.field,
          {
            backgroundColor: theme.bg.surface,
            borderColor: hasError ? '#D64545' : theme.border.default,
          },
        ]}
      >
        <Text style={[
          styles.fieldText,
          { color: value ? theme.text.primary : theme.text.tertiary },
        ]}>
          {value ? formatDisplay(value) : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={[styles.sheet, { backgroundColor: theme.bg.surface }]}>
              <View style={[styles.sheetHeader, { borderBottomColor: theme.border.subtle }]}>
                <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.sheetBtn, { color: theme.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.sheetBtn, { color: theme.interactive.primary, fontFamily: Typography.fontFamily.bodyBold }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleIOSChange}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  textColor={theme.text.primary}
                  style={styles.picker}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleAndroidChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    flex: 1,
  },
  icon: {
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingBottom: Spacing[8],
  },
  pickerWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  picker: {
    width: '100%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  sheetBtn: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
});
