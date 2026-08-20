import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors, FORM } from "../../constants/FormTheme";
import { submitFormJson } from "../../lib/submitFormJson";
import { FormSubmitButton } from "./FormSubmitButton";
import {
  DAY_ABBREVS,
  type DayAbbrev,
  DayOfWeekPicker,
  FormDateTimePair,
  FormDivider,
  FormField,
  FormSection,
  FormTextArea,
  formFieldStyles,
  formScreen,
} from "./FormFields";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export function StatementReview() {
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
  const backendFormData = formsData ? JSON.parse(formsData) : {};

  const router = useRouter();
  const [Cstation, setCStation] = useState(
    backendFormData?.investigationDiary?.station?.toUpperCase() ?? "",
  );
  const [caseNumber, setCaseNumber] = useState(
    backendFormData?.caseNumber ?? "",
  );

  const [certainDate, setCertainDate] = useState(
    backendFormData?.statement?.whenCertain?.date ?? "",
  );
  const [certainTime, setCertainTime] = useState(
    backendFormData?.statement?.whenCertain?.time ?? "",
  );

  const [rangeFromDate, setRangeFromDate] = useState(
    backendFormData?.statement?.whenUncertainRange?.from?.date ?? "",
  );
  const [rangeFromTime, setRangeFromTime] = useState(
    backendFormData?.statement?.whenUncertainRange?.from?.time ?? "",
  );
  const [rangeToDate, setRangeToDate] = useState(
    backendFormData?.statement?.whenUncertainRange?.to?.date ?? "",
  );
  const [rangeToTime, setRangeToTime] = useState(
    backendFormData?.statement?.whenUncertainRange?.to?.time ?? "",
  );

  function normalizeDayOfWeek(value: unknown): DayAbbrev | null {
    if (typeof value !== "string" || !value.trim()) return null;

    // handles "Monday", "MON", "mon", "Mon" — all normalize to the same 3-letter key
    const short = value.trim().slice(0, 3).toLowerCase();

    const match = DAY_ABBREVS.find((day) => day.toLowerCase() === short);
    return match ?? null;
  }
  const [dayOfWeek, setDayOfWeek] = useState<DayAbbrev | null>(() => {
    return normalizeDayOfWeek(backendFormData?.statement?.dayOfWeek) ?? null;
  });

  const [offence, setOffence] = useState(
    backendFormData?.statement?.offenceDescription ?? "",
  );
  const [method, setMethod] = useState(
    backendFormData?.statement?.methodEntrance ?? "",
  );
  const [instrument, setInstrument] = useState(
    backendFormData?.statement?.instrumentType ?? "",
  );

  const [loc, setLoc] = useState(() => {
    const empty = {
      betweenA: "",
      betweenB: "",
      street: "",
      building: "",
      suburb: "",
      town: "",
    };
    if (!backendFormData?.statement?.scene) return empty;
    try {
      const parsed = JSON.parse(backendFormData?.statement?.scene);
      return { ...empty, ...parsed };
    } catch {
      return empty;
    }
  });
  const [postalCode, setPostalCode] = useState(
    backendFormData?.statement?.postalCode ?? "",
  );
  const [geoBlock, setGeoBlock] = useState(
    backendFormData?.statement?.geographicalBlock ?? "",
  );
  const [premType, setPremType] = useState(
    backendFormData?.statement?.premisesType ?? "",
  );

  const [footDate, setFootDate] = useState(
    backendFormData?.statement?.footerDate ?? "",
  );
  const [footSig, setFootSig] = useState(
    backendFormData?.statement?.footerSignature ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const buildPayload = () => ({
    station: Cstation,
    caseNumber,
    whenCertain: {
      description: "Victim is certain when the offence occurred",
      date: certainDate,
      time: certainTime,
    },
    whenUncertainRange: {
      description: "Victim is not certain — approximate date/time range",
      from: { date: rangeFromDate, time: rangeFromTime },
      to: { date: rangeToDate, time: rangeToTime },
    },
    dayOfWeek,
    offenceDescription: offence,
    methodEntrance: method,
    instrumentType: instrument,
    scene: loc,
    postalCode,
    geographicalBlock: geoBlock,
    premisesType: premType,
    footerDate: footDate,
    footerSignature: footSig,
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={formScreen.page}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={formScreen.pageContent}
      >
        <View style={formScreen.card}>
          <View style={styles.headerRow}>
            <Text style={styles.headerSmall}>
              SOUTH AFRICAN{"\n"}POLICE SERVICE
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>SAPS</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerSmall}>
                SUID-AFRIKAANSE{"\n"}POLISIEDIENS
              </Text>
              <Text style={styles.partA}>Part A / Deel A</Text>
            </View>
          </View>

          <Text style={styles.mainTitle}>
            STATEMENT REVIEW • VERKLARING OORSIG
          </Text>

          <FormField
            label="Station / Stasie"
            value={Cstation}
            onChangeText={setCStation}
          />
          <FormField
            label="CAS no / MAS no"
            value={caseNumber}
            onChangeText={setCaseNumber}
          />

          <FormSection
            title="Particulars of offence / incident"
            hint="BESONDERHEDE VAN MISDRYF / VOORVAL"
          >
            <Text style={formFieldStyles.blockTitle}>
              When the victim is certain of the date and time
            </Text>
            <Text style={formFieldStyles.sectionHint}>
              At / Op — use when the complainant can state exactly when the
              offence happened.
            </Text>
            <FormDateTimePair
              dateLabel="Date / Datum"
              timeLabel="Time / Tyd"
              date={certainDate}
              time={certainTime}
              onDateChange={setCertainDate}
              onTimeChange={setCertainTime}
            />

            <Text style={[formFieldStyles.blockTitle, { marginTop: 10 }]}>
              When the victim is not certain (date/time range)
            </Text>
            <Text style={formFieldStyles.sectionHint}>
              Between / Tussen … and / en … — earliest and latest possible date
              and time.
            </Text>
            <FormDateTimePair
              dateLabel="From date"
              timeLabel="From time"
              date={rangeFromDate}
              time={rangeFromTime}
              onDateChange={setRangeFromDate}
              onTimeChange={setRangeFromTime}
            />
            <FormDateTimePair
              dateLabel="To date"
              timeLabel="To time"
              date={rangeToDate}
              time={rangeToTime}
              onDateChange={setRangeToDate}
              onTimeChange={setRangeToTime}
            />

            <DayOfWeekPicker value={dayOfWeek} onChange={setDayOfWeek} />

            <Text style={[formFieldStyles.blockTitle, { marginTop: 4 }]}>
              Incident details
            </Text>
            <FormTextArea
              label="Description of offence/incident • Beskrywing"
              value={offence}
              onChangeText={setOffence}
              minLines={2}
            />
            <FormTextArea
              label="Method used / entrance gained • Metode / toegang"
              value={method}
              onChangeText={setMethod}
              minLines={2}
            />
            <FormTextArea
              label="Type of instrument used • Tipe instrument"
              value={instrument}
              onChangeText={setInstrument}
              minLines={2}
            />
          </FormSection>

          <FormSection title="Scene of crime" hint="TONEEL VAN MISDAAD">
            <FormField
              label="Between: name of place / Tussen: naam van plek"
              value={loc.betweenA}
              onChangeText={(t) => setLoc({ ...loc, betweenA: t })}
            />
            <FormField
              label="And: name of place / En: naam van plek"
              value={loc.betweenB}
              onChangeText={(t) => setLoc({ ...loc, betweenB: t })}
            />

            <FormDivider text="Or / Of" />

            <FormField
              label="Street name / Straatnaam"
              value={loc.street}
              onChangeText={(t) => setLoc({ ...loc, street: t })}
            />
            <FormField
              label="Building / farm / plot / place • Gebou / plaas / plot / plek"
              value={loc.building}
              onChangeText={(t) => setLoc({ ...loc, building: t })}
            />
            <FormField
              label="Suburb / extension / area • Voorstad / uitbreiding / gebied"
              value={loc.suburb}
              onChangeText={(t) => setLoc({ ...loc, suburb: t })}
            />
            <FormField
              label="Town / city • Dorp / stad"
              value={loc.town}
              onChangeText={(t) => setLoc({ ...loc, town: t })}
            />

            <View style={formFieldStyles.row}>
              <View style={formFieldStyles.col}>
                <FormField
                  label="Postal code / Poskode"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="e.g. 2001"
                  keyboardType="number-pad"
                />
              </View>
              <View style={formFieldStyles.col}>
                <FormField
                  label="Geographical block no"
                  value={geoBlock}
                  onChangeText={setGeoBlock}
                  placeholder="Block number"
                />
              </View>
            </View>

            <FormField
              label="Type of premises / Tipe perseel"
              value={premType}
              onChangeText={setPremType}
            />
          </FormSection>

          <View style={styles.footerBlock}>
            <FormField
              label="Date / Datum"
              value={footDate}
              onChangeText={setFootDate}
            />
            <FormField
              label="Signature / Handtekening"
              value={footSig}
              onChangeText={setFootSig}
            />
          </View>

          <View style={styles.footerMetaRow}>
            <Text style={styles.meta}>Revision 1.0 Dated 2006-10-24</Text>
            <Text style={styles.meta}>Page 3</Text>
          </View>

          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.btnRow}>
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
                      const result = await submitFormJson(
                        "statement",
                        buildPayload(),
                        {
                          caseNumber: caseNumber,
                        },
                      );
                      if (!result.ok) {
                        return;
                      }
                      setVerified(true);
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
                      pathname: "/ModusOperandiScreenReview",
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
                      },
                    });
                  }}
                />
              </View>
            </View>
          </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  headerSmall: {
    flex: 1,
    color: Colors.blue,
    fontWeight: "900",
    fontSize: 9,
    lineHeight: 12,
  },
  headerRight: { flex: 1, alignItems: "flex-end" },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.blue,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.grey100,
  },
  badgeTxt: { fontWeight: "900", color: Colors.blue, fontSize: 10 },
  partA: {
    marginTop: 2,
    color: Colors.blueMuted,
    fontWeight: "800",
    fontSize: FORM.fontCaption + 0.5,
  },
  mainTitle: {
    textAlign: "center",
    fontSize: FORM.fontTitle,
    fontWeight: "900",
    color: Colors.black,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  footerBlock: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: { color: Colors.grey500, fontSize: FORM.fontCaption },
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
  dualBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
  btnRow: { paddingHorizontal: 10, paddingBottom: 4 },
});
