import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { C, FORM } from '../../constants/FormTheme';
import { submitFormJson } from '../../lib/submitFormJson';
import { FormSubmitButton } from './FormSubmitButton';
import { FormField, FormTextArea, formScreen } from './FormFields';

export function P21() {
  const [iAm, setIAm] = useState('');
  const [lang, setLang] = useState('ENGLISH');
  const [statement, setStatement] = useState('');
  const [initials, setInitials] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <ScrollView
      style={formScreen.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={formScreen.pageContent}
    >
      <View style={formScreen.card}>
        <View style={styles.topRow}>
          <Text style={styles.gps}>G.P.S 0/02</Text>
          <Text style={styles.p21}>P.21</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.meta}>2026/05/01</Text>
            <Text style={styles.meta}>BRIXTON SAPS CAS</Text>
          </View>
        </View>

        <View style={styles.hr} />

        <FormField label="I AM" value={iAm} onChangeText={setIAm} />
        <FormField
          label="STATE UNDER OATH SAY ENGLISH"
          value={lang}
          onChangeText={setLang}
        />

        <Text style={styles.that}>THAT:</Text>

        <FormTextArea
          label="Statement"
          value={statement}
          onChangeText={setStatement}
          minLines={12}
          placeholder="Enter sworn statement…"
        />

        <Text style={styles.decl}>I KNOW AND UNDERSTAND THE CONTENT OF THE ABOVE STATEMENT.</Text>
        <Text style={styles.decl}>I CONSIDER THE ABOVE STATEMENT TO BE TRUTHFUL ON MY CONSENT.</Text>

        <FormField label="Signature / Initials" value={initials} onChangeText={setInitials} />

        <View style={styles.dash} />

        <FormSubmitButton
          label="Submit P.21"
          loading={submitting}
          onPress={async () => {
            setSubmitting(true);
            try {
              await submitFormJson('p21', { iAm, lang, statement, initials });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  gps: { color: C.black, fontSize: 10, fontWeight: '700', marginTop: 4 },
  p21: { color: C.black, fontSize: 22, fontWeight: '900', textAlign: 'center', flex: 1 },
  meta: { color: C.black, fontSize: 10, fontWeight: '700' },
  hr: { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginVertical: 8 },
  that: { marginTop: 4, marginBottom: 2, fontSize: FORM.fontBody, fontWeight: '900', color: C.black },
  decl: { marginTop: 6, color: C.black, fontSize: FORM.fontCaption + 1, fontWeight: '800', lineHeight: 14 },
  dash: { marginTop: 12, marginBottom: 4, borderTopWidth: 1, borderStyle: 'dashed', borderColor: C.grey500 },
});
