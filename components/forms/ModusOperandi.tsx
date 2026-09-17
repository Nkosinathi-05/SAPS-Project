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
import { UnderlineField, YesNoRow } from "./FormBits";
import { FormSubmitButton } from "./FormSubmitButton";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const LINE = FORM.lineHeight;

export type ModusSuspect = {
  involved: string;
  description: string;
};

function emptySuspect(): ModusSuspect {
  return { involved: "", description: "" };
}

const CHECKLIST_QUESTIONS = [
  "Does A1 contain all the elements of the crime?",
  "Does A1 contain full description of witness?",
  "Does A1 contain full description of suspects?",
  "Does A1 contain full description of crime scene?",
  "Does A1 contain full description of the exhibits?",
  "Does A1 contain the correct affidavit/commission of oath?",
];

export function ModusOperandi() {
  const [cas, setCas] = useState("");
  const [ir, setIr] = useState("");
  const [offence, setOffence] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [method, setMethod] = useState("");
  const [instrument, setInstrument] = useState("");
  const [property, setProperty] = useState("");
  const [serial, setSerial] = useState("");
  const [suspects, setSuspects] = useState<ModusSuspect[]>([emptySuspect()]);
  const [witness, setWitness] = useState("");
  const [circulationNo, setCirculationNo] = useState("");
  const [lcrcNo, setLcrcNo] = useState("");
  const [sap13No, setSap13No] = useState("");
  const [sap14No, setSap14No] = useState("");
  const [comments, setComments] = useState("");
  const [compiledNo, setCompiledNo] = useState("");
  const [compiledRank, setCompiledRank] = useState("");
  const [compiledName, setCompiledName] = useState("");
  const [perusedNo, setPerusedNo] = useState("");
  const [perusedRank, setPerusedRank] = useState("");
  const [perusedSig, setPerusedSig] = useState("");

  const [q, setQ] = useState<(null | "yes" | "no")[]>(Array(6).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const addSuspect = () => setSuspects((prev) => [...prev, emptySuspect()]);

  const updateSuspect = (
    index: number,
    field: keyof ModusSuspect,
    value: string,
  ) => {
    setSuspects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSuspect = (index: number) => {
    if (suspects.length <= 1) return;
    setSuspects((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPayload = () => ({
    cas,
    ir,
    A_offence: offence,
    B_date: date,
    C_time: time,
    D_place: place,
    E_methodUsed: method,
    F_instrumentUsed: instrument,
    G_propertyInvolvedAndValue: property,
    H_serialOrRegistrationNo: serial,
    I_suspects: suspects,
    J_witnessDetails: witness,
    K_circulationNo: circulationNo,
    K_lcrcNo: lcrcNo,
    L_sap13No: sap13No,
    L_sap14No: sap14No,
    M_comments: comments,
    N_compiledBy: {
      no: compiledNo,
      rank: compiledRank,
      initialAndSurname: compiledName,
    },
    O_perusedBy: {
      no: perusedNo,
      rank: perusedRank,
      initialAndSignature: perusedSig,
    },
    checklist: q.map((v, i) => ({ question: i + 1, answer: v })),
  });

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

    const suspectsHtml = suspects
      .map(
        (s, i) => `
          <div class="suspect-card">
            <div class="suspect-num">Suspect ${i + 1}</div>
            <div class="sublbl">Involved</div>
            <div class="value">${escapeHtml(s.involved) || "&nbsp;"}</div>
            <div class="sublbl" style="margin-top:6px;">Description</div>
            <div class="value" style="min-height:40px;">${escapeHtml(s.description) || "&nbsp;"}</div>
          </div>
        `,
      )
      .join("");

    const checklistHtml = CHECKLIST_QUESTIONS.map((text, i) => {
      const answer = q[i];
      return `
        <div class="q-row">
          <div class="q-text">${i + 1}. ${escapeHtml(text)}</div>
          <div class="q-box ${answer === "yes" ? "q-active" : ""}">YES</div>
          <div class="q-box ${answer === "no" ? "q-active" : ""}">NO</div>
        </div>
      `;
    }).join("");

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
              font-size: 11.5px;
              line-height: 1.5;
            }

            .top-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            }

            .top-header .side {
              flex: 1;
              font-weight: 900;
              font-size: 9px;
              line-height: 12px;
              color: #1d4ed8;
            }

            .top-header .side.right {
              text-align: right;
            }

            .badge {
              width: 52px;
              height: 52px;
              min-width: 52px;
              border-radius: 999px;
              border: 1.5px solid #1d4ed8;
              background: #f3f5fa;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }

            .badge-top {
              font-weight: 900;
              color: #1d4ed8;
              font-size: 10px;
            }

            .badge-sub {
              margin-top: 1px;
              font-size: 6.5px;
              color: #111111;
              font-weight: 700;
            }

            .hr {
              height: 1px;
              background: #cccccc;
              margin-top: 8px;
            }

            .double-rule {
              height: 1px;
              background: #111111;
              margin-top: 3px;
            }

            .title {
              text-align: center;
              font-weight: 900;
              font-size: 16px;
              margin: 6px 0;
            }

            .ref-row {
              display: flex;
              gap: 12px;
              margin-top: 8px;
              margin-bottom: 6px;
            }

            .ref-row .col {
              flex: 1;
            }

            .lbl {
              color: #4b6bb5;
              font-weight: 800;
              font-size: 10.5px;
              margin-bottom: 2px;
            }

            .sublbl {
              color: #777777;
              font-size: 9.5px;
              font-weight: 700;
              margin-bottom: 2px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }

            .value {
              border: 1px solid #999999;
              border-radius: 4px;
              background: #fafafa;
              padding: 6px 9px;
              min-height: 14px;
              white-space: pre-wrap;
              word-wrap: break-word;
              margin-bottom: 8px;
            }

            .row2 {
              display: flex;
              gap: 10px;
            }

            .row2 .col {
              flex: 1;
            }

            .suspects-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 6px;
              margin-bottom: 6px;
            }

            .suspect-card {
              border: 1px solid #cccccc;
              border-radius: 6px;
              background: #fafafa;
              padding: 8px;
              margin-bottom: 8px;
            }

            .suspect-num {
              font-weight: 900;
              color: #1d4ed8;
              font-size: 11px;
              margin-bottom: 6px;
            }

            .hr-blue {
              height: 2px;
              background: #1d4ed8;
              border-radius: 2px;
              margin: 10px 0;
            }

            .row3 {
              display: flex;
              gap: 8px;
              margin-bottom: 10px;
            }

            .row3 .col-1 { flex: 0.95; }
            .row3 .col-2 { flex: 0.75; }
            .row3 .col-3 { flex: 1.4; }

            .underline-field .lbl {
              margin-bottom: 3px;
            }

            .underline-value {
              border-bottom: 1px solid #999999;
              padding: 4px 2px;
              min-height: 14px;
            }

            .checklist {
              border: 1px solid #cccccc;
              border-radius: 6px;
              overflow: hidden;
              margin: 8px 0 14px 0;
            }

            .checklist-head {
              display: flex;
              background: #eeeeee;
              border-bottom: 1px solid #cccccc;
              font-weight: 900;
              font-size: 9.5px;
              padding: 5px 8px;
            }

            .checklist-head .spacer { flex: 1; }
            .checklist-head .yn { width: 44px; text-align: center; }

            .q-row {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 6px 8px;
              border-bottom: 1px solid #eeeeee;
              font-size: 10px;
            }

            .q-text {
              flex: 1;
            }

            .q-box {
              width: 40px;
              text-align: center;
              border: 1px solid #cccccc;
              border-radius: 4px;
              padding: 3px 0;
              font-size: 9px;
              font-weight: 800;
              color: #888888;
            }

            .q-box.q-active {
              background: #1d4ed8;
              border-color: #1d4ed8;
              color: #ffffff;
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

          <div class="top-header">
            <div class="side left">SUID-AFRIKAANSE<br/>POLISIEDIENS</div>
            <div class="badge">
              <div class="badge-top">SAPS</div>
              <div class="badge-sub">EMBLEM</div>
            </div>
            <div class="side right">SOUTH AFRICAN<br/>POLICE SERVICE</div>
          </div>

          <div class="hr"></div>
          <div class="double-rule"></div>
          <div class="title">MODUS OPERANDI 8.1.1.1</div>
          <div class="double-rule"></div>

          <div class="ref-row">
            <div class="col">
              <div class="lbl">SAPS Brixton CAS</div>
              <div class="value">${escapeHtml(cas) || "&nbsp;"}</div>
            </div>
            <div class="col">
              <div class="lbl">IR No</div>
              <div class="value">${escapeHtml(ir) || "&nbsp;"}</div>
            </div>
          </div>

          <div class="lbl">A. Offence</div>
          <div class="value">${escapeHtml(offence) || "&nbsp;"}</div>

          <div class="row2">
            <div class="col">
              <div class="lbl">B. Date</div>
              <div class="value">${escapeHtml(date) || "&nbsp;"}</div>
            </div>
            <div class="col">
              <div class="lbl">C. Time</div>
              <div class="value">${escapeHtml(time) || "&nbsp;"}</div>
            </div>
          </div>

          <div class="lbl">D. Place</div>
          <div class="value">${escapeHtml(place) || "&nbsp;"}</div>

          <div class="lbl">E. Method Used</div>
          <div class="value">${escapeHtml(method) || "&nbsp;"}</div>

          <div class="lbl">F. Instrument Used</div>
          <div class="value">${escapeHtml(instrument) || "&nbsp;"}</div>

          <div class="lbl">G. Property Involved &amp; Value</div>
          <div class="value" style="min-height:40px;">${escapeHtml(property) || "&nbsp;"}</div>

          <div class="lbl">H. Serial/Registration No</div>
          <div class="value">${escapeHtml(serial) || "&nbsp;"}</div>

          <div class="suspects-header">
            <div class="lbl" style="margin-bottom:0;">I. Suspects</div>
          </div>
          ${suspectsHtml}

          <div class="lbl">J. Witness/Details</div>
          <div class="value">${escapeHtml(witness) || "&nbsp;"}</div>

          <div class="row2">
            <div class="col">
              <div class="lbl">K. Circulation No</div>
              <div class="underline-value">${escapeHtml(circulationNo) || "&nbsp;"}</div>
            </div>
            <div class="col">
              <div class="lbl">LCRC No</div>
              <div class="underline-value">${escapeHtml(lcrcNo) || "&nbsp;"}</div>
            </div>
          </div>

          <div class="row2" style="margin-top:10px;">
            <div class="col">
              <div class="lbl">L. SAP 13 No</div>
              <div class="underline-value">${escapeHtml(sap13No) || "&nbsp;"}</div>
            </div>
            <div class="col">
              <div class="lbl">SAP 14 No</div>
              <div class="underline-value">${escapeHtml(sap14No) || "&nbsp;"}</div>
            </div>
          </div>

          <div class="lbl" style="margin-top:10px;">M. COMMENTS</div>
          <div class="value" style="min-height:70px;">${escapeHtml(comments) || "&nbsp;"}</div>

          <div class="hr-blue"></div>

          <div class="row3">
            <div class="col-1">
              <div class="lbl">N. Compiled by No</div>
              <div class="underline-value">${escapeHtml(compiledNo) || "&nbsp;"}</div>
            </div>
            <div class="col-2">
              <div class="lbl">Rank</div>
              <div class="underline-value">${escapeHtml(compiledRank) || "&nbsp;"}</div>
            </div>
            <div class="col-3">
              <div class="lbl">Initial &amp; Surname</div>
              <div class="underline-value">${escapeHtml(compiledName) || "&nbsp;"}</div>
            </div>
          </div>

          <div class="checklist">
            <div class="checklist-head">
              <div class="spacer"></div>
              <div class="yn">YES</div>
              <div class="yn">NO</div>
            </div>
            ${checklistHtml}
          </div>

          <div class="row3">
            <div class="col-1">
              <div class="lbl">O. Perused by No</div>
              <div class="underline-value">${escapeHtml(perusedNo) || "&nbsp;"}</div>
            </div>
            <div class="col-2">
              <div class="lbl">Rank</div>
              <div class="underline-value">${escapeHtml(perusedRank) || "&nbsp;"}</div>
            </div>
            <div class="col-3">
              <div class="lbl">Initial &amp; Signature</div>
              <div class="underline-value">${escapeHtml(perusedSig) || "&nbsp;"}</div>
            </div>
          </div>

          <div class="footer">
            <span>Revision 1.0 Dated 2006-10-24</span>
            <span>Page 4</span>
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
          dialogTitle: "Modus Operandi PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        console.log("PDF created at:", uri);
      }
    } catch (error) {
      console.error("Modus Operandi PDF generation failed:", error);

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
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={generatePDF}
            disabled={generatingPDF}
            style={styles.downloadIconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {generatingPDF ? (
              <ActivityIndicator size="small" color={C.black} />
            ) : (
              <Feather name="download" size={20} color={C.black} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.headerLeft}>
            SUID-AFRIKAANSE{"\n"}POLISIEDIENS
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTop}>SAPS</Text>
            <Text style={styles.badgeSub}>EMBLEM</Text>
          </View>
          <Text style={styles.headerRight}>
            SOUTH AFRICAN{"\n"}POLICE SERVICE
          </Text>
        </View>

        <View style={styles.hr} />
        <View style={styles.doubleRule} />
        <Text style={styles.title}>MODUS OPERANDI 8.1.1.1</Text>
        <View style={styles.doubleRule} />

        <View style={styles.refRow}>
          <View style={{ flex: 1, paddingRight: 6 }}>
            <Text style={styles.refLbl}>SAPS Brixton CAS</Text>
            <TextInput
              value={cas}
              onChangeText={setCas}
              style={styles.refInput}
            />
          </View>
          <View style={{ flex: 1, paddingLeft: 6 }}>
            <Text style={styles.refLbl}>IR No</Text>
            <TextInput
              value={ir}
              onChangeText={setIr}
              style={styles.refInput}
            />
          </View>
        </View>

        <Field label="A. Offence" value={offence} onChangeText={setOffence} />

        <View style={styles.row2}>
          <View style={styles.col}>
            <Field
              label="B. Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.col}>
            <Field
              label="C. Time"
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
            />
          </View>
        </View>
        <Field label="D. Place" value={place} onChangeText={setPlace} />

        <Field label="E. Method Used" value={method} onChangeText={setMethod} />
        <Field
          label="F. Instrument Used"
          value={instrument}
          onChangeText={setInstrument}
        />
        <Labeled label="G. Property Involved & Value">
          <Multiline value={property} onChangeText={setProperty} lines={3} />
        </Labeled>
        <Field
          label="H. Serial/Registration No"
          value={serial}
          onChangeText={setSerial}
        />

        <View style={styles.suspectsHeader}>
          <Text style={styles.lbl}>I. Suspects</Text>
          <Pressable
            onPress={addSuspect}
            style={styles.addBtn}
            accessibilityRole="button"
          >
            <Text style={styles.addBtnTxt}>+ Add suspect</Text>
          </Pressable>
        </View>

        {suspects.map((suspect, i) => (
          <View key={i} style={styles.suspectCard}>
            <View style={styles.suspectCardHead}>
              <Text style={styles.suspectNum}>Suspect {i + 1}</Text>
              {suspects.length > 1 ? (
                <Pressable
                  onPress={() => removeSuspect(i)}
                  style={styles.removeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove suspect ${i + 1}`}
                >
                  <Text style={styles.removeTxt}>✕</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.sublbl}>Involved</Text>
            <TextInput
              value={suspect.involved}
              onChangeText={(t) => updateSuspect(i, "involved", t)}
              placeholder="Name, alias, role…"
              placeholderTextColor={C.grey500}
              style={styles.single}
            />
            <Text style={[styles.sublbl, { marginTop: 6 }]}>Description</Text>
            <TextInput
              value={suspect.description}
              onChangeText={(t) => updateSuspect(i, "description", t)}
              placeholder="Physical description, clothing, marks…"
              placeholderTextColor={C.grey500}
              multiline
              textAlignVertical="top"
              style={[styles.ml, { minHeight: LINE * 3 + 8 }]}
            />
          </View>
        ))}

        <Field
          label="J. Witness/Details"
          value={witness}
          onChangeText={setWitness}
        />

        <View style={styles.row2}>
          <UnderlineField
            label="K. Circulation No"
            value={circulationNo}
            onChangeText={setCirculationNo}
          />
          <UnderlineField
            label="LCRC No"
            value={lcrcNo}
            onChangeText={setLcrcNo}
          />
        </View>

        <View style={styles.row2}>
          <UnderlineField
            label="L. SAP 13 No"
            value={sap13No}
            onChangeText={setSap13No}
          />
          <UnderlineField
            label="SAP 14 No"
            value={sap14No}
            onChangeText={setSap14No}
          />
        </View>

        <Labeled label="M. COMMENTS">
          <Multiline value={comments} onChangeText={setComments} lines={6} />
        </Labeled>

        <View style={styles.hrBlue} />

        <View style={styles.row3}>
          <UnderlineField
            label="N. Compiled by No"
            value={compiledNo}
            onChangeText={setCompiledNo}
            flex={0.95}
          />
          <UnderlineField
            label="Rank"
            value={compiledRank}
            onChangeText={setCompiledRank}
            flex={0.75}
          />
          <UnderlineField
            label="Initial & Surname"
            value={compiledName}
            onChangeText={setCompiledName}
            flex={1.4}
          />
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 1 }]} />
            <Text style={[styles.th, { width: 44, textAlign: "center" }]}>
              YES
            </Text>
            <Text style={[styles.th, { width: 44, textAlign: "center" }]}>
              NO
            </Text>
          </View>

          <YesNoRow
            n={1}
            text="Does A1 contain all the elements of the crime?"
            value={q[0]}
            onChange={(v) => {
              const x = [...q];
              x[0] = v;
              setQ(x);
            }}
          />
          <YesNoRow
            n={2}
            text="Does A1 contain full description of witness?"
            value={q[1]}
            onChange={(v) => {
              const x = [...q];
              x[1] = v;
              setQ(x);
            }}
          />
          <YesNoRow
            n={3}
            text="Does A1 contain full description of suspects?"
            value={q[2]}
            onChange={(v) => {
              const x = [...q];
              x[2] = v;
              setQ(x);
            }}
          />
          <YesNoRow
            n={4}
            text="Does A1 contain full description of crime scene?"
            value={q[3]}
            onChange={(v) => {
              const x = [...q];
              x[3] = v;
              setQ(x);
            }}
          />
          <YesNoRow
            n={5}
            text="Does A1 contain full description of the exhibits?"
            value={q[4]}
            onChange={(v) => {
              const x = [...q];
              x[4] = v;
              setQ(x);
            }}
          />
          <YesNoRow
            n={6}
            text="Does A1 contain the correct affidavit/commission of oath?"
            value={q[5]}
            onChange={(v) => {
              const x = [...q];
              x[5] = v;
              setQ(x);
            }}
          />
        </View>

        <View style={styles.row3}>
          <UnderlineField
            label="O. Perused by No"
            value={perusedNo}
            onChangeText={setPerusedNo}
            flex={0.95}
          />
          <UnderlineField
            label="Rank"
            value={perusedRank}
            onChangeText={setPerusedRank}
            flex={0.75}
          />
          <UnderlineField
            label="Initial & Signature"
            value={perusedSig}
            onChangeText={setPerusedSig}
            flex={1.4}
          />
        </View>

        <View style={styles.footerMetaRow}>
          <Text style={styles.meta}>Revision 1.0 Dated 2006-10-24</Text>
          <Text style={styles.meta}>Page 4</Text>
        </View>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i === 3 && styles.dotActive]} />
          ))}
        </View>

        <FormSubmitButton
          label="Submit Forms"
          loading={submitting}
          onPress={async () => {
            setSubmitting(true);
            try {
              await submitFormJson("modus_operandi", buildPayload());
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.lbl}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.grey500}
        style={styles.single}
      />
    </View>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.lbl}>{label}</Text>
      {children}
    </View>
  );
}

function Multiline({
  value,
  onChangeText,
  lines,
}: {
  value: string;
  onChangeText: (t: string) => void;
  lines: number;
}) {
  return (
    <TextInput
      multiline
      value={value}
      onChangeText={onChangeText}
      textAlignVertical="top"
      style={[styles.ml, { minHeight: LINE * lines + 8 }]}
    />
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
    padding: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 6,
  },
  downloadIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    color: C.blue,
    fontWeight: "900",
    fontSize: 9,
    lineHeight: 12,
  },
  headerRight: {
    flex: 1,
    textAlign: "right",
    color: C.blue,
    fontWeight: "900",
    fontSize: 9,
    lineHeight: 12,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.grey100,
  },
  badgeTop: { fontWeight: "900", color: C.blue, fontSize: 10 },
  badgeSub: { marginTop: 1, fontSize: 7, color: C.black, fontWeight: "700" },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginTop: 8,
  },
  hrBlue: {
    height: 2,
    backgroundColor: C.blue,
    marginVertical: 8,
    borderRadius: 2,
  },
  doubleRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.black,
    marginTop: 3,
  },
  title: {
    textAlign: "center",
    fontWeight: "900",
    color: C.black,
    marginVertical: 6,
    fontSize: FORM.fontTitle,
  },
  refRow: { flexDirection: "row", marginTop: 6, marginBottom: 4 },
  refLbl: {
    color: C.blueMuted,
    fontWeight: "800",
    fontSize: FORM.fontLabel,
    marginBottom: 2,
  },
  refInput: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: C.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: FORM.fontBody,
    color: C.black,
  },
  lbl: {
    color: C.blueMuted,
    fontWeight: "800",
    fontSize: FORM.fontLabel,
    marginBottom: 2,
  },
  sublbl: {
    color: C.grey500,
    fontSize: FORM.fontCaption,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  single: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: C.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: FORM.fontBody,
    color: C.black,
  },
  ml: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.inputBg,
    borderRadius: FORM.radiusSm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: FORM.fontBody,
    lineHeight: LINE,
    color: C.black,
  },
  row2: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  row3: { flexDirection: "row", gap: 6, alignItems: "flex-end" },
  suspectsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 6,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: C.blue,
    borderRadius: FORM.radiusSm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addBtnTxt: {
    color: C.blue,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "800",
  },
  suspectCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: C.grey50,
    padding: 8,
    marginBottom: 8,
  },
  suspectCardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  suspectNum: { fontSize: FORM.fontBody, fontWeight: "900", color: C.blue },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  removeTxt: { color: "#DC2626", fontSize: 13, fontWeight: "900" },
  table: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: FORM.radiusSm,
    marginTop: 6,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: C.border,
    backgroundColor: C.grey200,
  },
  th: { paddingVertical: 4, fontWeight: "900", color: C.black, fontSize: 10 },
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
  footerMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: { color: C.grey500, fontSize: FORM.fontCaption },
});
