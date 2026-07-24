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
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";

//LOCATION ICON
const PinIcon = ({ size = 16, color = "#f7c600" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill={color}
    />
    <Circle cx="12" cy="9" r="2.5" fill="white" />
  </Svg>
);

//DIVISION ICON
const BuildingIcon = ({ size = 16, color = "#f7c600" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="1"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    />
    <Rect x="9" y="9" width="2" height="2" fill={color} />
    <Rect x="13" y="9" width="2" height="2" fill={color} />
    <Rect x="9" y="13" width="2" height="2" fill={color} />
    <Rect x="13" y="13" width="2" height="2" fill={color} />
    <Rect x="10" y="17" width="4" height="4" fill={color} />
    <Rect x="3" y="7" width="18" height="1.5" fill={color} />
  </Svg>
);

// ALERT ICON
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

//IN PROGRESS ICON
const ClockIcon = ({ size = 32, color = "#ca8a04" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Path
      d="M12 7v5l3 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// TOTAL ACTIVE ICON
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

//CREATE CASE ICON
const PlusIcon = ({ size = 32, color = "#00317a" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Line
      x1="12"
      y1="8"
      x2="12"
      y2="16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="8"
      y1="12"
      x2="16"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// VIEW CASES ICON
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

// LOGOUT ICON
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
            router.push("/");
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
        <View style={[styles.profileCard, isMedium && styles.profileCardSmall]}>
          {/* AVATAR */}
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri: "https://tse4.mm.bing.net/th/id/OIP.RuiYdm6APQVna3xXcyCX6AHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
              }}
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
                <Text style={[styles.statNumber, { color: "#dc2626" }]}>3</Text>
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
                <Text style={[styles.statNumber, { color: "#ca8a04" }]}>5</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
            </Pressable>

            <Pressable style={styles.statCard}>
              <FolderIcon size={32} color="#00317a" />
              <View>
                <Text style={[styles.statNumber, { color: "#00317a" }]}>
                  12
                </Text>
                <Text style={styles.statLabel}>Total Active</Text>
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
                router.replace({
                  pathname: "/P21Screen",
                });
              }}
            >
              <PlusIcon size={32} color="#00317a" />
              <View>
                <Text style={styles.actionTitle}>Create Case</Text>
                <Text style={styles.actionSubtitle}>Open a new case file</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ hovered }) => [
                styles.actionBtn,
                hovered && styles.actionBtnHovered,
              ]}
              onPress={() => {
                router.push({
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
    marginLeft: 8,
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
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
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
    minWidth: 180,
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
    backgroundColor: "rgba(247,198,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(247,198,0,0.3)",
  },
  pillText: {
    color: "#f7c600",
    fontSize: 13,
    fontWeight: "600",
  },

  // STATION INFO
  stationInfo: {
    flexDirection: "column",
    gap: 14,
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.15)",
    minWidth: 220,
  },
  stationInfoSmall: {
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
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
    color: "rgba(255,255,255,0.45)",
    marginBottom: 2,
  },
  stationValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
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
  statCardHovered: {
    transform: [{ translateY: -4 }],
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
});
