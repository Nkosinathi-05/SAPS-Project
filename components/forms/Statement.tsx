import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors, FORM } from "../../constants/FormTheme";
import { submitFormJson } from "../../lib/submitFormJson";
import { FormSubmitButton } from "./FormSubmitButton";
import {
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

export function Statement() {
  const {
    victName,
    language,
    victStatement,
    victInitials,
    victEntries,
    casNumber,
    stationNam,
    Detective,
    Notes,
  } = useLocalSearchParams<{
    victName: string;
    language: string;
    victStatement: string;
    victInitials: string;
    victEntries: string;
    casNumber: string;
    stationNam: string;
    Detective: string;
    Notes: string;
  }>();
  const router = useRouter();
  const [station, setStation] = useState("");

  const [certainDate, setCertainDate] = useState("");
  const [certainTime, setCertainTime] = useState("");

  const [rangeFromDate, setRangeFromDate] = useState("");
  const [rangeFromTime, setRangeFromTime] = useState("");
  const [rangeToDate, setRangeToDate] = useState("");
  const [rangeToTime, setRangeToTime] = useState("");

  const [dayOfWeek, setDayOfWeek] = useState<DayAbbrev | null>(null);
  const [cas, setCase] = useState("");
  const [offence, setOffence] = useState("");
  const [method, setMethod] = useState("");
  const [instrument, setInstrument] = useState("");

  const [loc, setLoc] = useState({
    betweenA: "",
    betweenB: "",
    street: "",
    building: "",
    suburb: "",
    town: "",
  });
  const [postalCode, setPostalCode] = useState("");
  const [geoBlock, setGeoBlock] = useState("");
  const [premType, setPremType] = useState("");

  const [footDate, setFootDate] = useState("");
  const [footSig, setFootSig] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const buildPayload = () => ({
    station,
    casNumber,
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

        <Text style={styles.mainTitle}>STATEMENT • VERKLARING</Text>

        <FormField
          label="Station / Stasie"
          value={station}
          onChangeText={setStation}
        />
        <FormField
          label="CAS no / MAS no"
          value={casNumber}
          onChangeText={setCase}
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

        <FormSubmitButton
          label="Next: Modus Operandi →"
          loading={submitting}
          onPress={async () => {
            router.push({
              pathname: "/ModusOperandiScreen",
              params: {
                victName,
                language,
                victStatement,
                victInitials,
                victEntries,
                station,
                casNumber,
                Notes,
                Detective,
                certainDate,
                certainTime,
                rangeFromDate,
                rangeFromTime,
                rangeToDate,
                rangeToTime,
                dayOfWeek: dayOfWeek ?? "",
                offence,
                method,
                instrument,
                loc: JSON.stringify(loc),
                postalCode,
                geoBlock,
                premType,
                footDate,
                footSig,
              },
            });
          }}
        />
      </View>
    </ScrollView>
  );
}

export function StatementReview() {
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
  const router = useRouter();
  const [station, setStation] = useState(stationParam ?? "");
  const [cas, setCas] = useState(casNumber ?? "");

  const [certainDate, setCertainDate] = useState(certainDateParam ?? "");
  const [certainTime, setCertainTime] = useState(certainTimeParam ?? "");

  const [rangeFromDate, setRangeFromDate] = useState(rangeFromDateParam ?? "");
  const [rangeFromTime, setRangeFromTime] = useState(rangeFromTimeParam ?? "");
  const [rangeToDate, setRangeToDate] = useState(rangeToDateParam ?? "");
  const [rangeToTime, setRangeToTime] = useState(rangeToTimeParam ?? "");

  const [dayOfWeek, setDayOfWeek] = useState<DayAbbrev | null>(
    (dayOfWeekParam as DayAbbrev) || null,
  );

  const [offence, setOffence] = useState(offenceParam ?? "");
  const [method, setMethod] = useState(methodParam ?? "");
  const [instrument, setInstrument] = useState(instrumentParam ?? "");

  const [loc, setLoc] = useState(() => {
    const empty = {
      betweenA: "",
      betweenB: "",
      street: "",
      building: "",
      suburb: "",
      town: "",
    };
    if (!locParam) return empty;
    try {
      const parsed = JSON.parse(locParam);
      return { ...empty, ...parsed };
    } catch {
      return empty;
    }
  });
  const [postalCode, setPostalCode] = useState(postalCodeParam ?? "");
  const [geoBlock, setGeoBlock] = useState(geoBlockParam ?? "");
  const [premType, setPremType] = useState(premTypeParam ?? "");

  const [footDate, setFootDate] = useState(footDateParam ?? "");
  const [footSig, setFootSig] = useState(footSigParam ?? "");
  const [submitting, setSubmitting] = useState(false);

  const buildPayload = () => ({
    station,
    cas,
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

        <Text style={styles.mainTitle}>STATEMENT • VERKLARING</Text>

        <FormField
          label="Station / Stasie"
          value={station}
          onChangeText={setStation}
        />
        <FormField
          label="CAS no / MAS no"
          value={casNumber}
          onChangeText={setCas}
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

        <FormSubmitButton
          label="Next: Modus Operandi →"
          loading={submitting}
          onPress={async () => {
            setSubmitting(true);
            try {
              await submitFormJson("statement", buildPayload());
              router.push({
                pathname: "/ModusOperandiScreen",
                params: {
                  victName,
                  language,
                  victStatement,
                  victInitials,
                  victEntries,
                  station,
                  casNumber,
                  Notes,
                  Detective,
                  certainDate,
                  certainTime,
                  rangeFromDate,
                  rangeFromTime,
                  rangeToDate,
                  rangeToTime,
                  dayOfWeek: dayOfWeek ?? "",
                  offence,
                  method,
                  instrument,
                  loc: JSON.stringify(loc),
                  postalCode,
                  geoBlock,
                  premType,
                  footDate,
                  footSig,
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
const styles = StyleSheet.create({
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
});
