import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Colors, FORM } from "../../constants/FormTheme";
import { submitFormJson } from "../../lib/submitFormJson";
import { UnderlineField, YesNoRow } from "./FormBits";
import { FormSubmitButton } from "./FormSubmitButton";
import { useRouter, useLocalSearchParams } from "expo-router";

const LINE = FORM.lineHeight;

export type ModusSuspect = {
  involved: string;
  description: string;
};

function emptySuspect(): ModusSuspect {
  return { involved: "", description: "" };
}

export function ModusOperandi() {
  const {
    victName,
    language,
    victStatement,
    victInitials,
    victEntries,
    station: stationParam,
    casNumber,
    Notes,
    Detective,
    certainDate: certainDateParam,
    certainTime: certainTimeParam,
    rangeFromDate: rangeFromDateParam,
    rangeFromTime: rangeFromTimeParam,
    rangeToDate: rangeToDateParam,
    rangeToTime: rangeToTimeParam,
    dayOfWeek: dayOfWeekParam,
    offence: offenceParam,
    method: methodParam,
    instrument: instrumentParam,
    loc: locParam,
    postalCode: postalCodeParam,
    geoBlock: geoBlockParam,
    premType: premTypeParam,
    footDate: footDateParam,
    footSig: footSigParam,
  } = useLocalSearchParams<{
    victName: string;
    language: string;
    victStatement: string;
    victInitials: string;
    victEntries: string;
    station: string;
    casNumber: string;
    Notes: string;
    Detective: string;
    certainDate: string;
    certainTime: string;
    rangeFromDate: string;
    rangeFromTime: string;
    rangeToDate: string;
    rangeToTime: string;
    dayOfWeek: string;
    offence: string;
    method: string;
    instrument: string;
    loc: string;
    postalCode: string;
    geoBlock: string;
    premType: string;
    footDate: string;
    footSig: string;
  }>();
  const [cas, setCas] = useState(casNumber ?? "");
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
  const router = useRouter();

  const [q, setQ] = useState<(null | "yes" | "no")[]>(Array(6).fill(null));
  const [submitting, setSubmitting] = useState(false);

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
    casNumber,
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

  return (
    <ScrollView
      style={styles.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.pageContent}
    >
      <View style={styles.card}>
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
              value={casNumber}
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
              placeholderTextColor={Colors.grey500}
              style={styles.single}
            />
            <Text style={[styles.sublbl, { marginTop: 6 }]}>Description</Text>
            <TextInput
              value={suspect.description}
              onChangeText={(t) => updateSuspect(i, "description", t)}
              placeholder="Physical description, clothing, marks…"
              placeholderTextColor={Colors.grey500}
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
            const payload = buildPayload();
            router.replace({
              pathname: "/ModusOperandiScreenReview",
              params: {
                victName,
                language,
                victStatement,
                victInitials,
                victEntries,
                station: stationParam,
                casNumber,
                Notes,
                Detective,
                certainDate: certainDateParam,
                certainTime: certainTimeParam,
                rangeFromDate: rangeFromDateParam,
                rangeFromTime: rangeFromTimeParam,
                rangeToDate: rangeToDateParam,
                rangeToTime: rangeToTimeParam,
                dayOfWeek: dayOfWeekParam,
                offence: offenceParam,
                method: methodParam,
                instrument: instrumentParam,
                loc: locParam,
                postalCode: postalCodeParam,
                geoBlock: geoBlockParam,
                premType: premTypeParam,
                footDate: footDateParam,
                footSig: footSigParam,
                ir: payload.ir,
                A_offence: payload.A_offence,
                B_date: payload.B_date,
                C_time: payload.C_time,
                D_place: payload.D_place,
                E_methodUsed: payload.E_methodUsed,
                F_instrumentUsed: payload.F_instrumentUsed,
                G_propertyInvolvedAndValue: payload.G_propertyInvolvedAndValue,
                H_serialOrRegistrationNo: payload.H_serialOrRegistrationNo,
                I_suspects: JSON.stringify(payload.I_suspects),
                J_witnessDetails: payload.J_witnessDetails,
                K_circulationNo: payload.K_circulationNo,
                K_lcrcNo: payload.K_lcrcNo,
                L_sap13No: payload.L_sap13No,
                L_sap14No: payload.L_sap14No,
                M_comments: payload.M_comments,
                compiledName,
                compiledRank,
                compiledNo,
                perusedNo,
                perusedSig,
                perusedRank,

                checklist: JSON.stringify(payload.checklist),
              },
            });
          }}
        />
      </View>
    </ScrollView>
  );
}

export function ModusOperandiReview() {
  const {
    victName,
    language,
    victStatement,
    victInitials,
    victEntries,
    station: stationParam,
    casNumber,
    Notes,
    Detective,
    certainDate: certainDateParam,
    certainTime: certainTimeParam,
    rangeFromDate: rangeFromDateParam,
    rangeFromTime: rangeFromTimeParam,
    rangeToDate: rangeToDateParam,
    rangeToTime: rangeToTimeParam,
    dayOfWeek: dayOfWeekParam,
    offence: offenceParam,
    method: methodParam,
    instrument: instrumentParam,
    loc: locParam,
    postalCode: postalCodeParam,
    geoBlock: geoBlockParam,
    premType: premTypeParam,
    footDate: footDateParam,
    footSig: footSigParam,
    ir: irParam,
    A_offence,
    B_date,
    C_time,
    D_place,
    E_methodUsed,
    F_instrumentUsed,
    G_propertyInvolvedAndValue,
    H_serialOrRegistrationNo,
    I_suspects,
    J_witnessDetails,
    K_circulationNo,
    K_lcrcNo,
    L_sap13No,
    L_sap14No,
    M_comments,
    compiledName: compiledNameParam,
    compiledRank: compiledRankParam,
    compiledNo: compiledNoParam,
    perusedNo: perusedNoParam,
    perusedSig: perusedSigParam,
    perusedRank: perusedRankParam,
    checklist,
  } = useLocalSearchParams<{
    victName: string;
    language: string;
    victStatement: string;
    victInitials: string;
    victEntries: string;
    station: string;
    casNumber: string;
    Notes: string;
    Detective: string;
    certainDate: string;
    certainTime: string;
    rangeFromDate: string;
    rangeFromTime: string;
    rangeToDate: string;
    rangeToTime: string;
    dayOfWeek: string;
    offence: string;
    method: string;
    instrument: string;
    loc: string;
    postalCode: string;
    geoBlock: string;
    premType: string;
    footDate: string;
    footSig: string;
    ir: string;
    A_offence: string;
    B_date: string;
    C_time: string;
    D_place: string;
    E_methodUsed: string;
    F_instrumentUsed: string;
    G_propertyInvolvedAndValue: string;
    H_serialOrRegistrationNo: string;
    I_suspects: string; // JSON string — parse below
    J_witnessDetails: string;
    K_circulationNo: string;
    K_lcrcNo: string;
    L_sap13No: string;
    L_sap14No: string;
    M_comments: string;
    compiledName: string;
    compiledRank: string;
    compiledNo: string;
    perusedNo: string;
    perusedSig: string;
    perusedRank: string;
    checklist: string; // JSON string — parse below
  }>();
  const [cas, setCas] = useState(casNumber ?? "");
  const [ir, setIr] = useState(irParam ?? "");
  const [offence, setOffence] = useState(offenceParam ?? "");
  const [date, setDate] = useState(B_date ?? "");
  const [time, setTime] = useState(C_time ?? "");
  const [place, setPlace] = useState(D_place ?? "");
  const [method, setMethod] = useState(E_methodUsed ?? "");
  const [instrument, setInstrument] = useState(F_instrumentUsed ?? "");
  const [property, setProperty] = useState(G_propertyInvolvedAndValue ?? "");
  const [serial, setSerial] = useState(H_serialOrRegistrationNo ?? "");
  const [witness, setWitness] = useState(J_witnessDetails ?? "");
  const [circulationNo, setCirculationNo] = useState("");
  const [lcrcNo, setLcrcNo] = useState(K_lcrcNo ?? "");
  const [sap13No, setSap13No] = useState(L_sap13No ?? "");
  const [sap14No, setSap14No] = useState(L_sap14No ?? "");
  const [comments, setComments] = useState(M_comments ?? "");
  const [compiledNo, setCompiledNo] = useState(compiledNoParam ?? "");
  const [compiledRank, setCompiledRank] = useState(compiledRankParam ?? "");
  const [compiledName, setCompiledName] = useState(compiledNameParam ?? "");
  const [perusedNo, setPerusedNo] = useState(perusedNoParam ?? "");
  const [perusedRank, setPerusedRank] = useState(perusedRankParam ?? "");
  const [perusedSig, setPerusedSig] = useState(perusedRankParam ?? "");
  const router = useRouter();

  const [suspects, setSuspects] = useState<ModusSuspect[]>(() => {
    if (!I_suspects) return [emptySuspect()];
    try {
      const parsed = JSON.parse(I_suspects);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : [emptySuspect()];
    } catch {
      return [emptySuspect()];
    }
  });
  const [q, setQ] = useState<(null | "yes" | "no")[]>(() => {
    const empty = Array(6).fill(null);
    if (!checklist) return empty;
    try {
      const parsed = JSON.parse(checklist);
      if (!Array.isArray(parsed)) return empty;
      const rebuilt = Array(6).fill(null);
      parsed.forEach(
        (item: { question: number; answer: "yes" | "no" | null }) => {
          if (item.question >= 1 && item.question <= 6) {
            rebuilt[item.question - 1] = item.answer;
          }
        },
      );
      return rebuilt;
    } catch {
      return empty;
    }
  });
  const [submitting, setSubmitting] = useState(false);

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
    casNumber,
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

  return (
    <ScrollView
      style={styles.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.pageContent}
    >
      <View style={styles.card}>
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
              value={casNumber}
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
              placeholderTextColor={Colors.grey500}
              style={styles.single}
            />
            <Text style={[styles.sublbl, { marginTop: 6 }]}>Description</Text>
            <TextInput
              value={suspect.description}
              onChangeText={(t) => updateSuspect(i, "description", t)}
              placeholder="Physical description, clothing, marks…"
              placeholderTextColor={Colors.grey500}
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
              const payload = buildPayload();
              await submitFormJson("modus_operandi", buildPayload());
              router.replace({
                pathname: "/SubmittedScreen",
                params: {
                  victName,
                  language,
                  victStatement,
                  victInitials,
                  victEntries,
                  station: stationParam,
                  casNumber,
                  Notes,
                  Detective,
                  certainDate: certainDateParam,
                  certainTime: certainTimeParam,
                  rangeFromDate: rangeFromDateParam,
                  rangeFromTime: rangeFromTimeParam,
                  rangeToDate: rangeToDateParam,
                  rangeToTime: rangeToTimeParam,
                  dayOfWeek: dayOfWeekParam,
                  offence: offenceParam,
                  method: methodParam,
                  instrument: instrumentParam,
                  loc: locParam,
                  postalCode: postalCodeParam,
                  geoBlock: geoBlockParam,
                  premType: premTypeParam,
                  footDate: footDateParam,
                  footSig: footSigParam,
                  ir: payload.ir,
                  A_offence: payload.A_offence,
                  B_date: payload.B_date,
                  C_time: payload.C_time,
                  D_place: payload.D_place,
                  E_methodUsed: payload.E_methodUsed,
                  F_instrumentUsed: payload.F_instrumentUsed,
                  G_propertyInvolvedAndValue:
                    payload.G_propertyInvolvedAndValue,
                  H_serialOrRegistrationNo: payload.H_serialOrRegistrationNo,
                  I_suspects: JSON.stringify(payload.I_suspects),
                  J_witnessDetails: payload.J_witnessDetails,
                  K_circulationNo: payload.K_circulationNo,
                  K_lcrcNo: payload.K_lcrcNo,
                  L_sap13No: payload.L_sap13No,
                  L_sap14No: payload.L_sap14No,
                  M_comments: payload.M_comments,
                  N_compiledBy: JSON.stringify(payload.N_compiledBy),
                  O_perusedBy: JSON.stringify(payload.O_perusedBy),
                  checklist: JSON.stringify(payload.checklist),
                },
              });
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
        placeholderTextColor={Colors.grey500}
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
  page: { flex: 1, backgroundColor: Colors.grey50 },
  pageContent: {
    paddingBottom: 20,
    paddingHorizontal: FORM.padH,
    paddingTop: FORM.padV,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: FORM.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    color: Colors.blue,
    fontWeight: "900",
    fontSize: 9,
    lineHeight: 12,
  },
  headerRight: {
    flex: 1,
    textAlign: "right",
    color: Colors.blue,
    fontWeight: "900",
    fontSize: 9,
    lineHeight: 12,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.blue,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.grey100,
  },
  badgeTop: { fontWeight: "900", color: Colors.blue, fontSize: 10 },
  badgeSub: {
    marginTop: 1,
    fontSize: 7,
    color: Colors.black,
    fontWeight: "700",
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginTop: 8,
  },
  hrBlue: {
    height: 2,
    backgroundColor: Colors.blue,
    marginVertical: 8,
    borderRadius: 2,
  },
  doubleRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.black,
    marginTop: 3,
  },
  title: {
    textAlign: "center",
    fontWeight: "900",
    color: Colors.black,
    marginVertical: 6,
    fontSize: FORM.fontTitle,
  },
  refRow: { flexDirection: "row", marginTop: 6, marginBottom: 4 },
  refLbl: {
    color: Colors.blueMuted,
    fontWeight: "800",
    fontSize: FORM.fontLabel,
    marginBottom: 2,
  },
  refInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: Colors.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: FORM.fontBody,
    color: Colors.black,
  },
  lbl: {
    color: Colors.blueMuted,
    fontWeight: "800",
    fontSize: FORM.fontLabel,
    marginBottom: 2,
  },
  sublbl: {
    color: Colors.grey500,
    fontSize: FORM.fontCaption,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  single: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: Colors.inputBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: FORM.fontBody,
    color: Colors.black,
  },
  ml: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBg,
    borderRadius: FORM.radiusSm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: FORM.fontBody,
    lineHeight: LINE,
    color: Colors.black,
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
    borderColor: Colors.blue,
    borderRadius: FORM.radiusSm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addBtnTxt: {
    color: Colors.blue,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "800",
  },
  suspectCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FORM.radiusSm,
    backgroundColor: Colors.grey50,
    padding: 8,
    marginBottom: 8,
  },
  suspectCardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  suspectNum: {
    fontSize: FORM.fontBody,
    fontWeight: "900",
    color: Colors.blue,
  },
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
    borderColor: Colors.border,
    borderRadius: FORM.radiusSm,
    marginTop: 6,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.grey200,
  },
  th: {
    paddingVertical: 4,
    fontWeight: "900",
    color: Colors.black,
    fontSize: 10,
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
  meta: { color: Colors.grey500, fontSize: FORM.fontCaption },
});
