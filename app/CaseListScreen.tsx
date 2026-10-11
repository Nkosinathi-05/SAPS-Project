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
  LogoutIcon,
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
import { CommonStyles } from "../constants/styles";
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
        <Text
          style={{ fontSize: 12, color: value ? "#1a1a1a" : Colors.grey500 }}
        >
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
          <Pressable
            style={styles.calendarPopup}
            onPress={(e) => e.stopPropagation()}
          >
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
                <Text key={i} style={styles.calendarWeekday}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {dayCells.map((day, index) => {
                const isSelected =
                  value ===
                  `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.calendarDay,
                      isSelected && styles.calendarDaySelected,
                    ]}
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
              <Pressable
                style={styles.calendarClearBtn}
                onPress={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
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

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectives, setDetectives] = useState<Detective[]>([]);

  const {
    name,
    surname,
    rank,
    personalNumber,
    station,
    caseType,
    city,
    dateMin: paramDateMin,
    dateMax: paramDateMax,
    search: paramSearch,
  } = useLocalSearchParams<{
    name: string;
    surname: string;
    rank: string;
    personalNumber: string;
    station: string;
    caseType: string;
    city: string;
    dateMin?: string;
    dateMax?: string;
    search?: string;
  }>();

  const [dateMin, setDateMin] = useState(paramDateMin ?? "");
  const [dateMax, setDateMax] = useState(paramDateMax ?? "");
  const [search, setSearch] = useState(paramSearch ?? "");
  //FETCH CASES
  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(`${API_BASE_URL}/cases?action=case_list`, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

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
  const normalise = (s?: string) => (s ?? "").trim().toLowerCase();

  const toTitleCase = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (ch) => ch.toUpperCase());

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    cases.forEach((c) => {
      const key = normalise(c.offence);
      if (key && !unique.has(key)) unique.set(key, toTitleCase(c.offence));
    });
    const labels = Array.from(unique.values()).sort((a, b) =>
      a.localeCompare(b),
    );
    return ["All", ...labels];
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
    <SafeAreaView
      style={CommonStyles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={CommonStyles.container}>
        {/* HEADER */}
        <View style={CommonStyles.header}>
          <View style={CommonStyles.logoWrapper}>
            <Image
              source={require("../assets/images/saps-logo.png")}
              style={CommonStyles.sapsLogo}
              resizeMode="cover"
            />
          </View>

          <View style={CommonStyles.headerText}>
            <Text style={CommonStyles.headerTitle}>
              {city ?? "JOHANNESBURG"} CENTRAL
            </Text>
            <Text style={CommonStyles.headerSubtitle}>
              South African Police Service · Gauteng
            </Text>
          </View>

          <Pressable
            style={({ hovered }) => [
              CommonStyles.logoutBtn,
              hovered && CommonStyles.logoutBtnHovered,
            ]}
            onPress={() => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/");
            }}
          >
            <LogoutIcon size={18} color="#ffffff" />
          </Pressable>
        </View>

        {/* MAIN */}
        <ScrollView
          contentContainerStyle={[
            CommonStyles.main,
            { paddingHorizontal: isSmall ? 12 : 24 },
          ]}
        >
          {/* SEARCH */}
          <View style={CommonStyles.searchWrap}>
            <SearchIcon />
            <TextInput
              style={CommonStyles.searchInput}
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
                    onPress={() => setDetectiveFilter(detective.employeeNumber)}
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
          <Text style={CommonStyles.sectionLabel}>
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
            <View style={CommonStyles.caseList}>
              {filteredCases.length === 0 ? (
                <Text style={CommonStyles.emptyText}>No cases found.</Text>
              ) : (
                filteredCases.map((c, index) => (
                  <Pressable
                    key={`${c.caseNumber}-${index}`}
                    style={({ hovered, pressed }) => [
                      CommonStyles.caseCard,
                      hovered && CommonStyles.caseCardHovered,
                      pressed && CommonStyles.caseCardPressed,
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
                          assignedTo: c.assignedTo,
                          caseId: c.caseId,
                          station,
                          caseType,
                        },
                      })
                    }
                  >
                    {/* TOP ROW */}
                    <View style={CommonStyles.caseCardTop}>
                      <Text style={CommonStyles.caseId}>{c.caseNumber}</Text>
                      <Text style={CommonStyles.caseTime}>{c.dateOpened}</Text>
                    </View>

                    {/* BOTTOM ROW */}
                    <View style={CommonStyles.caseCardBottom}>
                      <View style={{ flex: 1 }}>
                        <Text style={CommonStyles.caseVictim}>
                          {c.victim.toUpperCase()}
                        </Text>
                        <View style={CommonStyles.caseTypeRow}>
                          <ScalesIcon size={14} color="#444650" />
                          <Text style={CommonStyles.caseType}>
                            {c.offence.toUpperCase() || "Unknown"}
                          </Text>
                        </View>
                        {c.place ? (
                          <Text style={CommonStyles.casePlace}>
                            <PinIcon /> {c.place.toUpperCase()}
                          </Text>
                        ) : null}
                      </View>
                      {/* Progress status */}
                      <View style={CommonStyles.progress}>
                        <Text style={CommonStyles.progressText}>
                          {c.status}
                        </Text>
                      </View>
                    </View>

                    {/* INVESTIGATION LOG BUTTON — assigned/resolved cases only */}
                    {(c.status === "ASSIGNED" || c.status === "RESOLVED") && (
                      <Pressable
                        style={({ hovered, pressed }) => [
                          CommonStyles.logButton,
                          hovered && CommonStyles.logButtonHovered,
                          pressed && CommonStyles.logButtonPressed,
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
                        {({ hovered, pressed }) => (
                          <Text
                            style={[
                              CommonStyles.logButtonText,
                              (hovered || pressed) &&
                                CommonStyles.logButtonTextHovered,
                            ]}
                          >
                            Investigation Log
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </Pressable>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* BOTTOM NAV */}
        <View style={[CommonStyles.bottomNav, CommonStyles.bottomNavSmall]}>
          <Pressable
            style={CommonStyles.navTab}
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
            <Text style={CommonStyles.navLabel}>Dashboard</Text>
          </Pressable>

          <Pressable style={CommonStyles.navTab}>
            <FolderNavIcon />
            <Text style={[CommonStyles.navLabel, CommonStyles.navActive]}>
              Cases
            </Text>
          </Pressable>

          <Pressable
            style={CommonStyles.navTab}
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
            <Text style={CommonStyles.navLabel}>Analytics</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
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
});
