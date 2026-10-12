import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { PinIcon } from "../components/icons/buttons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Colors } from "../constants/FormTheme";
import {
  SearchIcon,
  ArrowLeftIcon,
  ScalesIcon,
} from "../components/icons/buttons";
import { type CaseItem } from "../constants/Lists";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../constants/ApiUrl";
import { officerAvatars } from "../constants/Lists";
import { CommonStyles } from "../constants/styles";

const defaultAvatar = officerAvatars["UNKNOWN_UNKNOWN"];

// Turns a date string into a sortable number.
// Missing or invalid dates become 0, so they sink to the bottom of the list.
const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const parsed = Date.parse(value.replace(" ", "T"));
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function CaseListPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;

  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Track which case is currently sending, instead of one shared boolean.
  const [sendingCaseId, setSendingCaseId] = useState<string | null>(null);

  const { name, surname, rank, personalNumber, station, caseType, city } =
    useLocalSearchParams<{
      name: string;
      surname: string;
      rank: string;
      personalNumber: string;
      station: string;
      caseType: string;
      city: string;
    }>();

  // Resolve the avatar for the currently loaded officer, falling back to
  // the UNKNOWN UNKNOWN placeholder if there's no matching image.
  const avatarKey = `${name?.toUpperCase() ?? "UNKNOWN"}_${surname?.toUpperCase() ?? "UNKNOWN"}`;

  const avatarSource = officerAvatars[avatarKey] ?? defaultAvatar;

  /*Shows a message at the top of the screen. On web this renders an in-app banner (auto-dismisses after 4s)*/
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function showAlert(
    title: string,
    message: string,
    type: "success" | "error" = "error",
  ) {
    if (Platform.OS === "web") {
      setStatusMessage({ type, text: `${message}` });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }
    Alert.alert(title, message);
  }

  //FETCH
  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cases?employee_number=${personalNumber}&action=detective_case_list`,
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        const rawText = await response.text();
        const sanitized = rawText.replace(/:\s*NaN/g, ": null");
        const data = JSON.parse(sanitized);

        if (!response.ok || !Array.isArray(data)) {
          console.error("Cases fetch did not return a valid array:", data);
          setCases([]);
          return;
        }

        const mapped: CaseItem[] = data.map((item: any) => {
          let offence = "";
          let place = "";

          try {
            const mo = JSON.parse(item.MODUS_OPERANDI);
            offence = mo.A_offence;
            place = mo.D_place ?? "";
          } catch (_) {}
          return {
            caseId: item.CASE_ID?.toString() ?? "",
            caseNumber: item.CASE_NUMBER ?? "",
            dateOpened: item.DATE_OPENED ?? "",
            victim: item.VICTIM ?? "",
            offence,
            place,
            caseDescription: "",
            status: item.STATUS ?? "",
            assignedTo: item.ASSIGNED_TO ?? "",
          };
        });

        setCases(mapped);
      } catch (error) {
        console.error("Failed to fetch cases:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  //SEARCH, THEN SORT (newest cases first)
  const filteredCases = cases
    .filter((c) => {
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.victim.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      // Newest first
      const diff = toTimestamp(b.dateOpened) - toTimestamp(a.dateOpened);
      if (diff !== 0) return diff;
      // Same date: the case created later (higher ID) goes first
      return (Number(b.caseId) || 0) - (Number(a.caseId) || 0);
    });

  async function handleSendPDF(caseId: string, caseNumber: string) {
    setSendingCaseId(caseId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cases?action=pdf&case_id=${caseNumber}&employee_number=${personalNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const rawText = await response.text();
      const sanitized = rawText.replace(/:\s*NaN/g, ": null");
      let data: any = null;
      try {
        data = JSON.parse(sanitized);
      } catch (_) {
        // Non-JSON response body; fall through to the ok-check below.
      }

      if (!response.ok) {
        showAlert(
          "Error",
          "Could not send the PDF. Please try again.",
          "error",
        );
        console.error("PDF request failed:", response.status, data);
        return;
      }

      showAlert("Success", "The PDF has been sent.", "success");
    } catch (error) {
      console.error("Failed to send PDF:", error);
      showAlert("Error", "Could not send the PDF. Please try again.", "error");
    } finally {
      setSendingCaseId(null);
    }
  }

  return (
    <SafeAreaView
      style={CommonStyles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={CommonStyles.container}>
        {/* STATUS BANNER */}
        {statusMessage && (
          <View
            style={[
              CommonStyles.statusBanner,
              statusMessage.type === "success"
                ? CommonStyles.statusBannerSuccess
                : CommonStyles.statusBannerError,
            ]}
          >
            <Text style={CommonStyles.statusBannerText}>
              {statusMessage.text}
            </Text>
            <Pressable onPress={() => setStatusMessage(null)}>
              <Text style={CommonStyles.statusBannerClose}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* HEADER */}
        <View style={CommonStyles.header}>
          {/* LEFT */}
          <View style={CommonStyles.headerLeft}>
            <Pressable
              style={({ hovered }: any) => [
                CommonStyles.btnBack,
                hovered && CommonStyles.btnBackHovered,
              ]}
              onPress={() =>
                router.navigate({
                  pathname: "/OfficerDashboardScreen",
                  params: {
                    personalNumber,
                    name,
                    surname,
                    rank,
                    station,
                    caseType,
                    city,
                  },
                })
              }
            >
              <ArrowLeftIcon size={18} color={Colors.gold} />
            </Pressable>

            <View style={CommonStyles.headerDivider} />

            <View style={CommonStyles.logoWrapper}>
              <Image
                source={require("../assets/images/saps-logo.png")}
                style={CommonStyles.sapsLogo}
                resizeMode="cover"
              />
            </View>

            <View style={CommonStyles.headerText}>
              <Text style={CommonStyles.headerTitle}>
                {city ?? "JOHANNESBURG"} CENTRAL
              </Text>
              {!isSmall && (
                <Text style={CommonStyles.headerSubtitle}>
                  South African Police Service · Gauteng
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* MAIN */}
        <ScrollView
          contentContainerStyle={[
            CommonStyles.main,
            { paddingHorizontal: isSmall ? 12 : 24 },
          ]}
        >
          {/* SEARCH */}
          <View style={CommonStyles.searchWrap}>
            <SearchIcon size={18} color="#9ca3af" />
            <TextInput
              style={CommonStyles.searchInput}
              placeholder="Search case number or victim..."
              placeholderTextColor="#757682"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* SECTION LABEL */}
          <Text style={CommonStyles.sectionLabel}>
            {loading ? "Loading..." : `${filteredCases.length} Cases Found`}
          </Text>

          {/* LOADING */}
          {loading && (
            <ActivityIndicator
              size="large"
              color="#00113a"
              style={{ marginTop: 40 }}
            />
          )}

          {/* CASE LIST (newest first) — loop through every case and render a card for each */}
          {!loading && (
            <View style={CommonStyles.caseList}>
              {filteredCases.length === 0 ? (
                <Text style={CommonStyles.emptyText}>No cases found.</Text>
              ) : (
                filteredCases.map((c, index) => {
                  const isSending = sendingCaseId === c.caseId;
                  return (
                    <Pressable
                      key={`${c.caseNumber}-${index}`}
                      style={({ hovered, pressed }: any) => [
                        CommonStyles.caseCard,
                        hovered && CommonStyles.caseCardHovered,
                        pressed && CommonStyles.caseCardPressed,
                      ]}
                    >
                      {/* TOP ROW */}
                      <View style={CommonStyles.caseCardTop}>
                        <Text style={CommonStyles.caseId}>{c.caseNumber}</Text>
                        <Text style={CommonStyles.caseTime}>
                          {c.dateOpened}
                        </Text>
                      </View>

                      {/* BOTTOM ROW */}
                      <View style={CommonStyles.caseCardBottom}>
                        <View style={{ flex: 1 }}>
                          <Text style={CommonStyles.caseVictim}>
                            {c.victim.toUpperCase()}
                          </Text>
                          <View style={CommonStyles.caseTypeRow}>
                            <ScalesIcon size={14} color="#444650" />
                            <Text style={CommonStyles.caseType}>
                              {c.offence || "Unknown"}
                            </Text>
                          </View>
                          {c.place ? (
                            <Text
                              style={[
                                CommonStyles.casePlace,
                                isSmall && CommonStyles.SmallcasePlace,
                              ]}
                            >
                              <PinIcon /> {c.place.toUpperCase()}
                            </Text>
                          ) : null}
                        </View>
                        {/* Progress status */}
                        <View style={CommonStyles.progress}>
                          <Text style={CommonStyles.progressText}>
                            {c.status}
                          </Text>
                        </View>
                      </View>

                      {/* INVESTIGATION LOG BUTTON */}
                      <Pressable
                        style={({ hovered, pressed }: any) => [
                          CommonStyles.logButton,
                          hovered && CommonStyles.logButtonHovered,
                          pressed && CommonStyles.logButtonPressed,
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: "/InvestigationLogScreen",
                            params: {
                              caseId: c.caseId,
                              caseNumber: c.caseNumber,
                              victim: c.victim,
                              offence: c.offence,
                              status: c.status,
                              personalNumber,
                              assignedTo: c.assignedTo,
                              name,
                              surname,
                              rank,
                              station,
                              caseType,
                              city,
                            },
                          })
                        }
                      >
                        {({ hovered, pressed }: any) => (
                          <Text
                            style={[
                              CommonStyles.logButtonText,
                              (hovered || pressed) &&
                                CommonStyles.logButtonTextHovered,
                            ]}
                          >
                            Investigation Log
                          </Text>
                        )}
                      </Pressable>

                      <Pressable
                        disabled={isSending}
                        style={({ hovered, pressed }: any) => [
                          styles.pdfBtn,
                          hovered && styles.pdfBtnHovered,
                          pressed && styles.pdfBtnPressed,
                          isSending && styles.pdfBtnDisabled,
                        ]}
                        onPress={() => handleSendPDF(c.caseId, c.caseNumber)}
                      >
                        <Text style={styles.pdfText}>
                          {isSending ? "Sending PDF..." : "Send PDF"}
                        </Text>
                      </Pressable>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

//STYLES
const styles = StyleSheet.create({
  // SEND PDF BUTTON
  pdfBtn: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.sapsblue,
    alignItems: "center",
  },
  pdfBtnHovered: {
    opacity: 0.9,
  },
  pdfBtnPressed: {
    opacity: 0.7,
  },
  pdfBtnDisabled: {
    opacity: 0.5,
  },
  pdfText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
