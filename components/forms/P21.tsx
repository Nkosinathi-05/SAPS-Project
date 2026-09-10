import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Colors, FORM } from "../../constants/FormTheme";
import { submitFormJson } from "../../lib/submitFormJson";
import { FormSubmitButton } from "./FormSubmitButton";
import { FormField, FormTextArea, formScreen } from "./FormFields";
import { SignaturePad, SignaturePadHandle } from "./SignaturePad";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  initialWindowMetrics,
  SafeAreaView,
} from "react-native-safe-area-context";

export type P21Payload = {
  iAm: string;
  lang: string;
  statement: string;
  initials: string;
  signature: string;
}

export function P21Review({
  onSubmit,
}: {
  onSubmit?: (data: P21Payload) => Promise<void>;
}) {
  const {
    checklist,
    formsData: formsDataParam,
    name,
    surname,
    rank,
    personalNumber,
    station,
    caseType,
    city,
  } = useLocalSearchParams<{
    checklist: string;
    formsData: string;
    name: string;
    surname: string;
    rank: string;
    personalNumber: string;
    station: string;
    caseType: string;
    city: string;
  }>();
  const backendFormData = formsDataParam ? JSON.parse(formsDataParam) : {};
  const [iAm, setIAm] = useState("");
  const [lang, setLang] = useState("ENGLISH");
  const [statement, setStatement] = useState("");
  const [initials, setInitials] = useState("");
  const [signature, setSignature] = useState("");
  const signaturePadRef = useRef<SignaturePadHandle>(null);
  const [signatureLocked, setSignatureLocked] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={formScreen.page}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={formScreen.pageContent}
        scrollEnabled={scrollEnabled}
      >
        <View style={formScreen.card}>
          <View style={styles.topRow}>
            <Text style={styles.gps}>G.P.S 0/02</Text>
            <Text style={styles.p21}>P.21 REVIEW</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.meta}>2026/05/01</Text>
              <Text style={styles.meta}>BRIXTON SAPS CAS</Text>
            </View>
          </View>

          <View style={styles.hr} />

          <FormField
            label="I AM"
            value={iAm}
            onChangeText={setIAm}
            autoCorrect={false}
            spellCheck={false}
            uppercase
          />
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
          <Text style={styles.that}>Signature / Initials</Text>
          {!signatureLocked && (
            <View
              {...(Platform.OS !== "web"
                ? {
                    onStartShouldSetResponderCapture: () => {
                      setScrollEnabled(false);
                      return false;
                    },
                    onTouchEnd: () => setScrollEnabled(true),
                  }
                : {})}
            >
            <SignaturePad 
              ref={signaturePadRef} 
              onSignature={(sig) => {
                setSignature(sig);
                if (sig) {
                  setSignatureLocked(true);
                }
              }}
            />
            </View>
          )}
          {signatureLocked && (
            <View style={styles.signatureLockedBox}>
              <Text style={styles.signatureLockedText}>✅ Signature saved</Text>
            </View>
          )}

          <View style={{flexDirection: "row", gap: 12,  marginTop: 8}}>
            <TouchableOpacity
              style={styles.sigButton}
              onPress={() => {
                signaturePadRef.current?.clear();
                setSignature("");
                setSignatureLocked(false);
              }}
            >
              <Text style={styles.sigButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sigButton}
              onPress={() => {
                signaturePadRef.current?.capture();
                }
              }
            >
              <Text style={styles.sigButtonText}>Save Signature</Text>
            </TouchableOpacity>
          </View>

          <FormField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
            label="INVESTIGATION DIARY REVIEW →"
            loading={submitting}
            onPress={async () => {
              setSubmitting(true);
              try {
                const payload: P21Payload = { iAm, lang, statement, initials, signature };
                if (onSubmit) {
                  await onSubmit(payload);
                } else {
                  if (email === "") {
                    alert("Please enter your email address.");
                    return;
                  }
                  const result = await submitFormJson(
                    "p21",
                    payload,
                    {
                      victim: iAm,
                    },
                    { email: email },
                  );

                  if (!result.ok) {
                    return;
                  }
                  console.log(signature);
                  router.push({
                    pathname: "/InvestigationDiaryScreenReview",
                    params: {
                      formsData: JSON.stringify(result.data ?? {}),
                      checklist,
                      name,
                      surname,
                      rank,
                      city,
                      station,
                      personalNumber,
                      caseType,
                    },
                  });
                }
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
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
  signatureLockedBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
  signatureLockedText: {
    color: "#15803d",
    fontSize: FORM.fontBody,
    fontWeight: "700",
  },
  sigButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  sigButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
