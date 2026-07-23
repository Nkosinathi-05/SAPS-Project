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

// POWER / LOGOUT ICON
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

// ALERT / WARNING ICON
const AlertIcon = ({ size = 32, color = "#dc2626" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="12"
      y1="9"
      x2="12"
      y2="13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

// UNASSIGNED / CLOCK ICON
const ClockIcon = ({ size = 32, color = "#ca8a04" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Path
      d="M12 7v5l3 3"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// FOLDER ICON
const FolderIcon = ({ size = 32, color = "#00317a" }) => (
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

// BRIEFCASE / VIEW CASES ICON
const BriefcaseIcon = ({ size = 32, color = "#00317a" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Line x1="2" y1="13" x2="22" y2="13" stroke={color} strokeWidth="2" />
  </Svg>
);

// BAR CHART / ANALYTICS ICON
const BarChartIcon = ({ size = 32, color = "#00317a" }) => (
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

// HOME ICON
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

// FOLDER NAV ICON (smaller for bottom nav)
const FolderNavIcon = ({ size = 24, color = "#6b7280" }) => (
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

// BAR CHART NAV ICON (smaller for bottom nav)
const BarChartNavIcon = ({ size = 24, color = "#6b7280" }) => (
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

  const isSmall = width < 480;

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

      {/* MAIN SCROLL AREA */}
      <ScrollView
        contentContainerStyle={[
          styles.main,
          { paddingHorizontal: isSmall ? 12 : 32 },
        ]}
      >
        {/* PROFILE CARD */}
        <View style={[styles.profileCard, isSmall && styles.profileCardSmall]}>
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
            <View style={styles.statCard}>
              <AlertIcon size={32} color="#dc2626" />
              <View>
                <Text style={[styles.statNumber, { color: "#dc2626" }]}>8</Text>
                <Text style={styles.statLabel}>New Cases</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <ClockIcon size={32} color="#ca8a04" />
              <View>
                <Text style={[styles.statNumber, { color: "#ca8a04" }]}>
                  12
                </Text>
                <Text style={styles.statLabel}>Unassigned</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <FolderIcon size={32} color="#00317a" />
              <View>
                <Text style={[styles.statNumber, { color: "#00317a" }]}>
                  45
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
              onPress={() => {}}
            >
              <BriefcaseIcon size={32} color="#00317a" />
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
              onPress={() => {}}
            >
              <BarChartIcon size={32} color="#00317a" />
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
          <HomeIcon size={24} color="#001b44" />
          <Text style={[styles.navLabel, styles.navActive]}>Dashboard</Text>
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
          <FolderNavIcon size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Cases</Text>
        </Pressable>

        <Pressable
          style={styles.navTab}
          onPress={() =>
            router.replace({
              pathname: "/AnalyticsScreen",
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
          <BarChartNavIcon size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Analytics</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  // PROFILE CARD
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    padding: 32,
    backgroundColor: "#001b44",
    borderRadius: 24,
    shadowColor: "#000",
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
    borderColor: "#c9a207",
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
    color: "#ffffff",
  },
  profileRole: {
    marginTop: 4,
    color: "rgba(255,255,255,0.7)",
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
    backgroundColor: "rgba(247,198,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(247,198,0,0.3)",
  },
  pillText: {
    color: "#f7c600",
    fontSize: 13,
    fontWeight: "600",
  },

  // SECTION
  sectionLabel: {
    fontSize: 13,
    color: "#6b7280",
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
    flexDirection: "column",
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
  },
  statLabel: {
    color: "#6b7280",
    marginTop: 4,
  },

  // ACTIONS
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  actionsGridSmall: {
    flexDirection: "column",
  },
  actionBtn: {
    flex: 1,
    minWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
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
    color: "#111827",
  },
  actionSubtitle: {
    color: "#6b7280",
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
