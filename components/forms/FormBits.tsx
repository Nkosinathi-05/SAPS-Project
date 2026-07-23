import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { C, FORM } from '../../constants/FormTheme';

type UnderlineFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  flex?: number;
};

export function UnderlineField({ label, value, onChangeText, flex }: UnderlineFieldProps) {
  return (
    <View style={{ flex: flex ?? 1, marginBottom: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={s.underlineInput}
        placeholderTextColor={C.grey500}
      />
    </View>
  );
}

type DigitRowProps = {
  label: string;
  count: number;
  guides?: string;
  value: string;
  onChangeText: (t: string) => void;
};

export function DigitRow({ label, count, guides, value, onChangeText }: DigitRowProps) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={s.label}>{label}</Text>
      {guides ? <Text style={s.guides}>{guides}</Text> : null}
      <View style={s.digitRow}>
        {Array.from({ length: count }).map((_, i) => (
          <TextInput
            key={i}
            value={(value[i] ?? '').replace(' ', '')}
            onChangeText={(t) => {
              const arr = value.padEnd(count, ' ').split('');
              arr[i] = (t.slice(-1) || ' ').toUpperCase();
              onChangeText(arr.join('').trimEnd());
            }}
            maxLength={1}
            keyboardType="number-pad"
            style={s.digitBox}
          />
        ))}
      </View>
    </View>
  );
}

export function ShadedSectionTitle({ title }: { title: string }) {
  return (
    <View style={s.shadedTitle}>
      <Text style={s.shadedTitleText}>{title}</Text>
    </View>
  );
}

export function YesNoRow({
  n,
  text,
  value,
  onChange,
}: {
  n: number;
  text: string;
  value: 'yes' | 'no' | null;
  onChange: (v: 'yes' | 'no') => void;
}) {
  return (
    <View style={s.yesNoRow}>
      <Text style={s.yesNoQ}>
        {n}. {text}
      </Text>
      <View style={s.yesNoPills}>
        <Pressable
          onPress={() => onChange('yes')}
          style={[s.pill, value === 'yes' && s.pillYes]}
          accessibilityRole="button"
        >
          <Text style={[s.pillTxt, value === 'yes' && s.pillTxtOn]}>Y</Text>
        </Pressable>
        <Pressable
          onPress={() => onChange('no')}
          style={[s.pill, value === 'no' && s.pillNo]}
          accessibilityRole="button"
        >
          <Text style={[s.pillTxt, value === 'no' && s.pillTxtOn]}>N</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  label: {
    color: C.blueMuted,
    fontSize: FORM.fontLabel,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  guides: { color: C.grey500, fontSize: FORM.fontCaption, marginBottom: 4 },
  underlineInput: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: C.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: FORM.fontBody,
    color: C.black,
  },
  digitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  digitBox: {
    width: 22,
    height: 26,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 0,
    fontSize: 11,
    fontWeight: '700',
    color: C.black,
    backgroundColor: C.white,
  },
  shadedTitle: {
    backgroundColor: C.grey200,
    borderBottomWidth: 1,
    borderColor: C.border,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  shadedTitleText: {
    textAlign: 'center',
    fontWeight: '800',
    color: C.black,
    fontSize: 10,
    lineHeight: 14,
  },
  yesNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: C.grey200,
    gap: 8,
  },
  yesNoQ: {
    flex: 1,
    color: C.black,
    fontSize: 10,
    lineHeight: 15,
  },
  yesNoPills: { flexDirection: 'row', gap: 6 },
  pill: {
    minWidth: 30,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  pillYes: { backgroundColor: C.blue, borderColor: C.blue },
  pillNo: { backgroundColor: C.blueMuted, borderColor: C.blueMuted },
  pillTxt: { fontSize: 11, fontWeight: '900', color: C.blueMuted },
  pillTxtOn: { color: C.white },
});