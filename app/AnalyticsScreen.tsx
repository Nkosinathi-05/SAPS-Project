import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import {
  PowerIcon,
  ClipboardIcon,
  HourglassIcon,
  BarChartIcon,
  CheckCircleIcon,
  TrendUpIcon,
  CheckIcon,
} from "../components/icons/buttons";
import {
  AnalyticsIcon,
  FolderNavIcon,
  HomeIcon,
} from "../components/icons/navigations";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Colors } from "../constants/FormTheme";
import { type CaseItem } from "../constants/Lists";

function StatIcon({ type }: { type: string }) {
  switch (type) {
    case "clipboard":
      return <ClipboardIcon size={22} color="#001b44" />;
    case "hourglass":
      return <HourglassIcon size={22} color="#001b44" />;
    case "check":
      return <CheckCircleIcon size={22} color="#16a34a" />;
    default:
      return null;
  }
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());
  const todayISO = now.toISOString().split("T")[0];

  //Cases openeed today
  const todaysCases = cases.filter((c) => c.dateOpened.startsWith(todayISO));
  const totalToday = todaysCases.length;

  //Resolved cases
  const resolvedCases = cases.filter((c) => c.status === "RESOLVED");
  const resolvedCount = resolvedCases.length;
  const InProgressCases = cases.filter((c) => c.status === "IN PROGRESS");
  const inProgressCount = InProgressCases.length;

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

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(
          "https://danger-reliable-conclude.ngrok-free.dev/cases?action=case_list",
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
  const CHART_BARS = [
    { label: "Murder", color: "#dc2626" },
    { label: "Assault", color: "#001b44" },
    { label: "Rape", color: "#f7c600" },
    { label: "Theft", color: "#2563eb" },
  ];

  const barCounts = CHART_BARS.map((bar) => {
    const count = cases.filter((c) =>
      c.offence.toLowerCase().includes(bar.label.toLowerCase()),
    ).length;
    return { ...bar, count };
  });

  // Group all cases by their dateOpened, count per day
  const casesByDay = cases.reduce<Record<string, number>>((acc, c) => {
    const day = c.dateOpened.split("T")[0]; // normalize in case of timestamps
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});
  const allDays = Object.values(casesByDay);
  const totalAvgPerDay =
    allDays.length > 0
      ? allDays.reduce((sum, count) => sum + count, 0) / allDays.length
      : 0;
  const percentVsAvg =
    totalAvgPerDay > 0
      ? Math.round((totalToday - totalAvgPerDay) / totalAvgPerDay)
      : 0;

  return (
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

      {/* MAIN */}
      <ScrollView
        contentContainerStyle={[
          styles.main,
          { paddingHorizontal: isSmall ? 12 : 32 },
        ]}
      >
        {/* PAGE TITLE */}
        <View>
          <Text style={styles.pageTitle}>Analytics</Text>
          <Text style={styles.pageSub}>{city} CENTRAL</Text>
        </View>

        {/* STATS GRID */}
        <View style={[styles.statsGrid, isSmall && styles.statsGridSmall]}>
          {/* TOTAL TODAY */}
          <Pressable style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>Total Today</Text>
              <StatIcon type="clipboard" />
            </View>

            <Text style={styles.statValue}>{totalToday}</Text>

            <View style={styles.trendRow}>
              <TrendUpIcon size={13} color={Colors.red} />
              <Text style={[styles.statTrend, styles.trendUp]}>
                {" "}
                {percentVsAvg}% vs avg
              </Text>
            </View>
          </Pressable>

          {/* ACTIVE */}
          <Pressable style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>Active</Text>
              <StatIcon type="hourglass" />
            </View>

            <Text style={styles.statValue}>{inProgressCount}</Text>

            <Text style={styles.statSub}>In Progress</Text>
          </Pressable>

          {/* RESOLVED */}
          <Pressable style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>Resolved</Text>
              <StatIcon type="check" />
            </View>

            <Text style={styles.statValue}>{resolvedCount}</Text>

            <View style={styles.trendRow}>
              <CheckIcon size={13} color={Colors.green} />
              <Text style={[styles.statTrend, styles.trendOk]}>Last 24h</Text>
            </View>
          </Pressable>
        </View>

        {/* CHART CARD */}
        <Pressable style={styles.chartCard}>
          {/* CHART HEADER */}
          <View style={styles.chartCardHeader}>
            <Text style={styles.chartSectionLabel}>Crime Category (YTD)</Text>
            <BarChartIcon size={20} color={Colors.grey500} />
          </View>

          {/* CHART BARS */}
          {/* CHART BARS */}
          <View style={styles.chartBars}>
            {barCounts.map((bar) => (
              <View key={bar.label} style={styles.chartRow}>
                <View style={styles.chartRowMeta}>
                  <Text style={styles.chartLabel}>{bar.label}</Text>
                  <Text style={styles.chartCount}>{bar.count}</Text>
                </View>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartFill,
                      {
                        width: `${(bar.count / cases.length) * 100}%`,
                        backgroundColor: bar.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Pressable>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, isSmall && styles.bottomNavSmall]}>
        <Pressable
          style={styles.navTab}
          onPress={() =>
            router.navigate({
              pathname: "/CommanderDashboardScreen",
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
          <HomeIcon />
          <Text style={styles.navLabel}>Dashboard</Text>
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

        <Pressable style={styles.navTab}>
          <AnalyticsIcon />
          <Text style={[styles.navLabel, styles.navActive]}>Analytics</Text>
        </Pressable>
      </View>
    </View>
  );
}

//STYLES

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    color: Colors.grey200,
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

  // PAGE TITLE
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.sapsblue,
  },
  pageSub: {
    fontSize: 14,
    color: Colors.grey500,
    marginTop: 4,
  },

  // STATS GRID
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statsGridSmall: {
    flexDirection: "column",
  },
  statCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: Colors.grey100,
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
  statCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.grey500,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.sapsblue,
    marginBottom: 6,
  },
  statSub: {
    fontSize: 13,
    color: Colors.grey500,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statTrend: {
    fontSize: 13,
    fontWeight: "600",
  },
  trendUp: {
    color: Colors.red,
  },
  trendOk: {
    color: Colors.green,
  },

  // CHART CARD
  chartCard: {
    backgroundColor: Colors.grey100,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  chartCardHovered: {
    transform: [{ translateY: -2 }],
  },
  chartCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.grey100,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey300,
  },
  chartSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.grey500,
  },
  chartBars: {
    padding: 24,
    gap: 18,
  },
  chartRow: {
    gap: 6,
  },
  chartRowMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartLabel: {
    fontSize: 14,
    color: Colors.sapsblue,
    fontWeight: "500",
  },
  chartCount: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.sapsblue,
  },
  chartTrack: {
    width: "100%",
    backgroundColor: Colors.grey200,
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
  },
  chartFill: {
    height: "100%",
    borderRadius: 999,
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
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 20,
    bottom: 0,
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
