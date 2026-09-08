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
import {
  PowerIcon,
  SearchIcon,
  ScalesIcon,
  PinIcon,
} from "../components/icons/buttons";
import {
  AnalyticsIcon,
  FolderNavIcon,
  HomeIcon,
} from "../components/icons/navigations";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { FILTERS, type CaseItem } from "../constants/Lists";
import { Colors } from "../constants/FormTheme";
import { SafeAreaView } from "react-native-safe-area-context";

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

  //FETCH
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

  //FILTER + SEARCH
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
            <PowerIcon />
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
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search case number or victim..."
              placeholderTextColor={Colors.grey500}
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
              color={Colors.sapsblue}
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
                      <Text style={styles.caseTime}>{c.dateOpened}</Text>
                    </View>

                    {/* BOTTOM ROW */}
                    <View style={styles.caseCardBottom}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.caseVictim}>
                          {c.victim.toUpperCase()}
                        </Text>
                        <View style={styles.caseTypeRow}>
                          <ScalesIcon size={14} color="#444650" />
                          <Text style={styles.caseType}>
                            {c.offence || "Unknown"}
                          </Text>
                        </View>
                        {c.place ? (
                          <Text style={styles.casePlace}>
                            <PinIcon /> {c.place.toUpperCase()}
                          </Text>
                        ) : null}
                      </View>
                      {/* Progress status */}
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{c.status}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* BOTTOM NAV */}
        <View style={[styles.bottomNav, styles.bottomNavSmall]}>
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

          <Pressable style={styles.navTab}>
            <FolderNavIcon />
            <Text style={[styles.navLabel, styles.navActive]}>Cases</Text>
          </Pressable>

          <Pressable
            style={styles.navTab}
            onPress={() =>
              router.navigate({
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
            <AnalyticsIcon />
            <Text style={styles.navLabel}>Analytics</Text>
          </Pressable>
        </View>
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
  container: { flex: 1, backgroundColor: Colors.white },
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
  sapsLogo: { width: "100%", height: "100%" },
  headerText: { flex: 1, marginLeft: 4 },
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
  logoutBtnHovered: { backgroundColor: Colors.logoutHovered },

  // MAIN
  main: { paddingTop: 20, paddingBottom: 100, gap: 16 },

  // SEARCH
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.sapsblue,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.white,
  },

  // CHIPS
  filterChips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.sapsblue,
    borderColor: Colors.sapsblue,
  },
  chipInactive: { backgroundColor: Colors.white, borderColor: Colors.grey500 },
  chipText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  chipTextActive: { color: Colors.white },
  chipTextInactive: { color: Colors.grey500 },

  // SECTION
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.grey500,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.grey500,
    marginTop: 40,
    fontSize: 14,
  },

  // CASE LIST
  caseList: { gap: 12 },
  caseCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 12,
    padding: 16,
  },
  caseCardHovered: {
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderColor: Colors.grey500,
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
    color: Colors.sapsblue,
  },
  caseTime: { fontSize: 12, color: Colors.grey500 },
  caseCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  caseVictim: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.sapsblue,
    marginBottom: 4,
  },
  caseTypeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  caseType: { fontSize: 13, color: Colors.grey500 },
  casePlace: { fontSize: 11, color: Colors.sapsblue, marginTop: 4 },
  dateBadge: {
    backgroundColor: Colors.sapsblue,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dateBadgeText: { fontSize: 11, fontWeight: "700", color: Colors.white },

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
    paddingVertical: 6,
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.grey500,
    letterSpacing: 0.5,
  },
  navActive: { color: Colors.sapsblue },
});
