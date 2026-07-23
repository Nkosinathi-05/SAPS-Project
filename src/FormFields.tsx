import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  type TextInputProps,
} from 'react-native';
import { C, FORM } from '../FormTheme';

export const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayAbbrev = (typeof DAY_ABBREVS)[number];

export const formScreen = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.grey50 },
  pageContent: { paddingBottom: 20, paddingHorizontal: FORM.padH, paddingTop: FORM.padV },
  card: {
    backgroundColor: C.white,
    borderRadius: FORM.radiusMd,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
});

export const formFieldStyles = StyleSheet.create({
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: FORM.fontLabel + 1,
    fontWeight: '900',
    color: C.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: C.blue,
  },
  sectionHint: {
    fontSize: FORM.fontCaption + 0.5,
    color: C.grey500,
    lineHeight: 15,
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: FORM.fontCaption + 1,
    fontWeight: '800',
    color: C.blueMuted,
    marginBottom: 6,
    marginTop: 4,
  },
  label: {
    color: C.blueMuted,
    fontSize: FORM.fontLabel,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: C.inputBg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: FORM.fontBody,
    color: C.black,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    lineHeight: FORM.lineHeight + 2,
  },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  dividerWrap: { alignItems: 'center', marginVertical: 10 },
  dividerText: {
    fontSize: FORM.fontBody,
    fontWeight: '800',
    color: C.blueMuted,
    letterSpacing: 0.5,
  },
  dayRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChip: {
    flexGrow: 1,
    minWidth: 40,
    paddingVertical: 8,
    borderRadius: FORM.radiusSm,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.white,
  },
  dayChipOn: { backgroundColor: C.blue, borderColor: C.blue },
  dayChipTxt: { fontSize: FORM.fontCaption + 1, fontWeight: '800', color: C.blueMuted },
  dayChipTxtOn: { color: C.white },
});

export function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={formFieldStyles.section}>
      <Text style={formFieldStyles.sectionTitle}>{title}</Text>
      {hint ? <Text style={formFieldStyles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
} & Pick<TextInputProps, 'keyboardType' | 'autoCapitalize'>) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={formFieldStyles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.grey500}
        keyboardType={keyboardType}
        style={formFieldStyles.input}
        {...rest}
      />
    </View>
  );
}

export function FormTextArea({
  label,
  value,
  onChangeText,
  placeholder,
  minLines = 3,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  minLines?: number;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={formFieldStyles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.grey500}
        multiline
        textAlignVertical="top"
        style={[
          formFieldStyles.input,
          formFieldStyles.inputMultiline,
          { minHeight: FORM.lineHeight * minLines + 24 },
        ]}
      />
    </View>
  );
}

export function FormDivider({ text }: { text: string }) {
  return (
    <View style={formFieldStyles.dividerWrap}>
      <Text style={formFieldStyles.dividerText}>{text}</Text>
    </View>
  );
}

export function FormDateTimePair({
  dateLabel,
  timeLabel,
  date,
  time,
  onDateChange,
  onTimeChange,
  datePlaceholder = 'YYYY-MM-DD',
  timePlaceholder = 'HH:MM',
}: {
  dateLabel: string;
  timeLabel: string;
  date: string;
  time: string;
  onDateChange: (t: string) => void;
  onTimeChange: (t: string) => void;
  datePlaceholder?: string;
  timePlaceholder?: string;
}) {
  return (
    <View style={formFieldStyles.row}>
      <View style={formFieldStyles.col}>
        <FormField
          label={dateLabel}
          value={date}
          onChangeText={onDateChange}
          placeholder={datePlaceholder}
        />
      </View>
      <View style={formFieldStyles.col}>
        <FormField
          label={timeLabel}
          value={time}
          onChangeText={onTimeChange}
          placeholder={timePlaceholder}
        />
      </View>
    </View>
  );
}

export function DayOfWeekPicker({
  value,
  onChange,
}: {
  value: DayAbbrev | null;
  onChange: (day: DayAbbrev | null) => void;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={formFieldStyles.label}>Day of week / Dag</Text>
      <View style={formFieldStyles.dayRow}>
        {DAY_ABBREVS.map((day) => {
          const on = value === day;
          return (
            <Pressable
              key={day}
              onPress={() => onChange(on ? null : day)}
              style={[formFieldStyles.dayChip, on && formFieldStyles.dayChipOn]}
              accessibilityRole="button"
            >
              <Text style={[formFieldStyles.dayChipTxt, on && formFieldStyles.dayChipTxtOn]}>
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
