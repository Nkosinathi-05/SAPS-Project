import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { C, FORM } from "../../constants/FormTheme";
import { submitFormJson } from "../../lib/submitFormJson";
import { FormSubmitButton } from "./FormSubmitButton";
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const DEFAULT_STATION = "Johannesburg Central Police Station";
const INVESTIGATING_OFFICER = "Sergeant Nkosi";

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

export function InvestigationDiary({
  onSubmit,
}: {
  onSubmit?: (data: InvestigationDiaryPayload) => Promise<void>;
}) {
  const [casNo, setCasNo] = useState("");
  const [entries, setEntries] = useState<DiaryEntry[]>([emptyEntry()]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
    setCasNo("");
    setEntries([emptyEntry()]);
    setNotes("");
  };

  const generatePDF = async () => {
    setGeneratingPDF(true);

    const escapeHtml = (value: string) =>
      (value ?? "")
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const entriesRows = entries
      .map(
        (entry) => `
          <tr>
            <td class="cell cell-date">
              <div class="input-box">${escapeHtml(entry.date) || "&nbsp;"}</div>
              <div class="input-box">${escapeHtml(entry.time) || "&nbsp;"}</div>
            </td>
            <td class="cell cell-part"><div class="input-box">${escapeHtml(entry.particulars) || "&nbsp;"}</div></td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <style>
            @page {
              size: A4;
              margin: 16mm;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111111;
              font-size: 12px;
              line-height: 1.5;
            }

            .top-bar {
              background: #1d4ed8;
              color: #ffffff;
              text-align: center;
              padding: 12px 10px;
              font-size: 18px;
              font-weight: 900;
              border-radius: 6px 6px 0 0;
            }

            .sub-bar {
              background: #12277a;
              color: #ffffff;
              text-align: center;
              padding: 5px;
              font-size: 11px;
              font-weight: 700;
            }

            .body-pad {
              border: 1px solid #d0d0d0;
              border-top: none;
              padding: 14px;
              border-radius: 0 0 6px 6px;
            }

            .section-title {
              font-size: 12px;
              font-weight: 900;
              color: #1d4ed8;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #1d4ed8;
              padding-bottom: 4px;
              margin-bottom: 10px;
              margin-top: 6px;
            }

            .row {
              display: flex;
              gap: 10px;
              margin-bottom: 14px;
            }

            .row .field {
              flex: 1;
            }

            .label {
              font-size: 10px;
              font-weight: 800;
              color: #4b6bb5;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              margin-bottom: 3px;
            }

            .value {
              border: 1px solid #999999;
              border-radius: 4px;
              padding: 7px 9px;
              min-height: 14px;
              background: #fafafa;
            }

            table.entries {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }

            table.entries th {
              background: #f0f0f0;
              border: 1px solid #cccccc;
              font-size: 10px;
              font-weight: 900;
              color: #1d4ed8;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              padding: 6px;
              text-align: left;
            }

            table.entries .th-date {
              width: 90px;
            }

            .cell {
              border: 1px solid #cccccc;
              padding: 8px;
              vertical-align: top;
              font-size: 11px;
            }

            .input-box {
              border: 1px solid #999999;
              border-radius: 4px;
              background: #fafafa;
              padding: 6px 8px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            .cell-date .input-box + .input-box {
              margin-top: 6px;
            }

            .cell-part .input-box {
              min-height: 50px;
            }

            .notes-value {
              border: 1px solid #999999;
              border-radius: 4px;
              padding: 10px;
              min-height: 60px;
              white-space: pre-wrap;
              word-wrap: break-word;
              background: #fafafa;
            }

            .completed-by {
              margin-top: 18px;
              background: #f0f0f0;
              border-top: 1px solid #cccccc;
              padding: 8px 10px;
              color: #1d4ed8;
              font-weight: 700;
              font-size: 11px;
            }

            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #999999;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #666666;
            }
          </style>
        </head>

        <body>

          <div class="top-bar">Investigation Diary</div>
          <div class="sub-bar">Case Investigation Log</div>

          <div class="body-pad">

            <div class="section-title">Case information</div>
            <div class="row">
              <div class="field">
                <div class="label">Station</div>
                <div class="value">${escapeHtml(DEFAULT_STATION)}</div>
              </div>
              <div class="field">
                <div class="label">CAS no</div>
                <div class="value">${escapeHtml(casNo) || "&nbsp;"}</div>
              </div>
            </div>

            <div class="section-title">Investigation entries</div>
            <table class="entries">
              <thead>
                <tr>
                  <th class="th-date">Date and time</th>
                  <th>Particulars of investigation</th>
                </tr>
              </thead>
              <tbody>
                ${entriesRows}
              </tbody>
            </table>

            <div class="section-title">Additional notes</div>
            <div class="notes-value">${escapeHtml(notes) || "&nbsp;"}</div>

            <div class="completed-by">
              Investigating officer: ${escapeHtml(INVESTIGATING_OFFICER)}
            </div>

            <div class="footer">
              <span>Revision 1.0 Dated 2006-10-24</span>
              <span>Page 2</span>
            </div>

          </div>

        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html,
      });

      const sharingAvailable = await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Investigation Diary PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        console.log("PDF created at:", uri);
      }
    } catch (error) {
      console.error("Investigation Diary PDF generation failed:", error);

      if (error instanceof Error) {
        console.error("ERROR MESSAGE:", error.message);
        console.error("ERROR STACK:", error.stack);
      } else {
        console.error("ERROR VALUE:", JSON.stringify(error));
      }
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <ScrollView
      style={styles.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.pageContent}
    >
      <View style={styles.card}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={generatePDF}
            disabled={generatingPDF}
            style={styles.downloadIconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {generatingPDF ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Feather name="download" size={20} color={C.white} />
            )}
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Investigation Diary</Text>

          <View style={styles.topBarSpacer} />
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
                value={casNo}
                onChangeText={setCasNo}
                placeholder="CAS No"
                placeholderTextColor={C.grey500}
                style={styles.field}
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

        <View style={styles.completedBy}>
          <Text style={styles.completedByTxt}>
            Investigating officer: {INVESTIGATING_OFFICER}
          </Text>
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

        <View style={styles.btnRow}>
          <FormSubmitButton
            label={submitting ? "Processing…" : "Next: Statement →"}
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
                if (onSubmit) {
                  await onSubmit(payload);
                } else {
                  await submitFormJson("investigation_diary", payload);
                  router.push("/StatementScreen");
                }
              } finally {
                setSubmitting(false);
              }
            }}
          />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  downloadIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  topBarSpacer: {
    width: 32,
  },
  topBarTitle: {
    color: C.white,
    fontSize: FORM.fontTitle,
    fontWeight: "900",
    textAlign: "center",
    flex: 1,
  },
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
  footerMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: { color: C.grey500, fontSize: FORM.fontCaption },
  dotActive: { backgroundColor: C.blue },
  btnRow: { paddingHorizontal: 10, paddingBottom: 4 },
  resetBtn: { paddingBottom: 10, alignItems: "center" },
  resetTxt: { color: C.grey500, fontSize: FORM.fontCaption, fontWeight: "600" },
});
