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
import Svg, { Path, Circle, Line, Rect, Polyline } from "react-native-svg";

// POWER / LOGOUT
const PowerIcon = ({ size = 18, color = "#ffffff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18.36 6.64a9 9 0 11-12.73 0"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="2"
      x2="12"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// CLIPBOARD / TOTAL TODAY
const ClipboardIcon = ({ size = 22, color = "#001b44" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect
      x="8"
      y="2"
      width="8"
      height="4"
      rx="1"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Line
      x1="9"
      y1="12"
      x2="15"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="9"
      y1="16"
      x2="13"
      y2="16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// HOURGLASS / ACTIVE
const HourglassIcon = ({ size = 22, color = "#001b44" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M5 2h14M5 22h14M6 2v4l6 6-6 6v4M18 2v4l-6 6 6 6v4"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// CHECK CIRCLE / RESOLVED
const CheckCircleIcon = ({ size = 22, color = "#16a34a" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Path
      d="M8 12l3 3 5-5"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// BAR CHART / ANALYTICS HEADER ICON
const BarChartIcon = ({ size = 22, color = "#6b7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line
      x1="18"
      y1="20"
      x2="18"
      y2="10"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="20"
      x2="12"
      y2="4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Line
      x1="6"
      y1="20"
      x2="6"
      y2="14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Line
      x1="3"
      y1="20"
      x2="21"
      y2="20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// TREND UP ARROW
const TrendUpIcon = ({ size = 13, color = "#dc2626" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18 7l-8 8-4-4-4 4"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 7h4v4"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// CHECK MARK (inline trend ok)
const CheckIcon = ({ size = 13, color = "#16a34a" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M5 13l4 4L19 7"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// HOME
const HomeIcon = ({ size = 24, color = "#6b7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 12L12 3l9 9"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// FOLDER / CASES NAV
const FolderIcon = ({ size = 24, color = "#6b7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Today",
    value: "24",
    icon: "clipboard",
    trend: "12% vs avg",
    trendType: "up",
  },
  {
    label: "Active",
    value: "142",
    icon: "hourglass",
    sub: "In Progress",
  },
  {
    label: "Resolved",
    value: "12",
    icon: "check",
    trend: "Last 24h",
    trendType: "ok",
  },
];

const CHART_BARS = [
  { label: "Murder", count: "08", width: 0.15, color: "#dc2626" },
  { label: "Assault (GBH)", count: "42", width: 0.45, color: "#001b44" },
  { label: "Rape", count: "12", width: 0.25, color: "#f7c600" },
  { label: "Aggravated Theft", count: "64", width: 0.65, color: "#2563eb" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;

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
          <Text style={styles.headerTitle}>{city} CENTRAL</Text>
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
            router.dismissAll();
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
          {STATS.map((stat) => (
            <Pressable key={stat.label} style={styles.statCard}>
              {/* TOP ROW */}
              <View style={styles.statCardTop}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <StatIcon type={stat.icon} />
              </View>

              {/* VALUE */}
              <Text style={styles.statValue}>{stat.value}</Text>

              {/* TREND OR SUB */}
              {stat.trend ? (
                <View style={styles.trendRow}>
                  {stat.trendType === "up" ? (
                    <TrendUpIcon size={13} color="#dc2626" />
                  ) : (
                    <CheckIcon size={13} color="#16a34a" />
                  )}
                  <Text
                    style={[
                      styles.statTrend,
                      stat.trendType === "up" ? styles.trendUp : styles.trendOk,
                    ]}
                  >
                    {stat.trend}
                  </Text>
                </View>
              ) : (
                <Text style={styles.statSub}>{stat.sub}</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* CHART CARD */}
        <Pressable style={styles.chartCard}>
          {/* CHART HEADER */}
          <View style={styles.chartCardHeader}>
            <Text style={styles.chartSectionLabel}>Crime Category (YTD)</Text>
            <BarChartIcon size={20} color="#6b7280" />
          </View>

          {/* CHART BARS */}
          <View style={styles.chartBars}>
            {CHART_BARS.map((bar) => (
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
                        width: `${bar.width * 100}%`,
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
            router.replace({
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
          <HomeIcon size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Dashboard</Text>
        </Pressable>

        <Pressable
          style={styles.navTab}
          onPress={() =>
            router.replace({
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
          <FolderIcon size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Cases</Text>
        </Pressable>

        <Pressable style={styles.navTab}>
          <BarChartIcon size={24} color="#001b44" />
          <Text style={[styles.navLabel, styles.navActive]}>Analytics</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(0,27,68,0.96)",
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
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnHovered: {
    backgroundColor: "rgba(247,198,0,0.2)",
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
    color: "#001b44",
  },
  pageSub: {
    fontSize: 14,
    color: "#6b7280",
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
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
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
    color: "#6b7280",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#001b44",
    marginBottom: 6,
  },
  statSub: {
    fontSize: 13,
    color: "#6b7280",
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
    color: "#dc2626",
  },
  trendOk: {
    color: "#16a34a",
  },

  // CHART CARD
  chartCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
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
    backgroundColor: "rgba(0,27,68,0.05)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  chartSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6b7280",
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
    color: "#111827",
    fontWeight: "500",
  },
  chartCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001b44",
  },
  chartTrack: {
    width: "100%",
    backgroundColor: "rgba(0,27,68,0.07)",
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
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
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
    color: "#6b7280",
  },
  navActive: {
    color: "#001b44",
  },
});
