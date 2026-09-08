import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import {
  AnalyticsIcon,
  FolderNavIcon,
  HomeIcon,
} from "../components/icons/navigations";
import {
  PowerIcon,
  AlertIcon,
  ClockIcon,
  FolderIcon,
  BriefcaseIcon,
  BarChartIcon,
} from "../components/icons/buttons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../constants/FormTheme";
import { useEffect, useState } from "react";
import { type CaseItem } from "../constants/Lists";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommanderDashboard() {
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

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());
  const todayISO = now.toISOString().split("T")[0];

  const todaysCases = cases.filter((c) => c.dateOpened.startsWith(todayISO));
  const totalToday = todaysCases.length;

  //unassigned
  const unassignedCases = cases.filter((c) => c.status !== "IN PROGRESS");
  const unassignedCount = unassignedCases.length;

  const isSmall = width < 480;
  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/cases?action=case_list",
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

        const mapped: CaseItem[] = data.map((item: any) => {
          let offence = "";
          let place = "";
          let caseDescription = "";
          try {
            const mo = JSON.parse(item.MODUS_OPERANDI);
            offence = mo.A_offence;
            place = mo.D_place ?? "";
          } catch (_) {}
          try {
            const p21 = JSON.parse(item.P21);
            caseDescription = p21.statement ?? "";
          } catch (_) {}
          return {
            caseNumber: item.CASE_NUMBER ?? "",
            dateOpened: item.DATE_OPENED ?? "",
            victim: item.VICTIM ?? "",
            offence,
            place,
            caseDescription,
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
              if (Platform.OS === "web") {
                (document.activeElement as HTMLElement)?.blur();
              }
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/");
            }}
          >
            <PowerIcon />
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
            style={[styles.profileCard, isSmall && styles.profileCardSmall]}
          >
            <Image
              source={{
                uri: "https://tse4.mm.bing.net/th/id/OIP.RuiYdm6APQVna3xXcyCX6AHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
              }}
              style={[styles.avatar, isSmall && styles.avatarSmall]}
            />
            <View
              style={[styles.profileInfo, isSmall && styles.profileInfoSmall]}
            >
              <Text style={styles.profileName}>
                {name ?? "Nhlanhla"} {surname ?? "Mkhwanazi"}
              </Text>
              <Text style={styles.profileRole}>
                {rank ?? "Detective Commander"}
              </Text>
              <View style={styles.pillsRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    Badge {personalNumber ?? "#29384"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* CASE OVERVIEW */}
          <View>
            <Text style={styles.sectionLabel}>Case Overview</Text>
            <View style={[styles.statsGrid, isSmall && styles.statsGridSmall]}>
              <View style={[styles.statCard, isSmall && styles.statCardSmall]}>
                <AlertIcon />
                <View>
                  <Text
                    style={[
                      styles.statNumber,
                      isSmall && styles.statNumberSmall,
                      { color: Colors.red },
                    ]}
                  >
                    {totalToday}
                  </Text>
                  <Text style={[styles.statLabel]}>New Cases</Text>
                </View>
              </View>

              <View style={[styles.statCard, isSmall && styles.statCardSmall]}>
                <ClockIcon />
                <View>
                  <Text
                    style={[
                      styles.statNumber,
                      isSmall && styles.statNumberSmall,
                      { color: Colors.gold },
                    ]}
                  >
                    {unassignedCount}
                  </Text>
                  <Text style={styles.statLabel}>Unassigned</Text>
                </View>
              </View>

              <View style={[styles.statCard, isSmall && styles.statCardSmall]}>
                <FolderIcon />
                <View>
                  <Text
                    style={[
                      styles.statNumber,
                      isSmall && styles.statNumberSmall,
                      { color: Colors.sapsblue },
                    ]}
                  >
                    {cases.length}
                  </Text>
                  <Text style={styles.statLabel}>Total Active</Text>
                </View>
              </View>
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
                onPress={() =>
                  router.navigate({
                    pathname: "/CaseListScreen",
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
                <BriefcaseIcon />
                <View>
                  <Text style={styles.actionTitle}>View Cases</Text>
                  <Text style={styles.actionSubtitle}>All active cases</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ hovered }) => [
                  styles.actionBtn,
                  hovered && styles.actionBtnHovered,
                ]}
                onPress={() =>
                  router.navigate({
                    pathname: "/CommanderAnalyticsScreen",
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
                <BarChartIcon />
                <View>
                  <Text style={styles.actionTitle}>Analytics</Text>
                  <Text style={styles.actionSubtitle}>Case breakdown</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM NAV */}
        <View style={[styles.bottomNav, isSmall && styles.bottomNavSmall]}>
          <Pressable style={styles.navTab}>
            <HomeIcon />
            <Text style={[styles.navLabel, styles.navActive]}>Dashboard</Text>
          </Pressable>

          <Pressable
            style={styles.navTab}
            onPress={() =>
              router.navigate({
                pathname: "/CaseListScreen",
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
            <FolderNavIcon />
            <Text style={styles.navLabel}>Cases</Text>
          </Pressable>

          <Pressable
            style={styles.navTab}
            onPress={() =>
              router.navigate({
                pathname: "/CommanderAnalyticsScreen",
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
            <AnalyticsIcon />
            <Text style={styles.navLabel}>Analytics</Text>
          </Pressable>
        </View>
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
    backgroundColor: Colors.grey50,
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
    color: Colors.grey100,
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
    borderColor: Colors.gold,
  },
  pillText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "600",
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
    flexWrap: "nowrap",
    gap: 10,
  },
  statCardSmall: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  statTextWrap: {
    alignItems: "center",
    minWidth: 0,
    flexShrink: 1,
    gap: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
  },
  statNumberSmall: {
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.grey500,
    marginTop: 2,
    fontSize: 12,
    textAlign: "center",
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
    backgroundColor: Colors.white,
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
    color: Colors.sapsblue,
  },
  actionSubtitle: {
    color: Colors.grey500,
    marginTop: 4,
    fontSize: 14,
  },

  // BOTTOM NAV
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grey300,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 200,
  },
  bottomNavSmall: {
    height: 68,
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.grey500,
  },
  navActive: {
    color: Colors.sapsblue,
  },
});
