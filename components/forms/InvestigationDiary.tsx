import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Colors, FORM } from "../../constants/FormTheme";
import { submitFormJson } from "../../lib/submitFormJson";
import { FormSubmitButton } from "./FormSubmitButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export type DiaryEntry = {
  date: string;
  time: string;
  particulars: string;
};

export type InvestigationDiaryPayload = {
  station: string;
  caseNumber: string;
  entries: DiaryEntry[];
  notes: string;
  investigatingOfficer: string;
};

function emptyEntry(): DiaryEntry {
  return { date: "", time: "", particulars: "" };
}

export function InvestigationDiaryReview({
  onSubmit,
}: {
  onSubmit?: (data: InvestigationDiaryPayload) => Promise<void>;
}) {
  const {
    checklist,
    formsData,
    name,
    surname,
    rank,
    personalNumber,
    station,
    caseType,
    city,
    signature,
    email,
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
    signature: string;
    email: string;
  }>();

  // Responsive: same breakpoint as the Login screen
  const { width } = useWindowDimensions();
  const isLaptop = width >= 768;

  const backendFormData = formsData ? JSON.parse(formsData) : {};
  const invastigationDiaryData = JSON.parse(
    backendFormData?.investigationDiary,
  );
  const [caseNumber, setCaseNumber] = useState(backendFormData?.caseNumber);
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const backendEntries = invastigationDiaryData?.entries;
    if (Array.isArray(backendEntries) && backendEntries.length > 0) {
      return backendEntries;
    }
    return [emptyEntry()];
  });

  const [notes, setNotes] = useState(invastigationDiaryData?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const router = useRouter();

  const addEntry = () => setEntries((prev) => [...prev, emptyEntry()]);

  const updateEntry = (
    index: number,
    field: keyof DiaryEntry,
    value: string,
  ) => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setCaseNumber("");
    setEntries([emptyEntry()]);
    setNotes("");
  };

  // Date/time column is wider on large screens
  const dateColStyle = isLaptop ? styles.thDateLaptop : styles.thDate;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.page}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.pageContent,
          isLaptop && styles.pageContentLaptop,
        ]}
      >
        <View style={[styles.card, isLaptop && styles.cardLaptop]}>
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>INVESTIGATION DIARY REVIEW </Text>
          </View>
          <View style={styles.subBar}>
            <Text style={styles.subBarTxt}>Case Investigation Log</Text>
          </View>

          <View style={[styles.body, isLaptop && styles.bodyLaptop]}>
            <Text style={styles.sectionTitle}>Case information</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.lbl}>Station</Text>
                <TextInput
                  value={station?.toUpperCase() ?? ""}
                  editable={false}
                  style={[styles.field, styles.fieldReadonly]}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.lbl}>CAS no</Text>
                <TextInput
                  value={caseNumber}
                  style={[styles.field, styles.fieldReadonly]}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.entriesHeader}>
              <Text style={[styles.sectionTitle, styles.entriesTitle]}>
                Investigation entries
              </Text>
              <Pressable
                onPress={addEntry}
                style={styles.addBtn}
                accessibilityRole="button"
              >
                <Text style={styles.addBtnTxt}>+ Add entry</Text>
              </Pressable>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.th, dateColStyle]}>Date and time</Text>
              <Text style={[styles.th, styles.thPart]}>
                Particulars of investigation
              </Text>
              <Text style={[styles.th, styles.thAction]}>Action</Text>
            </View>

            {entries.map((entry, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={dateColStyle}>
                  <TextInput
                    value={entry.date}
                    onChangeText={(v) => updateEntry(i, "date", v)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.grey500}
                    style={[styles.field, styles.fieldCompact]}
                  />
                  <TextInput
                    value={entry.time}
                    onChangeText={(v) => updateEntry(i, "time", v)}
                    placeholder="HH:MM"
                    placeholderTextColor={Colors.grey500}
                    style={[
                      styles.field,
                      styles.fieldCompact,
                      { marginTop: 4 },
                    ]}
                  />
                </View>
                <TextInput
                  value={entry.particulars}
                  onChangeText={(v) => updateEntry(i, "particulars", v)}
                  placeholder="Activities, findings, interviews, evidence…"
                  placeholderTextColor={Colors.grey500}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.field,
                    styles.particulars,
                    isLaptop && styles.particularsLaptop,
                    styles.thPart,
                  ]}
                />
                <View style={styles.thAction}>
                  {entries.length > 1 ? (
                    <Pressable
                      onPress={() => removeEntry(i)}
                      style={styles.removeBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Remove entry"
                    >
                      <Text style={styles.removeTxt}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Additional notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes, observations, or relevant information…"
              placeholderTextColor={Colors.grey500}
              multiline
              textAlignVertical="top"
              style={[
                styles.field,
                styles.notesArea,
                isLaptop && styles.notesAreaLaptop,
              ]}
            />
          </View>

          <View style={styles.footerMetaRow}>
            <Text style={styles.meta}>Revision 1.0 Dated 2006-10-24</Text>
            <Text style={styles.meta}>Page 2</Text>
          </View>

          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
            ))}
          </View>

          <View style={[styles.btnRow, isLaptop && styles.btnRowLaptop]}>
            <View style={styles.dualBtnRow}>
              <View style={styles.halfBtn}>
                <FormSubmitButton
                  label={
                    submitting
                      ? "Verifying…"
                      : verified
                        ? "Verified ✓"
                        : "Verify"
                  }
                  loading={submitting}
                  onPress={async () => {
                    if (verified) return;
                    setSubmitting(true);
                    try {
                      const payload: InvestigationDiaryPayload = {
                        station:
                          backendFormData?.investigationDiary?.station?.toUpperCase() ??
                          "",
                        caseNumber,
                        entries,
                        notes,
                        investigatingOfficer:
                          backendFormData?.investigationDiary?.investigatingOfficer?.toUpperCase() ??
                          "",
                      };

                      if (onSubmit) {
                        await onSubmit(payload);
                        setVerified(true);
                      } else {
                        const result = await submitFormJson(
                          "investigationDiary",
                          payload,
                          {
                            caseNumber: caseNumber,
                          },
                        );
                        if (!result.ok) {
                          return;
                        }
                        setVerified(true);
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                />
              </View>

              <View style={styles.halfBtn}>
                <FormSubmitButton
                  label="NEXT →"
                  onPress={() => {
                    if (!verified) return;
                    router.push({
                      pathname: "/StatementScreenReview",
                      params: {
                        formsData,
                        checklist,
                        name,
                        surname,
                        rank,
                        city,
                        station,
                        personalNumber,
                        caseType,
                        signature,
                        email,
                      },
                    });
                  }}
                />
              </View>
            </View>
          </View>

          <Pressable onPress={reset} style={styles.resetBtn}>
            <Text style={styles.resetTxt}>Clear form</Text>
          </Pressable>
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
  page: { flex: 1, backgroundColor: Colors.grey50 },

  // flexGrow lets the content (and the card) stretch to fill the screen height
  pageContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingHorizontal: FORM.padH,
    paddingTop: FORM.padV,
  },
  // Wide screens: edge-to-edge, no outer gutter
  pageContentLaptop: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },

  card: {
    flexGrow: 1,
    backgroundColor: Colors.white,
    borderRadius: FORM.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  cardLaptop: {
    borderRadius: 0,
    borderWidth: 0,
  },

  topBar: {
    backgroundColor: Colors.blue,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  topBarTitle: {
    color: Colors.white,
    fontSize: FORM.fontTitle,
    fontWeight: "900",
  },
  subBar: {
    backgroundColor: "#12277a",
    paddingVertical: 4,
    alignItems: "center",
  },
  subBarTxt: {
    color: Colors.white,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "700",
  },

  // flexGrow pushes the footer (dots, buttons) to the bottom of the screen
  body: { flexGrow: 1, padding: 10 },
  bodyLaptop: { padding: 24 },

  sectionTitle: {
    fontSize: FORM.fontLabel + 1,
    fontWeight: "900",
    color: Colors.blue,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    borderBottomWidth: 2,
    borderBottomColor: Colors.blue,
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 4,
  },
  entriesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 6,
    gap: 8,
  },
  entriesTitle: { flex: 1, marginBottom: 0, marginTop: 0 },
  addBtn: {
    borderWidth: 1,
    borderColor: Colors.blue,
    borderRadius: FORM.radiusSm,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  addBtnTxt: {
    color: Colors.blue,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "800",
  },
  lbl: {
    color: Colors.blueMuted,
    fontSize: FORM.fontLabel,
    fontWeight: "800",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  field: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: Colors.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: FORM.fontBody,
    color: Colors.black,
  },
  fieldReadonly: {
    backgroundColor: Colors.grey100,
    color: Colors.blueMuted,
  },
  fieldCompact: { fontSize: FORM.fontCaption + 1, paddingVertical: 4 },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.grey100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    borderTopLeftRadius: FORM.radiusSm,
    borderTopRightRadius: FORM.radiusSm,
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 6,
  },
  th: {
    fontSize: FORM.fontCaption,
    fontWeight: "900",
    color: Colors.blue,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  thDate: { width: 96 },
  thDateLaptop: { width: 160 },
  thPart: { flex: 1 },
  thAction: { width: 36, textAlign: "center" },
  tableRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.border,
    padding: 6,
    gap: 6,
    alignItems: "flex-start",
  },
  particulars: {
    minHeight: 64,
    lineHeight: FORM.lineHeight,
    paddingTop: 6,
  },
  particularsLaptop: {
    minHeight: 96,
  },
  notesArea: {
    minHeight: 72,
    lineHeight: FORM.lineHeight,
    marginBottom: 4,
  },
  notesAreaLaptop: {
    minHeight: 120,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  removeTxt: { color: "#DC2626", fontSize: 14, fontWeight: "900" },
  completedBy: {
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.grey100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  completedByTxt: {
    color: Colors.blue,
    fontSize: FORM.fontBody,
    fontWeight: "700",
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
  footerMetaRow: {
    marginTop: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: { color: Colors.grey500, fontSize: FORM.fontCaption },
  dotActive: { backgroundColor: Colors.blue },
  btnRow: { paddingHorizontal: 10, paddingBottom: 4 },
  // Keep the buttons a sensible width on wide screens
  btnRowLaptop: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  resetBtn: { paddingBottom: 10, alignItems: "center" },
  resetTxt: {
    color: Colors.grey500,
    fontSize: FORM.fontCaption,
    fontWeight: "600",
  },
  dualBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
});
