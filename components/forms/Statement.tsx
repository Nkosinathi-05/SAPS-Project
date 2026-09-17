import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { C, FORM } from "../../constants/FormTheme";
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
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export function Statement() {
  const router = useRouter();
  const [station, setStation] = useState("");
  const [cas, setCas] = useState("");

  const [certainDate, setCertainDate] = useState("");
  const [certainTime, setCertainTime] = useState("");

  const [rangeFromDate, setRangeFromDate] = useState("");
  const [rangeFromTime, setRangeFromTime] = useState("");
  const [rangeToDate, setRangeToDate] = useState("");
  const [rangeToTime, setRangeToTime] = useState("");

  const [dayOfWeek, setDayOfWeek] = useState<DayAbbrev | null>(null);

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
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <style>
            @page {
              size: A4;
              margin: 18mm;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111111;
              font-size: 12px;
              line-height: 1.5;
            }

            /* ---- Top header: matches app's headerRow ---- */
            .top-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              margin-bottom: 10px;
            }

            .top-header .side {
              flex: 1;
              font-weight: 900;
              font-size: 10px;
              line-height: 13px;
              color: #1d4ed8;
            }

            .top-header .side.right {
              text-align: right;
            }

            .part-a {
              margin-top: 3px;
              font-weight: 800;
              font-size: 10px;
              color: #4b6bb5;
            }

            .badge {
              width: 50px;
              height: 50px;
              min-width: 50px;
              border-radius: 999px;
              border: 2px solid #1d4ed8;
              background: #f3f5fa;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 11px;
              color: #1d4ed8;
            }

            /* ---- Main title: matches app's mainTitle ---- */
            .title {
              text-align: center;
              font-size: 22px;
              font-weight: 900;
              color: #111111;
              margin: 6px 0 16px 0;
              padding-bottom: 10px;
              border-bottom: 1px solid #d0d0d0;
            }

            /* ---- Section title: matches app's FormSection ---- */
            .section-title {
              font-size: 15px;
              font-weight: 900;
              color: #1d4ed8;
              margin-top: 24px;
              margin-bottom: 2px;
              padding-bottom: 6px;
              border-bottom: 2px solid #1d4ed8;
            }

            .section-hint {
              font-size: 10px;
              color: #888888;
              margin-bottom: 12px;
              letter-spacing: 0.3px;
            }

            .block-title {
              font-size: 12px;
              font-weight: 800;
              color: #111111;
              margin-top: 14px;
              margin-bottom: 3px;
            }

            .block-hint {
              font-size: 10.5px;
              color: #777777;
              margin-bottom: 8px;
            }

            .field {
              margin-bottom: 14px;
            }

            .label {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 4px;
              color: #333333;
            }

            .value {
              border: 1px solid #999999;
              border-radius: 4px;
              padding: 8px 10px;
              min-height: 16px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            .row {
              display: flex;
              gap: 12px;
            }

            .row .field {
              flex: 1;
            }

            .day-row {
              display: flex;
              gap: 6px;
              margin: 8px 0 14px 0;
              flex-wrap: wrap;
            }

            .day-chip {
              padding: 6px 10px;
              border: 1px solid #cccccc;
              border-radius: 6px;
              font-size: 10.5px;
              font-weight: 700;
              color: #555555;
            }

            .day-chip.active {
              background: #1d4ed8;
              border-color: #1d4ed8;
              color: #ffffff;
            }

            .footer {
              margin-top: 45px;
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
            <div class="side left">SOUTH AFRICAN<br/>POLICE SERVICE</div>
            <div class="badge">SAPS</div>
            <div class="side right">
              SUID-AFRIKAANSE<br/>POLISIEDIENS
              <div class="part-a">Part A / Deel A</div>
            </div>
          </div>

          <div class="title">STATEMENT &bull; VERKLARING</div>

          <div class="row">
            <div class="field">
              <div class="label">STATION / STASIE</div>
              <div class="value">${escapeHtml(station)}</div>
            </div>
            <div class="field">
              <div class="label">CAS NO / MAS NO</div>
              <div class="value">${escapeHtml(cas)}</div>
            </div>
          </div>

          <div class="section-title">Particulars of offence / incident</div>
          <div class="section-hint">BESONDERHEDE VAN MISDRYF / VOORVAL</div>

          <div class="block-title">When the victim is certain of the date and time</div>
          <div class="block-hint">At / Op — use when the complainant can state exactly when the offence happened.</div>

          <div class="row">
            <div class="field">
              <div class="label">DATE / DATUM</div>
              <div class="value">${escapeHtml(certainDate)}</div>
            </div>
            <div class="field">
              <div class="label">TIME / TYD</div>
              <div class="value">${escapeHtml(certainTime)}</div>
            </div>
          </div>

          <div class="block-title">When the victim is not certain (date/time range)</div>
          <div class="block-hint">Between / Tussen … and / en … — earliest and latest possible date and time.</div>

          <div class="row">
            <div class="field">
              <div class="label">FROM DATE</div>
              <div class="value">${escapeHtml(rangeFromDate)}</div>
            </div>
            <div class="field">
              <div class="label">FROM TIME</div>
              <div class="value">${escapeHtml(rangeFromTime)}</div>
            </div>
          </div>

          <div class="row">
            <div class="field">
              <div class="label">TO DATE</div>
              <div class="value">${escapeHtml(rangeToDate)}</div>
            </div>
            <div class="field">
              <div class="label">TO TIME</div>
              <div class="value">${escapeHtml(rangeToTime)}</div>
            </div>
          </div>

          <div class="label" style="margin-top:4px;">DAY OF WEEK / DAG</div>
          <div class="day-row">
            ${dayLabels
              .map(
                (d) =>
                  `<div class="day-chip${d === dayOfWeek ? " active" : ""}">${d}</div>`
              )
              .join("")}
          </div>

          <div class="block-title">Incident details</div>

          <div class="field">
            <div class="label">DESCRIPTION OF OFFENCE / INCIDENT</div>
            <div class="value">${escapeHtml(offence)}</div>
          </div>

          <div class="field">
            <div class="label">METHOD USED / ENTRANCE GAINED</div>
            <div class="value">${escapeHtml(method)}</div>
          </div>

          <div class="field">
            <div class="label">TYPE OF INSTRUMENT USED</div>
            <div class="value">${escapeHtml(instrument)}</div>
          </div>

          <div class="section-title">Scene of crime</div>
          <div class="section-hint">TONEEL VAN MISDAAD</div>

          <div class="field">
            <div class="label">BETWEEN: NAME OF PLACE</div>
            <div class="value">${escapeHtml(loc.betweenA)}</div>
          </div>

          <div class="field">
            <div class="label">AND: NAME OF PLACE</div>
            <div class="value">${escapeHtml(loc.betweenB)}</div>
          </div>

          <div class="field">
            <div class="label">STREET NAME</div>
            <div class="value">${escapeHtml(loc.street)}</div>
          </div>

          <div class="field">
            <div class="label">BUILDING / FARM / PLOT / PLACE</div>
            <div class="value">${escapeHtml(loc.building)}</div>
          </div>

          <div class="field">
            <div class="label">SUBURB / EXTENSION / AREA</div>
            <div class="value">${escapeHtml(loc.suburb)}</div>
          </div>

          <div class="field">
            <div class="label">TOWN / CITY</div>
            <div class="value">${escapeHtml(loc.town)}</div>
          </div>

          <div class="row">
            <div class="field">
              <div class="label">POSTAL CODE</div>
              <div class="value">${escapeHtml(postalCode)}</div>
            </div>
            <div class="field">
              <div class="label">GEOGRAPHICAL BLOCK NO</div>
              <div class="value">${escapeHtml(geoBlock)}</div>
            </div>
          </div>

          <div class="field">
            <div class="label">TYPE OF PREMISES</div>
            <div class="value">${escapeHtml(premType)}</div>
          </div>

          <div class="row" style="margin-top: 20px;">
            <div class="field">
              <div class="label">DATE / DATUM</div>
              <div class="value">${escapeHtml(footDate)}</div>
            </div>
            <div class="field">
              <div class="label">SIGNATURE / HANDTEKENING</div>
              <div class="value">${escapeHtml(footSig)}</div>
            </div>
          </div>

          <div class="footer">
            <span>Revision 1.0 Dated 2006-10-24</span>
            <span>Page 3</span>
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
          dialogTitle: "Statement PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        console.log("PDF created at:", uri);
      }
    } catch (error) {
      console.error("Statement PDF generation failed:", error);

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
      style={formScreen.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={formScreen.pageContent}
    >
      <View style={formScreen.card}>
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
              <Feather name="download" size={22} color={C.black} />
            )}
          </TouchableOpacity>
        </View>

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
        <FormField label="CAS no / MAS no" value={cas} onChangeText={setCas} />

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
              router.push("/ModusOperandiScreen");
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
    gap: 8,
    marginBottom: 8,
  },
  headerSmall: {
    flex: 1,
    color: C.blue,
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
    borderColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.grey100,
  },
  badgeTxt: { fontWeight: "900", color: C.blue, fontSize: 10 },
  partA: {
    marginTop: 2,
    color: C.blueMuted,
    fontWeight: "800",
    fontSize: FORM.fontCaption + 0.5,
  },
  mainTitle: {
    textAlign: "center",
    fontSize: FORM.fontTitle,
    fontWeight: "900",
    color: C.black,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  footerBlock: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  footerMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: { color: C.grey500, fontSize: FORM.fontCaption },
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
});
