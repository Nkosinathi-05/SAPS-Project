import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
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
import { useState, useEffect, useMemo } from "react";
import { type CaseItem } from "../constants/Lists";
import { Colors } from "../constants/FormTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../constants/ApiUrl";

type Detective = {
  employeeNumber: string;
  name: string;
  surname: string;
};

const STATUS_OPTIONS = ["All", "UNASSIGNED", "ASSIGNED", "RESOLVED"];

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const initial = value ? new Date(value) : today;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-11

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const pickDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const dayCells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={styles.dateInput} onPress={() => setOpen(true)}>
        <Text style={{ fontSize: 12, color: value ? "#1a1a1a" : Colors.grey500 }}>
          {value || label}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.calendarPopup} onPress={(e) => e.stopPropagation()}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={goPrevMonth} style={styles.calendarNavBtn}>
                <Text style={styles.calendarNavText}>‹</Text>
              </Pressable>
              <Text style={styles.calendarMonthLabel}>
                {monthNames[viewMonth]} {viewYear}
              </Text>
              <Pressable onPress={goNextMonth} style={styles.calendarNavBtn}>
                <Text style={styles.calendarNavText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.calendarWeekRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <Text key={i} style={styles.calendarWeekday}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {dayCells.map((day, index) => {
                const isSelected =
                  value === `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                return (
                  <Pressable
                    key={index}
                    style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                    disabled={day === null}
                    onPress={() => day !== null && pickDay(day)}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                        day === null && { opacity: 0 },
                      ]}
                    >
                      {day ?? ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {value ? (
              <Pressable style={styles.calendarClearBtn} onPress={() => { onChange(""); setOpen(false); }}>
                <Text style={styles.calendarClearText}>Clear</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function CaseListPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;

  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detectiveFilter, setDetectiveFilter] = useState("All");

  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectives, setDetectives] = useState<Detective[]>([]);

  const { name, surname, rank, personalNumber, station, caseType, city, dateMin: paramDateMin,
    dateMax: paramDateMax,} =
    useLocalSearchParams<{
      name: string;
      surname: string;
      rank: string;
      personalNumber: string;
      station: string;
      caseType: string;
      city: string;
      dateMin: string;
      dateMax: string;
    }>();

  const [dateMin, setDateMin] = useState(paramDateMin ?? "");
  const [dateMax, setDateMax] = useState(paramDateMax ?? "");
  //FETCH CASES
  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cases?action=case_list`,
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
            caseId: item.CASE_ID?.toString() ?? "",
            assignedTo: item.ASSIGNED_TO ?? "",
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

  //FETCH DETECTIVES
  useEffect(() => {
    async function fetchDetectives() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/employees?action=filter&rank=DETECTIVE`,
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        const data = await response.json();

        const mapped: Detective[] = (Array.isArray(data) ? data : []).map(
          (item: any) => ({
            employeeNumber: item.EMPLOYEE_NUMBER ?? "",
            name: item.NAME ?? "",
            surname: item.SURNAME ?? "",
          }),
        );

        setDetectives(mapped);
      } catch (error) {
        console.error("Failed to fetch detectives:", error);
      }
    }

    fetchDetectives();
  }, []);

  //DYNAMIC CATEGORY LIST — built from whatever offences actually exist in the fetched cases
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(cases.map((c) => c.offence).filter((o) => o && o.trim())),
    ).sort();
    return ["All", ...unique];
  }, [cases]);

  //FILTER + SEARCH
  const filteredCases = cases.filter((c) => {
    const matchesCategory =
      activeCategory === "All" ||
      c.offence.toLowerCase() === activeCategory.toLowerCase();

    const matchesStatus =
      statusFilter === "All" || c.status.toUpperCase() === statusFilter;

    const matchesDetective =
      detectiveFilter === "All" || c.assignedTo === detectiveFilter;

    const caseDate = c.dateOpened ? c.dateOpened.slice(0, 10) : "";
    const matchesMinDate = !dateMin || (caseDate && caseDate >= dateMin);
    const matchesMaxDate = !dateMax || (caseDate && caseDate <= dateMax);

    const matchesSearch =
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.victim.toLowerCase().includes(search.toLowerCase());

    return (
      matchesCategory &&
      matchesStatus &&
      matchesDetective &&
      matchesMinDate &&
      matchesMaxDate &&
      matchesSearch
    );
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

          {/* CATEGORY CHIPS — dynamic, from actual offences in the data */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.chip,
                  activeCategory === category
                    ? styles.chipActive
                    : styles.chipInactive,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeCategory === category
                      ? styles.chipTextActive
                      : styles.chipTextInactive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* MORE FILTERS TOGGLE */}
          <Pressable
            style={styles.moreFiltersBtn}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <Text style={styles.moreFiltersText}>
              {showFilters ? "Hide Filters ▲" : "More Filters ▼"}
            </Text>
          </Pressable>

          {showFilters && (
            <View style={styles.filterPanel}>
              {/* STATUS FILTER */}
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.chipRowWrap}>
                {STATUS_OPTIONS.map((statusOption) => (
                  <Pressable
                    key={statusOption}
                    style={[
                      styles.chip,
                      statusFilter === statusOption
                        ? styles.chipActive
                        : styles.chipInactive,
                    ]}
                    onPress={() => setStatusFilter(statusOption)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        statusFilter === statusOption
                          ? styles.chipTextActive
                          : styles.chipTextInactive,
                      ]}
                    >
                      {statusOption}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* DETECTIVE FILTER */}
              <Text style={styles.filterLabel}>Detective</Text>
              <View style={styles.chipRowWrap}>
                <Pressable
                  style={[
                    styles.chip,
                    detectiveFilter === "All"
                      ? styles.chipActive
                      : styles.chipInactive,
                  ]}
                  onPress={() => setDetectiveFilter("All")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      detectiveFilter === "All"
                        ? styles.chipTextActive
                        : styles.chipTextInactive,
                    ]}
                  >
                    All
                  </Text>
                </Pressable>
                {detectives.map((detective) => (
                  <Pressable
                    key={detective.employeeNumber}
                    style={[
                      styles.chip,
                      detectiveFilter === detective.employeeNumber
                        ? styles.chipActive
                        : styles.chipInactive,
                    ]}
                    onPress={() =>
                      setDetectiveFilter(detective.employeeNumber)
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        detectiveFilter === detective.employeeNumber
                          ? styles.chipTextActive
                          : styles.chipTextInactive,
                      ]}
                    >
                      {detective.name} {detective.surname}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* DATE RANGE FILTER */}
              <Text style={styles.filterLabel}>Date Opened Range</Text>
              <View style={styles.dateRow}>
                <DateField label="From" value={dateMin} onChange={setDateMin} />
                <DateField label="To" value={dateMax} onChange={setDateMax} />
              </View>
            </View>
          )}

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

                    {/* INVESTIGATION LOG BUTTON — assigned/resolved cases only */}
                    {(c.status === "ASSIGNED" || c.status === "RESOLVED") && (
                      <Pressable
                        style={({ hovered, pressed }) => [
                          styles.logButton,
                          hovered && styles.logButtonHovered,
                          pressed && styles.logButtonPressed,
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
                        <Text style={styles.logButtonText}>
                          Investigation Log
                        </Text>
                      </Pressable>
                    )}
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
  chipRowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
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

  // MORE FILTERS
  moreFiltersBtn: {
    alignSelf: "flex-start",
  },
  moreFiltersText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.sapsblue,
  },
  filterPanel: {
    backgroundColor: "#f5f7fb",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: Colors.grey500,
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey300,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: "#1a1a1a",
  },

  // DATE PICKER MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarPopup: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grey300,
    padding: 12,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  calendarNavBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  calendarNavText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.sapsblue,
  },
  calendarMonthLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  calendarWeekday: {
    width: 26,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    color: Colors.grey500,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  calendarDaySelected: {
    backgroundColor: Colors.sapsblue,
  },
  calendarDayText: {
    fontSize: 12,
    color: "#1a1a1a",
  },
  calendarDayTextSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  calendarClearBtn: {
    marginTop: 6,
    alignItems: "center",
    paddingVertical: 6,
  },
  calendarClearText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#c0392b",
  },

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

  // INVESTIGATION LOG BUTTON
  logButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.sapsblue,
    alignItems: "center",
  },
  logButtonHovered: {
    backgroundColor: Colors.sapsblue,
  },
  logButtonPressed: {
    opacity: 0.7,
  },
  logButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.sapsblue,
    letterSpacing: 0.5,
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