import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Button,
} from "react-native";
import { C, FORM } from "../constants/FormTheme";
import { submitFormJson } from "../lib/submitFormJson";
import { FormSubmitButton } from "../components/forms/FormSubmitButton";
import { useRouter, useLocalSearchParams } from "expo-router";

const DEFAULT_STATION = "Johannesburg Central Police Station";
const INVESTIGATING_OFFICER = "";

export type DiaryEntry = {
  date: string;
  time: string;
  particulars: string;
};

export type InvestigationDiaryPayload = {
  station: string;
  casNo: string;
  entries: DiaryEntry[];
  notes: string;
  investigatingOfficer: string;
};

function emptyEntry(): DiaryEntry {
  return { date: "", time: "", particulars: "" };
}

export default function InvestigationDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([emptyEntry()]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { iAm, Casedescription, caseNumber } = useLocalSearchParams<{
    caseNumber: string;
    iAm: string;
    Casedescription: string;
  }>();

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
    setEntries([emptyEntry()]);
    setNotes("");
  };

  async function InvestigationDiary() {
    try {
      const response = await fetch(
        "https://danger-reliable-conclude.ngrok-free.dev/cases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            investigationDiary: { entries, notes },
            caseNumber,
          }),
        },
      );
      const data = await response.json();

      router.push({
        pathname: "/ModusOperandi",
        params: {
          iAm: iAm,
          Casedescription: Casedescription,
          caseNumber: caseNumber,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <ScrollView
      style={styles.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.pageContent}
    >
      <View style={styles.card}>
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Investigation Diary</Text>
        </View>
        <View style={styles.subBar}>
          <Text style={styles.subBarTxt}>Case Investigation Log</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Case information</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.lbl}>Station</Text>
              <TextInput
                value={DEFAULT_STATION}
                editable={false}
                style={[styles.field, styles.fieldReadonly]}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.lbl}>CAS no</Text>
              <TextInput
                value={caseNumber}
                editable={false}
                placeholder="CAS No"
                placeholderTextColor={C.grey500}
                style={[styles.field, styles.fieldReadonly]}
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
            <Text style={[styles.th, styles.thDate]}>Date and time</Text>
            <Text style={[styles.th, styles.thPart]}>
              Particulars of investigation
            </Text>
            <Text style={[styles.th, styles.thAction]}>Action</Text>
          </View>

          {entries.map((entry, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.thDate}>
                <TextInput
                  value={entry.date}
                  onChangeText={(v) => updateEntry(i, "date", v)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.grey500}
                  style={[styles.field, styles.fieldCompact]}
                />
                <TextInput
                  value={entry.time}
                  onChangeText={(v) => updateEntry(i, "time", v)}
                  placeholder="HH:MM"
                  placeholderTextColor={C.grey500}
                  style={[styles.field, styles.fieldCompact, { marginTop: 4 }]}
                />
              </View>
              <TextInput
                value={entry.particulars}
                onChangeText={(v) => updateEntry(i, "particulars", v)}
                placeholder="Activities, findings, interviews, evidence…"
                placeholderTextColor={C.grey500}
                multiline
                textAlignVertical="top"
                style={[styles.field, styles.particulars, styles.thPart]}
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
            placeholderTextColor={C.grey500}
            multiline
            textAlignVertical="top"
            style={[styles.field, styles.notesArea]}
          />
        </View>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.btnRow}>
          {/* <FormSubmitButton
            label={submitting ? 'Submitting…' : 'Submit diary'}
            loading={submitting}
            onPress={async () => {
              setSubmitting(true);
              try {
                const payload: InvestigationDiaryPayload = {
                  station: DEFAULT_STATION,
                  casNo,
                  entries,
                  notes,
                  investigatingOfficer: INVESTIGATING_OFFICER,
                };
                await submitFormJson('investigation_diary', payload);
              } finally {
                setSubmitting(false);
              }
            }}
          /> */}
          <Button title="Next Form" onPress={InvestigationDiary} />
        </View>

        <Pressable onPress={reset} style={styles.resetBtn}>
          <Text style={styles.resetTxt}>Clear form</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.grey50 },
  pageContent: {
    paddingBottom: 20,
    paddingHorizontal: FORM.padH,
    paddingTop: FORM.padV,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: FORM.radiusMd,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  topBar: {
    backgroundColor: C.blue,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  topBarTitle: { color: C.white, fontSize: FORM.fontTitle, fontWeight: "900" },
  subBar: {
    backgroundColor: "#12277a",
    paddingVertical: 4,
    alignItems: "center",
  },
  subBarTxt: {
    color: C.white,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "700",
  },
  body: { padding: 10 },
  sectionTitle: {
    fontSize: FORM.fontLabel + 1,
    fontWeight: "900",
    color: C.blue,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    borderBottomWidth: 2,
    borderBottomColor: C.blue,
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
    borderColor: C.blue,
    borderRadius: FORM.radiusSm,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  addBtnTxt: {
    color: C.blue,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "800",
  },
  lbl: {
    color: C.blueMuted,
    fontSize: FORM.fontLabel,
    fontWeight: "800",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  field: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: C.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: FORM.fontBody,
    color: C.black,
  },
  fieldReadonly: {
    backgroundColor: C.grey100,
    color: C.blueMuted,
  },
  fieldCompact: { fontSize: FORM.fontCaption + 1, paddingVertical: 4 },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.grey100,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.blue,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  thDate: { width: 96 },
  thPart: { flex: 1 },
  thAction: { width: 36, textAlign: "center" },
  tableRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: C.border,
    padding: 6,
    gap: 6,
    alignItems: "flex-start",
  },
  particulars: {
    minHeight: 64,
    lineHeight: FORM.lineHeight,
    paddingTop: 6,
  },
  notesArea: {
    minHeight: 72,
    lineHeight: FORM.lineHeight,
    marginBottom: 4,
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
    borderColor: C.border,
    backgroundColor: C.grey100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  completedByTxt: { color: C.blue, fontSize: FORM.fontBody, fontWeight: "700" },
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
    backgroundColor: C.border,
  },
  dotActive: { backgroundColor: C.blue },
  btnRow: { paddingHorizontal: 10, paddingBottom: 4 },
  resetBtn: { paddingBottom: 10, alignItems: "center" },
  resetTxt: { color: C.grey500, fontSize: FORM.fontCaption, fontWeight: "600" },
});
