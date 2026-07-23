import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { C, FORM } from '../../constants/FormTheme';

type Props = {
  label?: string;
  loading?: boolean;
  onPress: () => void | Promise<void>;
};

export function FormSubmitButton({ label = 'Submit', loading, onPress }: Props) {
  return (
    <Pressable
      onPress={() => void onPress()}
      disabled={loading}
      style={[styles.btn, loading && styles.btnDisabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!loading }}
    >
      {loading ? <ActivityIndicator color={C.white} /> : <Text style={styles.txt}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 10,
    backgroundColor: C.blue,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: FORM.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderWidth: 1,
    borderColor: C.blue,
  },
  btnDisabled: { opacity: 0.65 },
  txt: { color: C.white, fontWeight: '900', fontSize: 12 },
});
