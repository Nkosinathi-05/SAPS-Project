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
import Svg, { Circle } from "react-native-svg";
import { API_BASE_URL } from "../constants/ApiUrl";

const API_URL = `${API_BASE_URL}/analytics`;

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
  victim: string;
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
  performance: PerformanceItem[];
  attentionCases: AttentionCase[];
  insights: string[];
};

async function getAnalytics<T>(action: string): Promise<T> {
  const response = await fetch(`${API_URL}?action=${action}`, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load analytics.");
  }

  return result.data;
}

/* ==========================================================
   Safe number formatting
   ========================================================== */

function displayNumber(
  value: number | null | undefined,
  suffix = "",
) {
  if (value === null || value === undefined) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${Number.isInteger(number) ? number : number.toFixed(1)}${suffix}`;
}

/* ==========================================================
   Status colours
   ========================================================== */

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

/* ==========================================================
   Workload colours
   ========================================================== */

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

/* ==========================================================
   Month formatter
   ========================================================== */

function formatMonth(period: string) {
  const date = new Date(`${period}-01T00:00:00`);

  return date.toLocaleDateString("en-ZA", {
    month: "short",
  });
}

/* ==========================================================
   Aging bucket -> date range helper

   Converts an aging chart label (e.g. "31-60 days") into a
   DATE_OPENED range CaseListScreen's filters can consume.
   ========================================================== */

function computeAgingDateRange(label: string): { dateMin: string; dateMax: string } {
  const today = new Date();

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  const daysAgo = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };

  switch (label) {
    case "0-7 days":
      return { dateMin: formatDate(daysAgo(7)), dateMax: formatDate(today) };
    case "8-30 days":
      return { dateMin: formatDate(daysAgo(30)), dateMax: formatDate(daysAgo(8)) };
    case "31-60 days":
      return { dateMin: formatDate(daysAgo(60)), dateMax: formatDate(daysAgo(31)) };
    case "61-90 days":
      return { dateMin: formatDate(daysAgo(90)), dateMax: formatDate(daysAgo(61)) };
    case "90+ days":
      return { dateMin: "", dateMax: formatDate(daysAgo(90)) };
    default:
      return { dateMin: "", dateMax: "" };
  }
}

/* ==========================================================
   Stat icons
   ========================================================== */

function StatIcon({ type }: { type: string }) {
  switch (type) {
    case "total":
      return (
        <ClipboardIcon
          size={22}
          color={Colors.sapsblue}
        />
      );

    case "active":
      return (
        <HourglassIcon
          size={22}
          color="#f59e0b"
        />
      );

    case "resolved":
      return (
        <CheckCircleIcon
          size={22}
          color={Colors.green}
        />
      );

    default:
      return null;
  }
}

/* ==========================================================
   Doughnut chart
   ========================================================== */

function DoughnutChart({
  data,
}: {
  data: ChartItem[];
}) {
  if (!data.length) {
    return (
      <Text style={styles.emptyText}>
        No case-status data available.
      </Text>
    );
  }

  const total = data.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  if (total <= 0) {
    return (
      <Text style={styles.emptyText}>
        No case-status data available.
      </Text>
    );
  }

  const radius = 43;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <View style={styles.doughnutLayout}>
      <Svg
        width={125}
        height={125}
        viewBox="0 0 125 125"
      >
        <Circle
          cx="62"
          cy="62"
          r={radius}
          stroke={Colors.grey200}
          strokeWidth="18"
          fill="none"
        />

        {data.map((item) => {
          const value = Number(item.total || 0);

          const length =
            (value / total) * circumference;

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
              strokeDasharray={`${length} ${
                circumference - length
              }`}
              strokeDashoffset={-currentOffset}
              rotation="-90"
              origin="62,62"
            />
          );
        })}
      </Svg>

      <View style={styles.legendContainer}>
        {data.map((item) => (
          <View
            key={item.label}
            style={styles.legendRow}
          >
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: statusColour(
                    item.label,
                  ),
                },
              ]}
            />

            <Text style={styles.legendText}>
              {item.label}:{" "}
              {displayNumber(item.total)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ==========================================================
   Horizontal bar chart

   Accepts an optional onItemPress — when provided, each row
   becomes tappable (used for the aging chart).
   ========================================================== */

function HorizontalBarChart({
  data,
  labelKey,
  valueKey,
  workloadColours = false,
  suffix = "",
  onItemPress,
}: {
  data: Record<string, any>[];
  labelKey: string;
  valueKey: string;
  workloadColours?: boolean;
  suffix?: string;
  onItemPress?: (item: Record<string, any>) => void;
}) {
  if (!data.length) {
    return (
      <Text style={styles.emptyText}>
        No data available.
      </Text>
    );
  }

  const maximum = Math.max(
    ...data.map(
      (item) => Number(item[valueKey]) || 0,
    ),
    1,
  );

  return (
    <View style={styles.chartBars}>
      {data.map((item, index) => {
        const value =
          Number(item[valueKey]) || 0;

        const colour = workloadColours
          ? workloadColour(item.workload_level)
          : CHART_COLOURS[
              index % CHART_COLOURS.length
            ];

        const RowWrapper = onItemPress ? Pressable : View;

        return (
          <RowWrapper
            key={`${item[labelKey]}-${index}`}
            style={styles.chartRow}
            {...(onItemPress
              ? { onPress: () => onItemPress(item) }
              : {})}
          >
            <View style={styles.chartRowMeta}>
              <Text
                numberOfLines={1}
                style={styles.chartLabel}
              >
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
                    width: `${
                      (value / maximum) * 100
                    }%`,
                    backgroundColor: colour,
                  },
                ]}
              />
            </View>
          </RowWrapper>
        );
      })}
    </View>
  );
}

/* ==========================================================
   NEW CASE TRENDS BAR CHART

   Two bars per month:
   Blue  = Opened
   Green = Resolved
   ========================================================== */

function TrendChart({ data }: { data: TrendItem[] }) {
  const { width } = useWindowDimensions();

  const chartWidth = Math.max(width - 48, 300);
  const chartHeight = 280;

  const topPadding = 30;
  const bottomPadding = 60;
  const leftPadding = 38;
  const rightPadding = 10;

  const graphHeight =
    chartHeight - topPadding - bottomPadding;

  const normalizedData = data.map((item) => ({
    period: item.period,
    opened: Math.max(0, Math.round(Number(item.opened) || 0)),
    resolved: Math.max(0, Math.round(Number(item.resolved) || 0)),
  }));

  const maximum = Math.max(
    ...normalizedData.flatMap((item) => [
      item.opened,
      item.resolved,
    ]),
    1
  );

  const createTicks = (max: number) => {
    if (max <= 8) {
      return Array.from(
        { length: max + 1 },
        (_, index) => max - index
      );
    }

    const step = Math.ceil(max / 6);

    const ticks: number[] = [];

    for (let value = max; value >= 0; value -= step) {
      ticks.push(value);
    }

    if (ticks[ticks.length - 1] !== 0) {
      ticks.push(0);
    }

    return ticks;
  };

  const ticks = createTicks(maximum);

  const getBarHeight = (value: number) => {
    if (value <= 0) {
      return 2;
    }

    return Math.max(
      (value / maximum) * graphHeight,
      4
    );
  };

  return (
    <View style={styles.trendChartContainer}>
      <View
        style={[
          styles.trendChart,
          {
            width: chartWidth,
            height: chartHeight,
          },
        ]}
      >
        <View
          style={[
            styles.trendYAxis,
            {
              top: topPadding,
              height: graphHeight,
            },
          ]}
        >
          {ticks.map((tick, index) => {
            const position =
              ticks.length === 1
                ? 0
                : (index / (ticks.length - 1)) * 100;

            return (
              <View
                key={`tick-${tick}`}
                style={[
                  styles.trendGridRow,
                  {
                    top: `${position}%`,
                  },
                ]}
              >
                <Text style={styles.trendYAxisLabel}>
                  {tick}
                </Text>

                <View style={styles.trendGridLine} />
              </View>
            );
          })}
        </View>

        <View
          style={[
            styles.trendBars,
            {
              left: leftPadding,
              right: rightPadding,
              top: topPadding,
              height: graphHeight,
            },
          ]}
        >
          {normalizedData.map((item) => {
            const openedHeight = getBarHeight(item.opened);
            const resolvedHeight = getBarHeight(item.resolved);

            return (
              <View
                key={item.period}
                style={styles.trendMonthGroup}
              >
                <View style={styles.trendBarsArea}>
                  <View style={styles.trendBarColumn}>
                    <Text
                      style={[
                        styles.trendBarValue,
                        {
                          bottom: openedHeight + 4,
                        },
                      ]}
                    >
                      {Math.round(item.opened)}
                    </Text>

                    <View
                      style={[
                        styles.trendBar,
                        styles.trendOpenedBar,
                        {
                          height: openedHeight,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.trendBarColumn}>
                    <Text
                      style={[
                        styles.trendBarValue,
                        {
                          bottom: resolvedHeight + 4,
                        },
                      ]}
                    >
                      {Math.round(item.resolved)}
                    </Text>

                    <View
                      style={[
                        styles.trendBar,
                        styles.trendResolvedBar,
                        {
                          height: resolvedHeight,
                        },
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.trendMonthLabel}>
                  {formatMonth(item.period)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.trendLegend}>
        <View style={styles.trendLegendItem}>
          <View
            style={[
              styles.trendLegendDot,
              styles.trendOpenedDot,
            ]}
          />
          <Text style={styles.trendLegendText}>
            Opened
          </Text>
        </View>

        <View style={styles.trendLegendItem}>
          <View
            style={[
              styles.trendLegendDot,
              styles.trendResolvedDot,
            ]}
          />
          <Text style={styles.trendLegendText}>
            Resolved
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ==========================================================
   Chart card
   ========================================================== */

function ChartCard({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartCardHeader}>
        <View style={styles.chartTitleContainer}>
          <Text style={styles.chartSectionLabel}>
            {title}
          </Text>

          {description ? (
            <Text style={styles.chartDescription}>
              {description}
            </Text>
          ) : null}
        </View>

        {icon}
      </View>

      {children}
    </View>
  );
}

/* ==========================================================
   Main screen
   ========================================================== */

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

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ========================================================
     Load analytics
     ======================================================== */

  const loadAnalytics = useCallback(
    async (isRefreshing = false) => {
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
          performance,
          attentionCases,
          insights,
        ] = await Promise.all([
          getAnalytics<Overview>(
            "overview",
          ),

          getAnalytics<ChartItem[]>(
            "case_status",
          ),

          getAnalytics<ChartItem[]>(
            "case_types",
          ),

          getAnalytics<TrendItem[]>(
            "trends",
          ),

          getAnalytics<ChartItem[]>(
            "aging",
          ),

          getAnalytics<WorkloadItem[]>(
            "workload",
          ),

          getAnalytics<PerformanceItem[]>(
            "resolution_performance",
          ),

          getAnalytics<AttentionCase[]>(
            "attention_cases",
          ),

          getAnalytics<string[]>(
            "insights",
          ),
        ]);

        setAnalytics({
          overview,
          caseStatus,
          caseTypes,
          trends,
          aging,
          workload,
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
    },
    [],
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  /* ========================================================
     Navigation
     ======================================================== */

  const navigateTo = (
    pathname: string,
  ) => {
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

  const handleAgingPress = (item: ChartItem) => {
    const { dateMin, dateMax } = computeAgingDateRange(item.label);

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
        dateMin,
        dateMax,
      },
    });
  };

  const handleAttentionPress = (item: AttentionCase) => {
    router.navigate({
      pathname: "/CaseViewScreen",
      params: {
        victim: item.victim ?? "",
        caseNumber: item.case_number,
        type: item.case_type,
        name,
        rank,
        personalNumber,
        surname,
        city,
        description: "",
      },
    });
  };

  /* ========================================================
     Screen
     ======================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <View style={styles.container}>

        {/* ==================================================
            Header
            ================================================== */}

        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image
              source={require(
                "../assets/images/saps-logo.png",
              )}
              style={styles.sapsLogo}
              resizeMode="cover"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {city ?? "JOHANNESBURG"} CENTRAL
            </Text>

            <Text style={styles.headerSubtitle}>
              South African Police Service ·
              Gauteng
            </Text>
          </View>

          <Pressable
            style={({ hovered }) => [
              styles.logoutBtn,
              hovered &&
                styles.logoutBtnHovered,
            ]}
            onPress={() => {
              if (router.canDismiss()) {
                router.dismissAll();
              }

              router.replace("/");
            }}
          >
            <PowerIcon
              size={18}
              color={Colors.white}
            />
          </Pressable>
        </View>

        {/* ==================================================
            Loading
            ================================================== */}

        {loading ? (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="large"
              color={Colors.sapsblue}
            />

            <Text style={styles.loadingText}>
              Loading analytics...
            </Text>
          </View>
        ) : error || !analytics ? (
          /* ==================================================
             Error
             ================================================== */

          <View
            style={styles.loadingContainer}
          >
            <Text style={styles.errorTitle}>
              Analytics unavailable
            </Text>

            <Text style={styles.errorText}>
              {error ||
                "Could not load analytics."}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() =>
                loadAnalytics()
              }
            >
              <Text
                style={styles.retryButtonText}
              >
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          /* ==================================================
             Dashboard
             ================================================== */

          <ScrollView
            contentContainerStyle={[
              styles.main,
              {
                paddingHorizontal:
                  isSmall ? 12 : 32,
              },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() =>
                  loadAnalytics(true)
                }
                tintColor={
                  Colors.sapsblue
                }
              />
            }
          >

            {/* ==================================================
                Page heading
                ================================================== */}

            <View>
              <Text style={styles.pageTitle}>
                Commander Analytics
              </Text>

              <Text style={styles.pageSub}>
                {city ?? "JOHANNESBURG"} CENTRAL
              </Text>
            </View>

            {/* ==================================================
                Primary statistic cards
                ================================================== */}

            <View
              style={[
                styles.statsGrid,
                isSmall &&
                  styles.statsGridSmall,
              ]}
            >

              {/* Total cases */}

              <View
                style={[
                  styles.statCard,
                  isSmall &&
                    styles.statCardSmall,
                ]}
              >
                <View
                  style={styles.statCardTop}
                >
                  <Text
                    style={styles.statLabel}
                  >
                    Total Cases
                  </Text>

                  <StatIcon type="total" />
                </View>

                <Text
                  style={styles.statValue}
                >
                  {displayNumber(
                    analytics.overview
                      .total_cases,
                  )}
                </Text>

                <Text
                  style={styles.statSub}
                >
                  All registered cases
                </Text>
              </View>

              {/* Active cases */}

              <View
                style={[
                  styles.statCard,
                  isSmall &&
                    styles.statCardSmall,
                ]}
              >
                <View
                  style={styles.statCardTop}
                >
                  <Text
                    style={styles.statLabel}
                  >
                    Active
                  </Text>

                  <StatIcon type="active" />
                </View>

                <Text
                  style={styles.statValue}
                >
                  {displayNumber(
                    analytics.overview
                      .active_cases,
                  )}
                </Text>

                <Text
                  style={styles.statSub}
                >
                  Assigned and unassigned
                </Text>
              </View>

              {/* Resolved cases */}

              <View
                style={[
                  styles.statCard,
                  isSmall &&
                    styles.statCardSmall,
                ]}
              >
                <View
                  style={styles.statCardTop}
                >
                  <Text
                    style={styles.statLabel}
                  >
                    Resolved
                  </Text>

                  <StatIcon type="resolved" />
                </View>

                <Text
                  style={styles.statValue}
                >
                  {displayNumber(
                    analytics.overview
                      .resolved_cases,
                  )}
                </Text>

                <Text
                  style={[
                    styles.statSub,
                    styles.resolvedSub,
                  ]}
                >
                  {displayNumber(
                    analytics.overview
                      .resolution_rate,
                    "%",
                  )}{" "}
                  resolution rate
                </Text>
              </View>
            </View>

            {/* ==================================================
                Secondary statistics
                ================================================== */}

            <View
              style={styles.secondaryStats}
            >

              <View
                style={styles.secondaryStat}
              >
                <Text
                  style={styles.secondaryLabel}
                >
                  Unassigned backlog
                </Text>

                <Text
                  style={styles.secondaryValue}
                >
                  {displayNumber(
                    analytics.overview
                      .unassigned_cases,
                  )}
                </Text>

                <Text
                  style={
                    styles.secondaryDescription
                  }
                >
                  Cases currently without an
                  assigned detective.
                </Text>
              </View>

              <View
                style={styles.secondaryStat}
              >
                <Text
                  style={styles.secondaryLabel}
                >
                  Average active age
                </Text>

                <Text
                  style={styles.secondaryValue}
                >
                  {displayNumber(
                    analytics.overview
                      .avg_active_age_days,
                    " days",
                  )}
                </Text>

                <Text
                  style={
                    styles.secondaryDescription
                  }
                >
                  Average number of days active
                  cases have remained open.
                </Text>
              </View>

              <View
                style={styles.secondaryStat}
              >
                <Text
                  style={styles.secondaryLabel}
                >
                  Average resolution
                </Text>

                <Text
                  style={styles.secondaryValue}
                >
                  {displayNumber(
                    analytics.overview
                      .avg_resolution_days,
                    " days",
                  )}
                </Text>

                <Text
                  style={
                    styles.secondaryDescription
                  }
                >
                  Average time taken to resolve
                  resolved cases.
                </Text>
              </View>
            </View>

            {/* ==================================================
                Case status
                ================================================== */}

            <ChartCard
              title="Case Status"
              description="Shows how all registered cases are currently distributed between unassigned, assigned and resolved."
              icon={
                <CheckCircleIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              <DoughnutChart
                data={analytics.caseStatus}
              />
            </ChartCard>

            {/* ==================================================
                CASE TRENDS — NEW BAR GRAPH
                ================================================== */}

            <ChartCard
              title="Cases Opened vs Resolved"
              description="Compares cases opened with cases resolved for each of the most recent six months."
              icon={
                <TrendUpIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              <TrendChart
                data={analytics.trends}
                width={width}
              />
            </ChartCard>

            {/* ==================================================
                Crime category
                ================================================== */}

            <ChartCard
              title="Crime Category"
              description="Shows the number of cases recorded for each offence type. Higher bars indicate more frequently recorded offences."
              icon={
                <BarChartIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              <HorizontalBarChart
                data={analytics.caseTypes}
                labelKey="label"
                valueKey="total"
              />
            </ChartCard>

            {/* ==================================================
                Unresolved case age — tappable, jumps to
                CaseListScreen pre-filtered by date range
                ================================================== */}

            <ChartCard
              title="Unresolved Case Age"
              description="Shows how long currently unresolved cases have remained open. Tap a bar to view those cases."
              icon={
                <HourglassIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              <HorizontalBarChart
                data={analytics.aging}
                labelKey="label"
                valueKey="total"
                onItemPress={handleAgingPress}
              />
            </ChartCard>

            {/* ==================================================
                Detective workload
                ================================================== */}

            <ChartCard
              title="Detective Workload"
              description="Shows the number of active cases currently assigned to each detective. Colours indicate relative workload."
              icon={
                <ClipboardIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              <HorizontalBarChart
                data={analytics.workload}
                labelKey="detective"
                valueKey="active_cases"
                workloadColours
              />
            </ChartCard>

            {/* ==================================================
                Detective performance
                ================================================== */}

            <ChartCard
              title="Detective Resolution Performance"
              description="Shows the percentage of assigned cases each detective has resolved. Higher percentages indicate stronger resolution performance."
              icon={
                <CheckCircleIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              <HorizontalBarChart
                data={analytics.performance}
                labelKey="detective"
                valueKey="resolution_rate"
                suffix="%"
              />
            </ChartCard>

            {/* ==================================================
                Cases requiring attention — tappable, jumps
                straight to that case's CaseViewScreen
                ================================================== */}

            <ChartCard
              title="Cases Requiring Attention"
              description="Highlights unresolved cases that are either significantly overdue or have remained unassigned beyond the expected period. Tap a case to view it."
              icon={
                <HourglassIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              {analytics.attentionCases
                .length ? (
                <View
                  style={styles.attentionList}
                >
                  {analytics.attentionCases.map(
                    (item) => (
                      <Pressable
                        key={
                          item.case_number
                        }
                        style={({ hovered, pressed }) => [
                          styles.attentionCase,
                          hovered && styles.attentionCaseHovered,
                          pressed && styles.attentionCasePressed,
                        ]}
                        onPress={() => handleAttentionPress(item)}
                      >
                        <View
                          style={
                            styles.attentionInfo
                          }
                        >
                          <Text
                            style={
                              styles.caseNumber
                            }
                          >
                            {item.case_number}
                          </Text>

                          <Text
                            style={
                              styles.caseMeta
                            }
                          >
                            {item.case_type} ·{" "}
                            {item.detective ||
                              "Not assigned"}
                          </Text>

                          <Text
                            style={
                              styles.caseReason
                            }
                          >
                            {item.reason}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.daysBadge
                          }
                        >
                          <Text
                            style={
                              styles.daysNumber
                            }
                          >
                            {item.days_open}
                          </Text>

                          <Text
                            style={
                              styles.daysLabel
                            }
                          >
                            days
                          </Text>
                        </View>
                      </Pressable>
                    ),
                  )}
                </View>
              ) : (
                <Text
                  style={styles.emptyText}
                >
                  No overdue unassigned or
                  critically aged cases.
                </Text>
              )}
            </ChartCard>

            {/* ==================================================
                Commander insights
                ================================================== */}

            <ChartCard
              title="Commander Insights"
              description="Automatically generated observations based on case assignment, case age and resolution performance."
              icon={
                <TrendUpIcon
                  size={20}
                  color={Colors.grey500}
                />
              }
            >
              <View
                style={styles.insightsContent}
              >
                {analytics.insights.map(
                  (insight, index) => (
                    <View
                      key={`${insight}-${index}`}
                      style={styles.insightRow}
                    >
                      <View
                        style={
                          styles.insightDot
                        }
                      />

                      <Text
                        style={
                          styles.insightText
                        }
                      >
                        {insight}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </ChartCard>
          </ScrollView>
        )}

        {/* ======================================================
            Bottom navigation
            ====================================================== */}

        <View
          style={[
            styles.bottomNav,
            isSmall &&
              styles.bottomNavSmall,
          ]}
        >
          <Pressable
            style={styles.navTab}
            onPress={() =>
              navigateTo(
                "/CommanderDashboardScreen",
              )
            }
          >
            <HomeIcon />

            <Text
              style={styles.navLabel}
            >
              Dashboard
            </Text>
          </Pressable>

          <Pressable
            style={styles.navTab}
            onPress={() =>
              navigateTo(
                "/CaseListScreen",
              )
            }
          >
            <FolderNavIcon />

            <Text
              style={styles.navLabel}
            >
              Cases
            </Text>
          </Pressable>

          <Pressable
            style={styles.navTab}
          >
            <AnalyticsIcon />

            <Text
              style={[
                styles.navLabel,
                styles.navActive,
              ]}
            >
              Analytics
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

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
    backgroundColor:
      Colors.logoutHovered,
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
    shadowOffset: {
      width: 0,
      height: 10,
    },
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

  secondaryDescription: {
    color: Colors.grey500,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  chartCard: {
    backgroundColor: Colors.grey100,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: Colors.black0,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },

  chartCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: Colors.grey100,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey300,
  },

  chartTitleContainer: {
    flex: 1,
    paddingRight: 16,
  },

  chartSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.grey500,
  },

  chartDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.grey500,
    marginTop: 5,
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

  trendChartContainer: {
  width: "100%",
  alignItems: "center",
  },
  trendContainer: {
    padding: 24,
  },

  trendChart: {
  position: "relative",
},

  trendGridLine: {
  flex: 1,
  height: 1,
  backgroundColor: "#E5E7EB",
},

  trendYAxis: {
  position: "absolute",
  left: 0,
  right: 0,
},
  trendYAxisLabel: {
  width: 30,
  fontSize: 10,
  color: "#6B7280",
  textAlign: "right",
  marginRight: 8,
},
  trendGridRow: {
  position: "absolute",
  left: 0,
  right: 0,
  height: 1,
  flexDirection: "row",
  alignItems: "center",
},

  trendBars: {
  position: "absolute",
  flexDirection: "row",
  alignItems: "stretch",
},

  trendMonthGroup: {
  flex: 1,
  height: "100%",
  alignItems: "center",
  justifyContent: "flex-end",
  position: "relative",
},

  trendBarsArea: {
  flex: 1,
  width: "100%",
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "center",
},

  trendBarColumn: {
  width: 20,
  height: "100%",
  justifyContent: "flex-end",
  alignItems: "center",
  position: "relative",
},

  trendBarValue: {
  position: "absolute",
  fontSize: 10,
  fontWeight: "700",
  color: "#374151",
  zIndex: 10,
},

  trendBar: {
  width: 14,
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
},

  openedBar: {
    backgroundColor: Colors.sapsblue,
  },

  resolvedBar: {
    backgroundColor: Colors.green,
  },

  trendMonthLabel: {
  position: "absolute",
  bottom: -30,
  fontSize: 10,
  color: "#6B7280",
  textAlign: "center",
},
  trendOpenedBar: {
  backgroundColor: "#2563EB",
},
  trendResolvedBar: {
  backgroundColor: "#10B981",
},

  trendLegend: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 42,
  gap: 20,
},

  trendLegendItem: {
  flexDirection: "row",
  alignItems: "center",
},
  trendOpenedDot: {
  backgroundColor: "#2563EB",
},
  trendResolvedDot: {
  backgroundColor: "#10B981",
},
  
  trendLegendDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 6,
},

  openedLegendDot: {
    backgroundColor: Colors.sapsblue,
  },

  resolvedLegendDot: {
    backgroundColor: Colors.green,
  },

  trendLegendText: {
  fontSize: 12,
  color: "#6B7280",
},

  trendDescription: {
    color: Colors.grey500,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 16,
    textAlign: "center",
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

  attentionCaseHovered: {
    backgroundColor: "#eef3ff",
  },

  attentionCasePressed: {
    opacity: 0.7,
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