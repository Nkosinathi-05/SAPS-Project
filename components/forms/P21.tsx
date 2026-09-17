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
import { FormField, FormTextArea, formScreen } from "./FormFields";
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const router = useRouter();

  const generatePDF = async () => {
    setGeneratingPDF(true);

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <style>
            @page {
              size: A4;
              margin: 20mm;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111111;
              font-size: 12px;
              line-height: 1.5;
            }

            .header {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              text-align: right;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 1px solid #cccccc;
            }

            .gps {
              font-size: 10px;
              font-weight: bold;
              margin-top: 2px;
            }

            .title {
              font-size: 22px;
              font-weight: 900;
              margin: 2px 0;
            }

            .date,
            .station {
              font-size: 10px;
              font-weight: bold;
            }

            .field {
              margin-bottom: 18px;
            }

            .label {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 6px;
            }

            .value {
              border: 1px solid #999999;
              padding: 10px;
              min-height: 18px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            .statement {
              border: 1px solid #999999;
              padding: 12px;
              min-height: 250px;
              white-space: pre-wrap;
              word-wrap: break-word;
              line-height: 1.6;
            }

            .that {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 6px;
            }

            .declaration {
              font-size: 11px;
              font-weight: bold;
              margin-top: 14px;
            }

            .signature {
              margin-top: 30px;
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

          <div class="header">
            <div class="gps">G.P.S 0/02</div>

            <div class="title">P.21</div>

            <div class="date">2026/05/01</div>

            <div class="station">
              BRIXTON SAPS CAS
            </div>
          </div>

          <div class="field">
            <div class="label">
              I AM
            </div>

            <div class="value">
              ${escapeHtml(iAm)}
            </div>
          </div>

          <div class="field">
            <div class="label">
              STATE UNDER OATH SAY ENGLISH
            </div>

            <div class="value">
              ${escapeHtml(lang)}
            </div>
          </div>

          <div class="field">
            <div class="that">
              THAT:
            </div>

            <div class="statement">
              ${escapeHtml(statement)}
            </div>
          </div>

          <div class="declaration">
            I KNOW AND UNDERSTAND THE CONTENT OF THE ABOVE STATEMENT.
          </div>

          <div class="declaration">
            I CONSIDER THE ABOVE STATEMENT TO BE TRUTHFUL ON MY CONSENT.
          </div>

          <div class="field signature">
            <div class="label">
              SIGNATURE / INITIALS
            </div>

            <div class="value">
              ${escapeHtml(initials)}
            </div>
          </div>

          <div class="footer">
            <span>Revision 1.0 Dated 2006-10-24</span>
            <span>Page 1</span>
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
          dialogTitle: "P21 PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        console.log("PDF created at:", uri);
      }
    } catch (error) {
      console.error("P21 PDF generation failed:", error);

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
    <ScrollView style={formScreen.page}>
      <View style={formScreen.pageContent}>
        <View style={formScreen.card}>

          <View style={styles.headerRow}>
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

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.gps}>G.P.S 0/02</Text>

              <Text style={styles.p21}>P.21</Text>

              <Text style={styles.meta}>
                2026/05/01
              </Text>

              <Text style={styles.meta}>
                BRIXTON SAPS CAS
              </Text>
            </View>
          </View>

          <View style={styles.hr} />

          <FormField
            label="I AM"
            value={iAm}
            onChangeText={setIAm}
          />

          <FormField
            label="STATE UNDER OATH SAY ENGLISH"
            value={lang}
            onChangeText={setLang}
          />

          <Text style={styles.that}>
            THAT:
          </Text>

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
            <Text style={styles.meta1}>
              Revision 1.0 Dated 2006-10-24
            </Text>

            <Text style={styles.meta1}>
              Page 1
            </Text>
          </View>

          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === 0 && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <FormSubmitButton
            label="Next: Investigation Diary →"
            loading={submitting}
            onPress={async () => {
              setSubmitting(true);

              try {
                const payload: P21Payload = {
                  iAm,
                  lang,
                  statement,
                  initials,
                };

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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  downloadIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },

  gps: {
    color: C.black,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },

  p21: {
    color: C.black,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    flex: 1,
  },

  meta: {
    color: C.black,
    fontSize: 10,
    fontWeight: "700",
  },

  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginVertical: 8,
  },

  that: {
    marginTop: 4,
    marginBottom: 2,
    fontSize: FORM.fontBody,
    fontWeight: "900",
    color: C.black,
  },

  decl: {
    marginTop: 6,
    color: C.black,
    fontSize: FORM.fontCaption + 1,
    fontWeight: "800",
    lineHeight: 14,
  },

  dash: {
    marginTop: 12,
    marginBottom: 4,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: C.grey500,
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
    backgroundColor: C.border,
  },

  dotActive: {
    backgroundColor: C.blue,
  },

  footerMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  meta1: {
    color: C.grey500,
    fontSize: FORM.fontCaption,
  },
});
