import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  PowerIcon,
  ClipboardIcon,
  HourglassIcon,
  BarChartIcon,
  CheckCircleIcon,
  TrendUpIcon,
} from "../components/icons/buttons";
import {
  AnalyticsIcon,
  FolderNavIcon,
  HomeIcon,
} from "../components/icons/navigations";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Colors } from "../constants/FormTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

const API_URL = "http://localhost:5000/analytics";

const CHART_COLOURS = [
  "#001b44",
  "#2563eb",
  "#16a34a",
  "#f7c600",
  "#dc2626",
  "#7c3aed",
  "#ea580c",
  "#64748b",
];

type ApiResponse<T> = {
  success: boolean;
  action?: string;
  data: T;
  message?: string;
};

type Overview = {
  total_cases: number;
  active_cases: number;
  unassigned_cases: number;
  assigned_cases: number;
  resolved_cases: number;
  resolution_rate: number | null;
  avg_active_age_days: number | null;
  avg_resolution_days: number | null;
};

type ChartItem = {
  label: string;
  total: number;
  active_cases?: number;
  resolved_cases?: number;
  resolution_rate?: number | null;
};

type TrendItem = {
  period: string;
  opened: number;
  resolved: number;
};

type WorkloadItem = {
  employee_number: string;
  detective: string;
  active_cases: number;
  resolved_cases: number;
  total_cases: number;
  workload_level: "LOW" | "NORMAL" | "HIGH";
};

type ExpertiseMatching = {
  assigned_cases_with_expertise: number;
  matched_cases: number;
  match_rate: number | null;
};

type PerformanceItem = {
  employee_number: string;
  detective: string;
  total_cases: number;
  resolved_cases: number;
  resolution_rate: number | null;
  avg_resolution_days: number | null;
};

type AttentionCase = {
  case_number: string;
  case_type: string;
  status: string;
  assigned_to: string | null;
  detective: string | null;
  days_open: number;
  reason: string;
};

type AnalyticsData = {
  overview: Overview;
  caseStatus: ChartItem[];
  caseTypes: ChartItem[];
  trends: TrendItem[];
  aging: ChartItem[];
  workload: WorkloadItem[];
  expertise: ExpertiseMatching;
  performance: PerformanceItem[];
  attentionCases: AttentionCase[];
  insights: string[];
};

async function getAnalytics<T>(action: string): Promise<T> {
  const response = await fetch(`${API_URL}?action=${action}`);
  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load analytics.");
  }

  return result.data;
}

function displayNumber(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) {
    return "—";
  }

  const number = Number(value);

  return `${Number.isInteger(number) ? number : number.toFixed(1)}${suffix}`;
}

function statusColour(status: string) {
  switch (status.toUpperCase()) {
    case "UNASSIGNED":
      return "#dc2626";
    case "ASSIGNED":
      return "#f7c600";
    case "RESOLVED":
      return "#16a34a";
    default:
      return "#2563eb";
  }
}

function workloadColour(level: string) {
  switch (level) {
    case "HIGH":
      return "#dc2626";
    case "NORMAL":
      return "#f7c600";
    default:
      return "#16a34a";
  }
}

function formatMonth(period: string) {
  return new Date(`${period}-01T00:00:00`).toLocaleDateString("en-ZA", {
    month: "short",
  });
}

function StatIcon({ type }: { type: string }) {
  switch (type) {
    case "total":
      return <ClipboardIcon size={22} color={Colors.sapsblue} />;
    case "active":
      return <HourglassIcon size={22} color="#f59e0b" />;
    case "resolved":
      return <CheckCircleIcon size={22} color={Colors.green} />;
    default:
      return null;
  }
}

function DoughnutChart({ data }: { data: ChartItem[] }) {
  const total = data.reduce((sum, item) => sum + Number(item.total || 0), 0);

  if (!total) {
    return <Text style={styles.emptyText}>No case-status data available.</Text>;
  }

  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.doughnutLayout}>
      <Svg width={125} height={125} viewBox="0 0 125 125">
        <Circle
          cx="62"
          cy="62"
          r={radius}
          stroke={Colors.grey200}
          strokeWidth="18"
          fill="none"
        />

        {data.map((item) => {
          const length = (item.total / total) * circumference;
          const currentOffset = offset;

          offset += length;

          return (
            <Circle
              key={item.label}
              cx="62"
              cy="62"
              r={radius}
              stroke={statusColour(item.label)}
              strokeWidth="18"
              fill="none"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-currentOffset}
              rotation="-90"
              origin="62,62"
            />
          );
        })}
      </Svg>

      <View style={styles.legendContainer}>
        {data.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: statusColour(item.label) },
              ]}
            />

            <Text style={styles.legendText}>
              {item.label}: {item.total}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function HorizontalBarChart({
  data,
  labelKey,
  valueKey,
  workloadColours = false,
  suffix = "",
}: {
  data: Record<string, any>[];
  labelKey: string;
  valueKey: string;
  workloadColours?: boolean;
  suffix?: string;
}) {
  if (!data.length) {
    return <Text style={styles.emptyText}>No data available.</Text>;
  }

  const maximum = Math.max(
    ...data.map((item) => Number(item[valueKey]) || 0),
    1,
  );

  return (
    <View style={styles.chartBars}>
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0;

        const colour = workloadColours
          ? workloadColour(item.workload_level)
          : CHART_COLOURS[index % CHART_COLOURS.length];

        return (
          <View key={`${item[labelKey]}-${index}`} style={styles.chartRow}>
            <View style={styles.chartRowMeta}>
              <Text numberOfLines={1} style={styles.chartLabel}>
                {item[labelKey]}
              </Text>

              <Text style={styles.chartCount}>
                {displayNumber(value, suffix)}
              </Text>
            </View>

            <View style={styles.chartTrack}>
              <View
                style={[
                  styles.chartFill,
                  {
                    width: `${(value / maximum) * 100}%`,
                    backgroundColor: colour,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TrendChart({
  data,
  width,
}: {
  data: TrendItem[];
  width: number;
}) {
  if (!data.length) {
    return <Text style={styles.emptyText}>No recent trend data available.</Text>;
  }

  const chartWidth = width - 48;
  const chartHeight = 150;
  const padding = 14;

  const maximum = Math.max(
    ...data.flatMap((item) => [item.opened, item.resolved]),
    1,
  );

  const getPoints = (key: "opened" | "resolved") => {
    const divisor = Math.max(data.length - 1, 1);

    return data
      .map((item, index) => {
        const x =
          padding + (index * (chartWidth - padding * 2)) / divisor;

        const y =
          chartHeight -
          padding -
          (item[key] / maximum) * (chartHeight - padding * 2);

        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <View style={styles.trendContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        <Line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke={Colors.grey300}
        />

        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke={Colors.grey300}
        />

        <Polyline
          points={getPoints("opened")}
          fill="none"
          stroke={Colors.sapsblue}
          strokeWidth="3"
        />

        <Polyline
          points={getPoints("resolved")}
          fill="none"
          stroke={Colors.green}
          strokeWidth="3"
        />
      </Svg>

      <View style={styles.trendLegend}>
        <Text style={styles.openedLegend}>● Cases opened</Text>
        <Text style={styles.resolvedLegend}>● Cases resolved</Text>
      </View>

      <View style={styles.monthLabels}>
        {data.map((item) => (
          <Text key={item.period} style={styles.monthLabel}>
            {formatMonth(item.period)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartCardHeader}>
        <Text style={styles.chartSectionLabel}>{title}</Text>
        {icon}
      </View>

      {children}
    </View>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;

  const {
    name,
    surname,
    rank,
    personalNumber,
    station,
    caseType,
    city,
  } = useLocalSearchParams<{
    name: string;
    surname: string;
    rank: string;
    personalNumber: string;
    station: string;
    caseType: string;
    city: string;
  }>();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [
        overview,
        caseStatus,
        caseTypes,
        trends,
        aging,
        workload,
        expertise,
        performance,
        attentionCases,
        insights,
      ] = await Promise.all([
        getAnalytics<Overview>("overview"),
        getAnalytics<ChartItem[]>("case_status"),
        getAnalytics<ChartItem[]>("case_types"),
        getAnalytics<TrendItem[]>("trends"),
        getAnalytics<ChartItem[]>("aging"),
        getAnalytics<WorkloadItem[]>("workload"),
        getAnalytics<ExpertiseMatching>("expertise_matching"),
        getAnalytics<PerformanceItem[]>("resolution_performance"),
        getAnalytics<AttentionCase[]>("attention_cases"),
        getAnalytics<string[]>("insights"),
      ]);

      setAnalytics({
        overview,
        caseStatus,
        caseTypes,
        trends,
        aging,
        workload,
        expertise,
        performance,
        attentionCases,
        insights,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load analytics.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const navigateTo = (pathname: string) => {
    router.navigate({
      pathname: pathname as any,
      params: {
        personalNumber,
        name,
        surname,
        rank,
        station,
        caseType,
        city,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
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
            <PowerIcon size={18} color={Colors.white} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.sapsblue} />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : error || !analytics ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorTitle}>Analytics unavailable</Text>
            <Text style={styles.errorText}>
              {error || "Could not load analytics."}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadAnalytics()}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.main,
              { paddingHorizontal: isSmall ? 12 : 32 },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadAnalytics(true)}
                tintColor={Colors.sapsblue}
              />
            }
          >
            <View>
              <Text style={styles.pageTitle}>Commander Analytics</Text>
              <Text style={styles.pageSub}>{city ?? "JOHANNESBURG"} CENTRAL</Text>
            </View>

            <View style={[styles.statsGrid, isSmall && styles.statsGridSmall]}>
              <View style={[styles.statCard, isSmall && styles.statCardSmall]}>
                <View style={styles.statCardTop}>
                  <Text style={styles.statLabel}>Total Cases</Text>
                  <StatIcon type="total" />
                </View>

                <Text style={styles.statValue}>
                  {displayNumber(analytics.overview.total_cases)}
                </Text>

                <Text style={styles.statSub}>All registered cases</Text>
              </View>

              <View style={[styles.statCard, isSmall && styles.statCardSmall]}>
                <View style={styles.statCardTop}>
                  <Text style={styles.statLabel}>Active</Text>
                  <StatIcon type="active" />
                </View>

                <Text style={styles.statValue}>
                  {displayNumber(analytics.overview.active_cases)}
                </Text>

                <Text style={styles.statSub}>Assigned and unassigned</Text>
              </View>

              <View style={[styles.statCard, isSmall && styles.statCardSmall]}>
                <View style={styles.statCardTop}>
                  <Text style={styles.statLabel}>Resolved</Text>
                  <StatIcon type="resolved" />
                </View>

                <Text style={styles.statValue}>
                  {displayNumber(analytics.overview.resolved_cases)}
                </Text>

                <Text style={[styles.statSub, styles.resolvedSub]}>
                  {displayNumber(analytics.overview.resolution_rate, "%")} resolution rate
                </Text>
              </View>
            </View>

            <View style={styles.secondaryStats}>
              <View style={styles.secondaryStat}>
                <Text style={styles.secondaryLabel}>Unassigned backlog</Text>
                <Text style={styles.secondaryValue}>
                  {displayNumber(analytics.overview.unassigned_cases)}
                </Text>
              </View>

              <View style={styles.secondaryStat}>
                <Text style={styles.secondaryLabel}>Average active age</Text>
                <Text style={styles.secondaryValue}>
                  {displayNumber(
                    analytics.overview.avg_active_age_days,
                    " days",
                  )}
                </Text>
              </View>

              <View style={styles.secondaryStat}>
                <Text style={styles.secondaryLabel}>Average resolution</Text>
                <Text style={styles.secondaryValue}>
                  {displayNumber(
                    analytics.overview.avg_resolution_days,
                    " days",
                  )}
                </Text>
              </View>
            </View>

            <ChartCard
              title="Case Status"
              icon={<CheckCircleIcon size={20} color={Colors.grey500} />}
            >
              <DoughnutChart data={analytics.caseStatus} />
            </ChartCard>

            <ChartCard
              title="Case Trends"
              icon={<TrendUpIcon size={20} color={Colors.grey500} />}
            >
              <TrendChart data={analytics.trends} width={width} />
            </ChartCard>

            <ChartCard
              title="Crime Category"
              icon={<BarChartIcon size={20} color={Colors.grey500} />}
            >
              <HorizontalBarChart
                data={analytics.caseTypes}
                labelKey="label"
                valueKey="total"
              />
            </ChartCard>

            <ChartCard
              title="Unresolved Case Age"
              icon={<HourglassIcon size={20} color={Colors.grey500} />}
            >
              <HorizontalBarChart
                data={analytics.aging}
                labelKey="label"
                valueKey="total"
              />
            </ChartCard>

            <ChartCard
              title="Detective Workload"
              icon={<ClipboardIcon size={20} color={Colors.grey500} />}
            >
              <HorizontalBarChart
                data={analytics.workload}
                labelKey="detective"
                valueKey="active_cases"
                workloadColours
              />
            </ChartCard>

            <ChartCard
              title="Expertise Matching"
              icon={<CheckCircleIcon size={20} color={Colors.grey500} />}
            >
              <View style={styles.expertiseContent}>
                <Text style={styles.expertiseRate}>
                  {displayNumber(analytics.expertise.match_rate, "%")}
                </Text>

                <View style={styles.expertiseDetails}>
                  <Text style={styles.expertiseTitle}>
                    Officer expertise matched to offence type
                  </Text>

                  <Text style={styles.expertiseDescription}>
                    {analytics.expertise.matched_cases || 0} of{" "}
                    {analytics.expertise.assigned_cases_with_expertise || 0}{" "}
                    cases are assigned to an officer with matching expertise.
                  </Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Number(analytics.expertise.match_rate || 0),
                        ),
                      )}%`,
                    },
                  ]}
                />
              </View>
            </ChartCard>

            <ChartCard
              title="Detective Resolution Performance"
              icon={<CheckCircleIcon size={20} color={Colors.grey500} />}
            >
              <HorizontalBarChart
                data={analytics.performance}
                labelKey="detective"
                valueKey="resolution_rate"
                suffix="%"
              />
            </ChartCard>

            <ChartCard
              title="Cases Requiring Attention"
              icon={<HourglassIcon size={20} color={Colors.grey500} />}
            >
              {analytics.attentionCases.length ? (
                <View style={styles.attentionList}>
                  {analytics.attentionCases.map((item) => (
                    <View key={item.case_number} style={styles.attentionCase}>
                      <View style={styles.attentionInfo}>
                        <Text style={styles.caseNumber}>
                          {item.case_number}
                        </Text>

                        <Text style={styles.caseMeta}>
                          {item.case_type} ·{" "}
                          {item.detective || "Not assigned"}
                        </Text>

                        <Text style={styles.caseReason}>{item.reason}</Text>
                      </View>

                      <View style={styles.daysBadge}>
                        <Text style={styles.daysNumber}>{item.days_open}</Text>
                        <Text style={styles.daysLabel}>days</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  No overdue unassigned or critically aged cases.
                </Text>
              )}
            </ChartCard>

            <ChartCard
              title="Commander Insights"
              icon={<TrendUpIcon size={20} color={Colors.grey500} />}
            >
              <View style={styles.insightsContent}>
                {analytics.insights.map((insight, index) => (
                  <View key={`${insight}-${index}`} style={styles.insightRow}>
                    <View style={styles.insightDot} />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </ChartCard>
          </ScrollView>
        )}

        <View style={[styles.bottomNav, isSmall && styles.bottomNavSmall]}>
          <Pressable
            style={styles.navTab}
            onPress={() => navigateTo("/CommanderDashboardScreen")}
          >
            <HomeIcon />
            <Text style={styles.navLabel}>Dashboard</Text>
          </Pressable>

          <Pressable
            style={styles.navTab}
            onPress={() => navigateTo("/CaseListScreen")}
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
    backgroundColor: Colors.white,
  },

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

  main: {
    paddingTop: 24,
    paddingBottom: 100,
    gap: 20,
  },

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

  statCardSmall: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 0,
    flexShrink: 1,
  },

  statCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "stretch",
    width: "100%",
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
    fontSize: 12,
    color: Colors.grey500,
  },

  resolvedSub: {
    color: Colors.green,
    fontWeight: "700",
  },

  secondaryStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  secondaryStat: {
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: "#eef3ff",
    borderRadius: 14,
    padding: 14,
  },

  secondaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.grey500,
  },

  secondaryValue: {
    color: Colors.sapsblue,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },

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

  doughnutLayout: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
  },

  legendContainer: {
    flex: 1,
    marginLeft: 10,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  legendDot: {
    width: 9,
    height: 9,
    marginRight: 8,
    borderRadius: 5,
  },

  legendText: {
    color: Colors.sapsblue,
    fontSize: 12,
    fontWeight: "500",
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
    flex: 1,
    paddingRight: 12,
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
    height: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: Colors.grey200,
  },

  chartFill: {
    height: "100%",
    borderRadius: 999,
  },

  trendContainer: {
    padding: 24,
  },

  trendLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },

  openedLegend: {
    color: Colors.sapsblue,
    fontSize: 11,
    marginRight: 18,
  },

  resolvedLegend: {
    color: Colors.green,
    fontSize: 11,
  },

  monthLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  monthLabel: {
    color: Colors.grey500,
    fontSize: 10,
  },

  expertiseContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  expertiseRate: {
    width: 84,
    height: 84,
    overflow: "hidden",
    textAlign: "center",
    color: Colors.green,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 72,
    borderWidth: 6,
    borderColor: Colors.green,
    borderRadius: 42,
  },

  expertiseDetails: {
    flex: 1,
    marginLeft: 16,
  },

  expertiseTitle: {
    color: Colors.sapsblue,
    fontSize: 13,
    fontWeight: "700",
  },

  expertiseDescription: {
    color: Colors.grey500,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  progressTrack: {
    height: 10,
    overflow: "hidden",
    margin: 24,
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: Colors.grey200,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.green,
  },

  attentionList: {
    paddingHorizontal: 24,
  },

  attentionCase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey300,
  },

  attentionInfo: {
    flex: 1,
    paddingRight: 12,
  },

  caseNumber: {
    color: Colors.sapsblue,
    fontSize: 13,
    fontWeight: "800",
  },

  caseMeta: {
    color: Colors.grey500,
    fontSize: 11,
    marginTop: 4,
  },

  caseReason: {
    color: Colors.red,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },

  daysBadge: {
    minWidth: 54,
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
  },

  daysNumber: {
    color: Colors.red,
    fontSize: 17,
    fontWeight: "800",
  },

  daysLabel: {
    color: Colors.red,
    fontSize: 9,
  },

  insightsContent: {
    padding: 24,
    paddingTop: 10,
  },

  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },

  insightDot: {
    width: 7,
    height: 7,
    marginTop: 6,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: Colors.sapsblue,
  },

  insightText: {
    flex: 1,
    color: Colors.sapsblue,
    fontSize: 13,
    lineHeight: 19,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },

  loadingText: {
    color: Colors.grey500,
    marginTop: 12,
  },

  errorTitle: {
    color: Colors.red,
    fontSize: 20,
    fontWeight: "800",
  },

  errorText: {
    color: Colors.grey500,
    marginTop: 8,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.sapsblue,
  },

  retryButtonText: {
    color: Colors.white,
    fontWeight: "700",
  },

  emptyText: {
    color: Colors.grey500,
    padding: 24,
    textAlign: "center",
  },

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