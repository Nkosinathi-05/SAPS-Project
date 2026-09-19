import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../constants/FormTheme";
import {
  PinIcon,
  AlertIcon,
  ClockIcon,
  FolderIcon,
  PowerIcon,
} from "../components/icons/buttons";
import {
  BuildingIcon,
  PlusIcon,
  BriefcaseIcon,
} from "../components/icons/navigations";
import { useEffect, useState } from "react";
import { CaseItem } from "../constants/Lists";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../constants/ApiUrl";

// Static avatar lookup — Metro needs require() calls to be literal strings,
// so every officer image has to be listed explicitly here.
const officerAvatars: Record<string, any> = {
  JOHN_MOKOENA: require("../assets/images/JOHN_MOKOENA.jpeg"),
  UNKNOWN_UNKNOWN: require("../assets/images/UNKNOWN_UNKNOWN.jpeg"),
  // Add one entry per officer image in assets/images, matching the exact filename:
  // "NAME_SURNAME": require("../assets/images/NAME_SURNAME.jpeg"),
};

const defaultAvatar = officerAvatars["UNKNOWN_UNKNOWN"];

export default function OfficerDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
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
  const isSmall = width < 480;
  const isMedium = width < 768;
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());
  const todayISO = now.toISOString().split("T")[0];

  const todaysCases = cases.filter((c) => c.dateOpened.startsWith(todayISO));
  const totalToday = todaysCases.length;

  const assignedCases = cases.filter((c) => c.status === "IN PROGRESS");
  const assignedCount = assignedCases.length;

  // Resolve the avatar for the currently loaded officer, falling back to
  // the UNKNOWN UNKNOWN placeholder if there's no matching image.
  const avatarKey = `${name?.toUpperCase() ?? "UNKNOWN"}_${surname?.toUpperCase() ?? "UNKNOWN"}`;
  const avatarSource = officerAvatars[avatarKey] ?? defaultAvatar;

  //FETCH
  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cases?employee_number=${personalNumber}&action=detective_case_list`,
          `${API_BASE_URL}/cases?employee_number=${personalNumber}&action=detective_case_list`,
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        //const data = await response.json();
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
            caseNumber: item.CASE_NUMBER ?? "",
            dateOpened: item.DATE_OPENED ?? "",
            victim: item.VICTIM ?? "",
            offence,
            place,
            caseDescription: "",
            status: item.STATUS ?? "",
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
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
            <Text style={styles.headerSubtitle}>
              South African Police Service · Gauteng
            </Text>
          </View>

          <Pressable
            style={({ hovered }) => [
              styles.logoutBtn,
              hovered && styles.logoutBtnHovered,
            ]}
            onPress={() => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/");
            }}
          >
            <PowerIcon size={18} color="#ffffff" />
          </Pressable>
        </View>

        {/* MAIN SCROLL AREA */}
        <ScrollView
          contentContainerStyle={[
            styles.main,
            { paddingHorizontal: isSmall ? 12 : 32 },
          ]}
        >
          {/* PROFILE CARD */}
          <View
            style={[styles.profileCard, isMedium && styles.profileCardSmall]}
          >
            {/* AVATAR */}
            <View style={styles.avatarWrap}>
              <Image
                source={avatarSource}
                style={[styles.avatar, isSmall && styles.avatarSmall]}
              />
            </View>

            {/* PROFILE INFO */}
            <View
              style={[styles.profileInfo, isMedium && styles.profileInfoSmall]}
            >
              <Text style={styles.profileName}>
                {name ?? "Nhlanhla"} {surname ?? "Mkhwanazi"}
              </Text>
              <Text style={styles.profileRole}>{rank ?? "Sergeant"}</Text>
              <View style={styles.pillsRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    SAPS-{personalNumber ?? "10425"}
                  </Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>CID</Text>
                </View>
              </View>
            </View>

            {/* STATION INFO */}
            <View
              style={[styles.stationInfo, isMedium && styles.stationInfoSmall]}
            >
              <View style={styles.stationField}>
                <PinIcon size={16} color="#f7c600" />
                <View>
                  <Text style={styles.stationLabel}>Station</Text>
                  <Text style={styles.stationValue}>
                    {station}, {city}
                  </Text>
                </View>
              </View>
              <View style={styles.stationField}>
                <BuildingIcon size={16} color="#f7c600" />
                <View>
                  <Text style={styles.stationLabel}>Division</Text>
                  <Text style={styles.stationValue}>
                    Criminal Investigation Department
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* CASE OVERVIEW */}
          <View>
            <Text style={styles.sectionLabel}>My Case Overview</Text>
            <View style={[styles.statsGrid, isSmall && styles.statsGridSmall]}>
              <Pressable
                style={({ hovered }) => [
                  styles.statCard,
                  hovered && styles.statCardHovered,
                ]}
              >
                <AlertIcon size={32} color="#dc2626" />
                <View>
                  <Text style={[styles.statNumber, { color: "#dc2626" }]}>
                    {totalToday}
                  </Text>
                  <Text style={styles.statLabel}>New Cases</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ hovered }) => [
                  styles.statCard,
                  hovered && styles.statCardHovered,
                ]}
              >
                <ClockIcon size={32} color="#ca8a04" />
                <View>
                  <Text style={[styles.statNumber, { color: "#ca8a04" }]}>
                    {assignedCount}
                  </Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <View
              style={[styles.actionsGrid, isSmall && styles.actionsGridSmall]}
            >
              <Pressable
                style={({ hovered }) => [
                  styles.actionBtn,
                  hovered && styles.actionBtnHovered,
                ]}
                onPress={() => {
                  router.navigate({
                    pathname: "/P21ScreenReview",
                  });
                }}
              >
                <PlusIcon size={32} color="#00317a" />
                <View>
                  <Text style={styles.actionTitle}>Create Case</Text>
                  <Text style={styles.actionSubtitle}>
                    Open a new case file
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ hovered }) => [
                  styles.actionBtn,
                  hovered && styles.actionBtnHovered,
                ]}
                onPress={() => {
                  router.navigate({
                    pathname: "/OfficerCaseList",
                    params: {
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
              >
                <BriefcaseIcon size={32} color="#00317a" />
                <View>
                  <Text style={styles.actionTitle}>View My Cases</Text>
                  <Text style={styles.actionSubtitle}>All assigned cases</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.sapsblue,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(247,198,0,0.5)",
  },
  sapsLogo: {
    width: "100%",
    height: "100%",
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: Colors.grey300,
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.logout,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnHovered: {
    backgroundColor: Colors.logoutHovered,
  },

  // MAIN
  main: {
    paddingTop: 24,
    paddingBottom: 100,
    gap: 32,
  },

  // PROFILE CARD
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    padding: 32,
    backgroundColor: Colors.sapsblue,
    borderRadius: 24,
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
    flexWrap: "wrap",
  },
  profileCardSmall: {
    flexDirection: "column",
    alignItems: "center",
    padding: 24,
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.gold,
  },
  avatarSmall: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  profileInfo: {
    flex: 1,
    minWidth: 180,
  },
  profileInfoSmall: {
    alignItems: "center",
    width: "100%",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.white,
  },
  profileRole: {
    marginTop: 4,
    color: Colors.grey300,
    fontSize: 15,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    flexWrap: "wrap",
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.logoutHovered,
    borderWidth: 1,
    borderColor: Colors.logoutHovered,
  },
  pillText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "600",
  },

  // STATION INFO
  stationInfo: {
    flexDirection: "column",
    gap: 14,
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: Colors.grey,
    minWidth: 220,
  },
  stationInfoSmall: {
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.grey,
    paddingLeft: 0,
    paddingTop: 16,
    width: "100%",
    alignItems: "center",
  },
  stationField: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stationLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: Colors.grey700,
    marginBottom: 2,
  },
  stationValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.white,
    lineHeight: 20,
  },

  // SECTION
  sectionLabel: {
    fontSize: 13,
    color: Colors.grey500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    fontWeight: "600",
  },

  // STATS
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statsGridSmall: {
    flexDirection: "row",
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.grey50,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  statCardHovered: {
    transform: [{ translateY: -4 }],
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
  },
  statLabel: {
    color: Colors.black,
    marginTop: 4,
  },

  // ACTIONS
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  actionsGridSmall: {
    flexDirection: "row",
  },
  actionBtn: {
    flex: 1,
    minWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.grey50,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  actionBtnHovered: {
    transform: [{ translateY: -4 }],
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  actionSubtitle: {
    color: Colors.black,
    marginTop: 4,
    fontSize: 14,
  },
});
