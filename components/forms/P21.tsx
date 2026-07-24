import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors, FORM } from "../../constants/FormTheme";
import { submitFormJson } from "../../lib/submitFormJson";
import { FormSubmitButton } from "./FormSubmitButton";
import { FormField, FormTextArea, formScreen } from "./FormFields";
import { useRouter } from "expo-router";

export type P21Payload = {
  iAm: string;
  lang: string;
  statement: string;
  initials: string;
};

export function P21({
  onSubmit,
}: {
  onSubmit?: (data: P21Payload) => Promise<void>;
}) {
  const [iAm, setIAm] = useState("");
  const [lang, setLang] = useState("ENGLISH");
  const [statement, setStatement] = useState("");
  const [initials, setInitials] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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
          <View style={{ alignItems: "flex-end" }}>
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

        <Text style={styles.decl}>
          I KNOW AND UNDERSTAND THE CONTENT OF THE ABOVE STATEMENT.
        </Text>
        <Text style={styles.decl}>
          I CONSIDER THE ABOVE STATEMENT TO BE TRUTHFUL ON MY CONSENT.
        </Text>

        <FormField
          label="Signature / Initials"
          value={initials}
          onChangeText={setInitials}
        />

        <View style={styles.dash} />

        <View style={styles.footerMetaRow}>
          <Text style={styles.meta1}>Revision 1.0 Dated 2006-10-24</Text>
          <Text style={styles.meta1}>Page 1</Text>
        </View>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>
        <FormSubmitButton
          label="Next: Investigation Diary →"
          loading={submitting}
          onPress={async () => {
            setSubmitting(true);
            try {
              const payload: P21Payload = { iAm, lang, statement, initials };
              if (onSubmit) {
                await onSubmit(payload);
              } else {
                await submitFormJson("p21", payload);
                router.push("/InvestigationDiaryScreen");
              }
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
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  gps: { color: Colors.black, fontSize: 10, fontWeight: "700", marginTop: 4 },
  p21: {
    color: Colors.black,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    flex: 1,
  },
  meta: { color: Colors.black, fontSize: 10, fontWeight: "700" },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  that: {
    marginTop: 4,
    marginBottom: 2,
    fontSize: FORM.fontBody,
    fontWeight: "900",
    color: Colors.black,
  },
  decl: {
    marginTop: 6,
    color: Colors.black,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "800",
    lineHeight: 14,
  },
  dash: {
    marginTop: 12,
    marginBottom: 4,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.grey500,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.blue },
  footerMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta1: { color: Colors.grey500, fontSize: FORM.fontCaption },
});
