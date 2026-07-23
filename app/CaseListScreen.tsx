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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import Svg, { Path, Circle, Line } from "react-native-svg";

// ── ICONS ─────────────────────────────────────────────────────────────────────

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

const SearchIcon = ({ size = 18, color = "#9ca3af" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="11" cy="11" r="7" fill="none" stroke={color} strokeWidth="2" />
    <Line
      x1="16.5"
      y1="16.5"
      x2="22"
      y2="22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const ScalesIcon = ({ size = 14, color = "#444650" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line
      x1="12"
      y1="3"
      x2="12"
      y2="21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M5 6l-3 6a3 3 0 006 0L5 6z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M19 6l-3 6a3 3 0 006 0L19 6z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Line
      x1="5"
      y1="6"
      x2="19"
      y2="6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="9"
      y1="21"
      x2="15"
      y2="21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

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

const BarChartIcon = ({ size = 24, color = "#6b7280" }) => (
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

// ── TYPES ─────────────────────────────────────────────────────────────────────

type CaseItem = {
  caseNumber: string;
  dateOpened: string;
  victim: string;
  offence: string;
  place: string;
  time: string;
  caseDescription: string;
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Murder", "Rape", "Assault", "Theft", "Violence"];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function CaseListPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ── FETCH ──
  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(
          "https://danger-reliable-conclude.ngrok-free.dev/cases",
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        const data = await response.json();

        // Map raw backend objects into clean CaseItem shape
        const mapped: CaseItem[] = data.map((item: any) => {
          let offence = "";
          let place = "";
          let time = "";
          let caseDescription = "";

          try {
            const mo = JSON.parse(item.MODUS_OPERANDI);
            offence = mo.offence ?? "";
            place = mo.place ?? "";
            time = mo.time ?? "";
          } catch (_) {}
          try {
            const p21 = JSON.parse(item.P21);
            caseDescription = p21.Casedescription ?? "";
          } catch (_) {}
          return {
            caseNumber: item.CASE_NUMBER ?? "",
            dateOpened: item.DATE_OPENED ?? "",
            victim: item.VICTIM ?? "",
            offence,
            place,
            time,
            caseDescription,
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

  // ── FILTER + SEARCH ──
  const filteredCases = cases.filter((c) => {
    const matchesFilter =
      activeFilter === "All" ||
      c.offence.toLowerCase().includes(activeFilter.toLowerCase());
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.victim.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          { paddingHorizontal: isSmall ? 12 : 24 },
        ]}
      >
        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <SearchIcon size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search case number or victim..."
            placeholderTextColor="#757682"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.chip,
                activeFilter === filter
                  ? styles.chipActive
                  : styles.chipInactive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === filter
                    ? styles.chipTextActive
                    : styles.chipTextInactive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* SECTION LABEL */}
        <Text style={styles.sectionLabel}>
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

        {/* CASE LIST */}
        {!loading && (
          <View style={styles.caseList}>
            {filteredCases.length === 0 ? (
              <Text style={styles.emptyText}>No cases found.</Text>
            ) : (
              filteredCases.map((c, index) => (
                <Pressable
                  key={`${c.caseNumber}-${index}`}
                  style={({ hovered, pressed }) => [
                    styles.caseCard,
                    hovered && styles.caseCardHovered,
                    pressed && styles.caseCardPressed,
                  ]}
                  onPress={() =>
                    router.replace({
                      pathname: "/CaseViewScreen",
                      params: {
                        victim: c.victim,
                        caseNumber: c.caseNumber,
                        type: c.offence,
                        name,
                        rank,
                        personalNumber,
                        surname,
                        city,
                        description: c.caseDescription,
                      },
                    })
                  }
                >
                  {/* TOP ROW */}
                  <View style={styles.caseCardTop}>
                    <Text style={styles.caseId}>{c.caseNumber}</Text>
                    <Text style={styles.caseTime}>
                      {c.time || c.dateOpened}
                    </Text>
                  </View>

                  {/* BOTTOM ROW */}
                  <View style={styles.caseCardBottom}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.caseVictim}>{c.victim}</Text>
                      <View style={styles.caseTypeRow}>
                        <ScalesIcon size={14} color="#444650" />
                        <Text style={styles.caseType}>
                          {c.offence || "Unknown"}
                        </Text>
                      </View>
                      {c.place ? (
                        <Text style={styles.casePlace}>📍 {c.place}</Text>
                      ) : null}
                    </View>

                    {/* DATE BADGE */}
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateBadgeText}>
                        {c.dateOpened.split(" ")[0]}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
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
          <HomeIcon size={22} color="#444650" />
          <Text style={styles.navLabel}>Dashboard</Text>
        </Pressable>

        <Pressable style={styles.navTab}>
          <FolderIcon size={22} color="#00113a" />
          <Text style={[styles.navLabel, styles.navActive]}>Cases</Text>
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
          <BarChartIcon size={22} color="#444650" />
          <Text style={styles.navLabel}>Analytics</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f3ff" },

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
    borderColor: "rgba(252,212,0,0.5)",
  },
  sapsLogo: { width: "100%", height: "100%" },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnHovered: { backgroundColor: "rgba(252,212,0,0.2)" },

  // MAIN
  main: { paddingTop: 20, paddingBottom: 100, gap: 16 },

  // SEARCH
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,27,68,0.96)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(252,212,0,0.5)",
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#ffffff" },

  // CHIPS
  filterChips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: "#00113a", borderColor: "#00113a" },
  chipInactive: { backgroundColor: "#ffffff", borderColor: "#c5c6d2" },
  chipText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  chipTextActive: { color: "#ffffff" },
  chipTextInactive: { color: "#444650" },

  // SECTION
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#444650",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    fontSize: 14,
  },

  // CASE LIST
  caseList: { gap: 12 },
  caseCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c5c6d2",
    borderRadius: 12,
    padding: 16,
  },
  caseCardHovered: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderColor: "#757682",
  },
  caseCardPressed: { transform: [{ scale: 0.98 }] },
  caseCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  caseId: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#00113a",
  },
  caseTime: { fontSize: 12, color: "#444650" },
  caseCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  caseVictim: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111c2c",
    marginBottom: 4,
  },
  caseTypeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  caseType: { fontSize: 13, color: "#444650" },
  casePlace: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  dateBadge: {
    backgroundColor: "#dee8ff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dateBadgeText: { fontSize: 11, fontWeight: "700", color: "#00113a" },

  // BOTTOM NAV
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#c5c6d2",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 8,
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#444650",
    letterSpacing: 0.5,
  },
  navActive: { color: "#00113a" },
});
