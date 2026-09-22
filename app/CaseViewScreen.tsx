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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  ArrowLeftIcon,
} from "../components/icons/buttons";
import { Colors } from "../constants/FormTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../constants/ApiUrl";

type Detective = {
  Detname: string;
  Detsurname: string;
  DetpersonalNumber?: string;
};

export default function CaseView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;
  const isMedium = width >= 768;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [detectives, setDetectives] = useState<Detective[]>([]);
  const [now] = useState(new Date());
  const formattedDate = now.toLocaleDateString("en-ZA", {
    year: "numeric",
  });

  // In-app status banner (replaces window.alert, which can be blocked or
  // silently suppressed in some web preview environments).
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    name,
    surname,
    rank,
    personalNumber,
    caseNumber,
    type,
    station,
    city,
    description,
    victim,
    assignedTo,
  } = useLocalSearchParams<{
    name: string;
    surname: string;
    rank: string;
    personalNumber: string;
    caseNumber: string;
    type: string;
    station: string;
    city: string;
    description: string;
    victim: string;
    assignedTo: string;
  }>();

  // Local, updatable copy of the assignment so the UI can reflect a new
  // assignment immediately, without waiting for a navigation/refetch.
  const [currentAssignedTo, setCurrentAssignedTo] = useState(assignedTo);

  // Look up the currently assigned detective's name from the fetched list,
  // so we can show a readable name instead of just a raw personal number.
  const currentlyAssignedDetective = detectives.find(
    (det) => det.DetpersonalNumber === currentAssignedTo,
  );

  const isCurrentlyAssigned =
    !!currentAssignedTo && currentAssignedTo.length > 0;

  // Shows a message to the commander. On web this renders an in-app
  // banner (auto-dismisses after 4s) since window.alert/Alert.alert are
  // unreliable in some web/preview environments. On native it uses the
  // normal Alert.alert popup.
  function showAlert(
    title: string,
    message: string,
    type: "success" | "error" = "error",
  ) {
    if (Platform.OS === "web") {
      setStatusMessage({ type, text: `${title}: ${message}` });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }
    Alert.alert(title, message);
  }

  async function AssignDetective(personalNumber: string, caseNumber: string) {
    setAssigningId(personalNumber);
    try {
      const response = await fetch(`${API_BASE_URL}/cases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          employee_number: personalNumber,
          case_number: caseNumber,
          action: "assign",
        }),
      });
      const text = await response.text();
      console.log("STATUS:", response.status);
      console.log("BODY:", text);

      if (!response.ok) {
        showAlert(
          "Assignment Failed",
          "Could not assign this officer. Please try again.",
          "error",
        );
        return false;
      }

      // Success: update local state immediately so the UI reflects the
      // new assignment without needing a refetch or navigation. This
      // also lets you re-assign to a different officer straight away,
      // since currentAssignedTo simply gets overwritten.
      setCurrentAssignedTo(personalNumber);

      const assignedDet = detectives.find(
        (det) => det.DetpersonalNumber === personalNumber,
      );
      const officerName = assignedDet
        ? `${assignedDet.Detname} ${assignedDet.Detsurname}`
        : "The officer";
      showAlert(
        "Assignment Successful",
        `${officerName} has been assigned to case ${caseNumber}.`,
        "success",
      );

      return true;
    } catch (error) {
      console.error("Failed to fetch officers:", error);
      showAlert(
        "Network Error",
        "Could not reach the server. Please check your connection.",
        "error",
      );
      return false;
    } finally {
      setAssigningId(null);
    }
  }

  // Platform-aware confirmation: Alert.alert with multiple buttons is
  // unreliable on Expo web (React Native Web), so web uses the browser's
  // native window.confirm instead, which reliably returns true/false.
  function confirmAssignDetective(det: Detective, caseNumber: string) {
    const officerName = `${det.Detname} ${det.Detsurname}`;
    const message = isCurrentlyAssigned
      ? `Reassign case ${caseNumber} to ${officerName}?`
      : `Assign ${officerName} to case ${caseNumber}?`;

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        AssignDetective(det.DetpersonalNumber ?? "", caseNumber);
      }
      return;
    }

    Alert.alert("Confirm Assignment", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => AssignDetective(det.DetpersonalNumber ?? "", caseNumber),
      },
    ]);
  }

  useEffect(() => {
    async function fetchOfficers() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/employees?case_type=${type}&action=filter&rank=detective`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
        const data = await response.json();

        const mapped: Detective[] = data.map((officer: any) => ({
          Detsurname: officer.SURNAME ?? "",
          Detname: officer.NAME ?? "",
          DetpersonalNumber: officer.EMPLOYEE_NUMBER ?? "",
        }));

        setDetectives(mapped);
      } catch (error) {
        console.error("Failed to fetch officers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOfficers();
  }, [type]);

  const filteredList = detectives.filter((det) => {
    const matchesSearch =
      det.Detname.toLowerCase().includes(search.toLowerCase()) ||
      det.Detsurname.toLowerCase().includes(search.toLowerCase()) ||
      det.DetpersonalNumber?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* STATUS BANNER */}
        {statusMessage && (
          <View
            style={[
              styles.statusBanner,
              statusMessage.type === "success"
                ? styles.statusBannerSuccess
                : styles.statusBannerError,
            ]}
          >
            <Text style={styles.statusBannerText}>{statusMessage.text}</Text>
            <Pressable onPress={() => setStatusMessage(null)}>
              <Text style={styles.statusBannerClose}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* HEADER */}
        <View style={styles.header}>
          {/* LEFT */}
          <View style={styles.headerLeft}>
            <Pressable
              style={({ hovered }) => [
                styles.btnBack,
                hovered && styles.btnBackHovered,
              ]}
              onPress={() =>
                router.replace({
                  pathname: "/CaseListScreen",
                  params: {
                    personalNumber,
                    name,
                    surname,
                    rank,
                    station,
                    type,
                    city,
                  },
                })
              }
            >
              <ArrowLeftIcon />
            </Pressable>

            <View style={styles.headerDivider} />

            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/images/saps-logo.png")}
                style={styles.sapsLogo}
                resizeMode="cover"
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>
                {city ?? "JOHANNESBURG"} CENTRAL
              </Text>
              {!isSmall && (
                <Text style={styles.headerSubtitle}>
                  South African Police Service · Gauteng
                </Text>
              )}
            </View>
          </View>

          {/* RIGHT */}
          {!isSmall && (
            <View style={styles.headerRight}>
              <View style={styles.commanderInfo}>
                <Text style={styles.commanderName}>
                  {surname ?? "MKHWANAZI"} {name ?? "NHLANHLA"}
                </Text>
                <Text style={styles.commanderRole}>Detective Commander</Text>
              </View>
              <View style={styles.avatar}>
                <Image
                  source={{
                    uri: "https://tse4.mm.bing.net/th/id/OIP.RuiYdm6APQVna3xXcyCX6AHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
                  }}
                  style={styles.avatarImg}
                />
              </View>
            </View>
          )}
        </View>

        {/* MAIN SCROLL */}
        <ScrollView
          contentContainerStyle={[
            styles.main,
            { paddingHorizontal: isSmall ? 16 : 40 },
          ]}
        >
          {/* PAGE HEADER */}
          <View style={styles.pageHeader}>
            <View style={styles.eyebrowBadge}>
              <Text style={styles.eyebrowText}>Operational Workflow</Text>
            </View>
            <Text style={styles.pageTitle}>Manual Case Assignment</Text>
            <Text style={styles.pageDesc}>
              Allocate critical investigative resources to Case ID: {caseNumber}
              . Ensure resource allocation follows SAPS standard operating
              procedures and commander discretion.
            </Text>
          </View>

          {/* CASE GRID */}
          <View style={[styles.caseGrid, isMedium && styles.caseGridRow]}>
            {/* CASE CARD */}
            <View style={[styles.caseCard, isMedium && styles.caseCardFlex]}>
              <View style={[styles.caseImage, isMedium && styles.caseImageMd]}>
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWI4-fUu0v_nHAST7dW_qT-wtYcKEd3MW0mvMUWEAZu93Vr8DbgarW_3QKUqKvN109go2DOgiY2dYTxi63wpc2CzxLk3llmuhJPiN6TvltmiUbNzxJIouzNh51gug05byq0tiveh1Cq9yHOqvxqLCaQTuLqbFZS5EaNR2u4RysGdKKVv90xuBK_HGIkAB0YcTM-ipqI8V9ynn5ndxNi_LlPTpmqI6xSTHuOJynyXk4BMu1uzmkYDQJNT102NJjBaiwuMNCEJo0xw_n",
                  }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.caseInfo}>
                <View style={styles.caseTypeBadge}>
                  <Text style={styles.caseTypeBadgeText}>Type: {type}</Text>
                </View>
                <Text style={styles.caseTitle}>{victim}</Text>
                <Text style={styles.caseDesc}>{description}</Text>

                {/* CURRENT ASSIGNMENT STATUS */}
                <View
                  style={[
                    styles.assignedBadge,
                    isCurrentlyAssigned
                      ? styles.assignedBadgeActive
                      : styles.assignedBadgeNone,
                  ]}
                >
                  <View
                    style={[
                      styles.assignedDot,
                      isCurrentlyAssigned
                        ? styles.assignedDotActive
                        : styles.assignedDotNone,
                    ]}
                  />
                  <Text
                    style={[
                      styles.assignedBadgeText,
                      isCurrentlyAssigned
                        ? styles.assignedBadgeTextActive
                        : styles.assignedBadgeTextNone,
                    ]}
                  >
                    {isCurrentlyAssigned
                      ? `Currently Assigned: ${
                          currentlyAssignedDetective
                            ? `${currentlyAssignedDetective.Detname} ${currentlyAssignedDetective.Detsurname}`
                            : currentAssignedTo
                        }`
                      : "Currently Unassigned"}
                  </Text>
                </View>
              </View>
            </View>

            {/* SEARCH CARD */}
            <View style={styles.searchCard}>
              <Text style={styles.searchEyebrow}>Detective Directory</Text>
              <Text style={styles.searchTitle}>Search & Filter</Text>
              <View style={styles.searchWrap}>
                <SearchIcon />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or badge..."
                  placeholderTextColor={Colors.grey500}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              <Pressable
                style={({ hovered }) => [
                  styles.btnFilter,
                  hovered && styles.btnFilterHovered,
                ]}
              >
                <View style={styles.btnFilterInner}>
                  <SettingsIcon />
                  <Text style={styles.btnFilterText}>
                    Apply Advanced Filters
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* DETECTIVE SECTION */}
          <View style={styles.section}>
            {/* SECTION HEADER */}
            <View style={styles.sectionEyebrow}>
              <View style={styles.sectionIconWrap}>
                <ShieldIcon />
              </View>
              <Text style={styles.sectionHeading}>
                Officers dealing with {type} cases.
              </Text>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>
                  {filteredList.length} Officers Available
                </Text>
              </View>
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color={Colors.sapsblue}
                style={{ marginTop: 40 }}
              />
            )}
            {/* BENTO GRID */}
            <View style={[styles.bentoGrid, isMedium && styles.bentoGridRow]}>
              {filteredList.map((det) => {
                const isThisOfficerAssigned =
                  isCurrentlyAssigned &&
                  det.DetpersonalNumber === currentAssignedTo;

                return (
                  // Plain View, not Pressable: on Expo web, a Pressable
                  // with no onPress still installs hover/pointer
                  // handling, which can swallow the click before it
                  // reaches the "Assign Case" button nested inside it.
                  <View
                    key={det.DetpersonalNumber}
                    style={[
                      styles.detectiveCard,
                      isThisOfficerAssigned && styles.detectiveCardAssigned,
                    ]}
                  >
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Image
                          source={{
                            uri: "https://tse4.mm.bing.net/th/id/OIP.RuiYdm6APQVna3xXcyCX6AHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
                          }}
                          style={styles.detImage}
                          resizeMode="cover"
                        />
                        <View>
                          <Text style={styles.detName}>
                            {det.Detsurname} {det.Detname}{" "}
                            {det.DetpersonalNumber}
                          </Text>
                          <View style={styles.statusRow}>
                            <View
                              style={[
                                styles.statusDot,
                                isThisOfficerAssigned &&
                                  styles.statusDotAssigned,
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusLabel,
                                isThisOfficerAssigned &&
                                  styles.statusLabelAssigned,
                              ]}
                            >
                              {isThisOfficerAssigned
                                ? "Currently Assigned"
                                : "Active"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Pressable
                        style={({ hovered }) => [
                          styles.btnAssign,
                          isThisOfficerAssigned && styles.btnAssignAssigned,
                          hovered && styles.btnAssignHovered,
                        ]}
                        disabled={assigningId === det.DetpersonalNumber}
                        onPress={() => confirmAssignDetective(det, caseNumber)}
                      >
                        {({ hovered }) => (
                          <Text
                            style={[
                              styles.btnAssignText,
                              isThisOfficerAssigned &&
                                styles.btnAssignTextAssigned,
                              hovered && styles.btnAssignTextHovered,
                            ]}
                          >
                            {assigningId === det.DetpersonalNumber
                              ? "Assigning..."
                              : isThisOfficerAssigned
                                ? "Assigned Officer"
                                : "Assign Case"}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <Text style={styles.footerBrand}>SAPS Systems</Text>
              <View style={styles.footerDivider} />
              <Text style={styles.footerLink}>Security Policy</Text>
              <Text style={styles.footerLink}>Terms of Service</Text>
              <Text style={styles.footerLink}>Officer Support</Text>
            </View>
            <Text style={styles.footerCopy}>
              © {formattedDate} South African Police Service Digital Systems.
              All Rights Reserved. Restricted Access. Unauthorized access is
              punishable by law.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// STYLES

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // STATUS BANNER
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 200,
  },
  statusBannerSuccess: {
    backgroundColor: Colors.green,
  },
  statusBannerError: {
    backgroundColor: Colors.red,
  },
  statusBannerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
  },
  statusBannerClose: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    paddingLeft: 12,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    backgroundColor: Colors.sapsblue,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  btnBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  btnBackHovered: {
    backgroundColor: Colors.logoutHovered,
    borderColor: Colors.gold,
  },
  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.gold,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  sapsLogo: {
    width: "100%",
    height: "100%",
  },
  headerText: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: Colors.grey500,
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  commanderInfo: {
    alignItems: "flex-end",
  },
  commanderName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  commanderRole: {
    fontSize: 12,
    color: Colors.gold,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },

  // MAIN
  main: {
    paddingTop: 32,
    paddingBottom: 48,
    gap: 40,
  },

  // PAGE HEADER
  pageHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey300,
    paddingBottom: 24,
    gap: 10,
  },
  eyebrowBadge: {
    backgroundColor: Colors.sapsblue,
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.gold,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.sapsblue,
    letterSpacing: 1,
  },
  pageDesc: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.blue,
    maxWidth: 600,
  },

  // CASE GRID
  caseGrid: {
    gap: 20,
  },
  caseGridRow: {
    flexDirection: "row",
  },
  caseCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grey300,
    padding: 20,
    gap: 16,
    shadowColor: Colors.sapsblue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  caseCardFlex: {
    flex: 2,
    flexDirection: "row",
  },
  caseImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "Colors.grey50",
  },
  caseImageMd: {
    width: 190,
    height: 130,
  },
  caseInfo: {
    flex: 1,
    gap: 8,
  },
  caseTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.red,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  caseTypeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: Colors.red,
  },
  caseTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.sapsblue,
    lineHeight: 26,
  },
  caseDesc: {
    fontSize: 13,
    lineHeight: 21,
    color: Colors.sapsblue,
  },

  // CURRENT ASSIGNMENT BADGE
  assignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 4,
  },
  assignedBadgeActive: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  assignedBadgeNone: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey300,
  },
  assignedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  assignedDotActive: {
    backgroundColor: Colors.green,
  },
  assignedDotNone: {
    backgroundColor: Colors.grey500,
  },
  assignedBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  assignedBadgeTextActive: {
    color: Colors.green,
  },
  assignedBadgeTextNone: {
    color: Colors.grey500,
  },

  // SEARCH CARD
  searchCard: {
    flex: 1,
    minHeight: 250,
    maxHeight: 320,
    backgroundColor: Colors.sapsblue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
    padding: 24,
    gap: 12,
    shadowColor: Colors.sapsblue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  searchEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.gold,
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.white,
    letterSpacing: 1,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.grey200,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grey500,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.sapsblue,
  },
  btnFilter: {
    backgroundColor: Colors.gold,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  btnFilterHovered: {
    backgroundColor: Colors.gold,
  },
  btnFilterInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnFilterText: {
    color: Colors.sapsblue,
    fontWeight: "700",
    fontSize: 13,
  },

  // DETECTIVE SECTION
  section: {
    gap: 20,
  },
  sectionEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  sectionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.sapsblue,
    letterSpacing: 1,
  },
  sectionCountBadge: {
    marginLeft: "auto",
    backgroundColor: Colors.sapsblue,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 0.5,
  },

  // BENTO GRID
  bentoGrid: {
    gap: 16,
  },
  bentoGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detectiveCard: {
    width: "25%",
    minWidth: 300,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grey300,
    overflow: "hidden",
    shadowColor: Colors.sapsblue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  detectiveCardAssigned: {
    borderColor: Colors.green,
    borderWidth: 2,
    backgroundColor: Colors.grey50,
  },
  detectiveCardHovered: {
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
    borderColor: Colors.sapsblue,
  },
  cardBody: {
    padding: 24,
    gap: 20,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  detImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.grey300,
  },
  detName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.sapsblue,
  },
  detRole: {
    fontSize: 13,
    color: Colors.grey500,
    fontWeight: "500",
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  statusDotAssigned: {
    backgroundColor: Colors.gold,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.green,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statusLabelAssigned: {
    color: Colors.sapsblue,
  },
  btnAssign: {
    borderWidth: 1.5,
    borderColor: Colors.sapsblue,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  btnAssignAssigned: {
    backgroundColor: Colors.grey50,
    borderColor: Colors.green,
  },
  btnAssignHovered: {
    backgroundColor: Colors.sapsblue,
  },
  btnAssignText: {
    color: Colors.sapsblue,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  btnAssignTextAssigned: {
    color: Colors.green,
  },
  btnAssignTextHovered: {
    color: Colors.gold,
  },

  // FOOTER
  footer: {
    backgroundColor: Colors.sapsblue,
    borderTopWidth: 2,
    borderTopColor: Colors.gold,
    padding: 40,
    alignItems: "center",
    gap: 14,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.gold,
    letterSpacing: 1,
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.gold,
  },
  footerLink: {
    fontSize: 13,
    color: Colors.grey700,
    fontWeight: "500",
  },
  footerCopy: {
    fontSize: 12,
    color: Colors.grey700,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 500,
  },
});
