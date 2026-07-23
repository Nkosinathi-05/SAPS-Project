import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Svg, { Path, Circle, Line, Rect, G } from "react-native-svg";

// ICONS

// BACK ARROW
const ArrowLeftIcon = ({ size = 18, color = "#f7c600" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 12H5M5 12l7-7M5 12l7 7"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// SEARCH / MAGNIFYING GLASS
const SearchIcon = ({ size = 18, color = "rgba(255,255,255,0.5)" }) => (
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

// SETTINGS / FILTER GEAR
const SettingsIcon = ({ size = 15, color = "#001b44" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="2" />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

// SHIELD (section icon)
const ShieldIcon = ({ size = 22, color = "#dc2626" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l8 3v6c0 5-3.5 9.7-8 11C7.5 20.7 4 16 4 11V5l8-3z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const DETECTIVES = [
  {
    id: "1",
    name: "Det. Sithole",
    role: "Senior Lead Investigator",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5v1UFRxpk-oMcIhzY5rHDnLf_LbuUwoFHWkyHqUgA0jYei-DuXxltrp19tgfRPjGtXhpwBgcMY8xkmC1TA4wipD3GlyOCARS1a7YcBYItqQi2JW_8XgQbpL_lNcQZHj3YubGKDTqSXMx4-lAhK28QR5WwZFFOBYjIHF2VYp0KEJXwl4aKW4Z8PXFxmY-55OD8Ai8Q9ZWgz-JGDJD8RFueSKaw9Say0lEzOL4f3TE8qZDZx2qZaFudwAvMHoK0OuLUkpOHUGaHlc46",
  },
  {
    id: "2",
    name: "Det. Van Wyk",
    role: "General Crimes Unit",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqU86PgOWLd2RsbSkPhze3nAz5bMPPzQxMSksisPMjxu_o61JUn3cE0myU87t-14NvDBo01_Q50ervY9_9LylMMjPHMW_5R5vfYm5RhWrD6SJRklP2XR8dfrWfmrCrpEzto_B9s__Gj4L_FvfCyYwCW4rT5xrIyWjLZ9Hz80lZ4K3ZnA9mr-Mi5sDChtFHd9AXdosIJyp-FkX0JmaKFMDCX2yWcdW6Y6FzE4mmynBb_eRG8JZO51BUwK1VH1-G1bGZ76FJ5SJBBkR8",
  },
  {
    id: "3",
    name: "Det. Mabuse",
    role: "Specialized Investigation",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3r-Fpj20yATEIc11ecgzxeCN99t0VM95doeT601mlV0Q5uK6Tgz7gbu1tFtXz-fKF73WhEGL67wln5UbgzxNet86eUkCqFrDQLun1LJ3_L-uvl2WaA3JCUoMO7-GLBYcOyHM443rSsuRY22NcglCIsa0IhcxxpIrX0-HMq9Zq8_Jt-a3qFMst9c1POESyKVgu9cZAMIzb8qVnhh43GAfJfaqGi07cK2wjrYfv_THyA_lPjeYyKrVTWJfIcAp7J50iac0daScBd89m",
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function CaseView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;
  const isMedium = width >= 768;
  const [search, setSearch] = useState("");

  const [now] = useState(new Date());
  const formattedDate = now.toLocaleDateString("en-ZA", {
    year: "numeric",
  });
  const {
    name,
    surname,
    rank,
    personalNumber,
    caseNumber,
    type,
    station,
    caseType,
    city,
    description,
    victim,
  } = useLocalSearchParams<{
    name: string;
    surname: string;
    rank: string;
    personalNumber: string;
    caseNumber: string;
    type: string;
    station: string;
    caseType: string;
    city: string;
    description: string;
    victim: string;
  }>();
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* LEFT */}
        <View style={styles.headerLeft}>
          <Pressable
            style={({ hovered }) => [
              styles.btnBack,
              hovered && styles.btnBackHovered,
            ]}
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
            <ArrowLeftIcon size={18} color="#f7c600" />
          </Pressable>

          <View style={styles.headerDivider} />

          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/images/saps-logo.png")}
              style={styles.sapsLogo}
              resizeMode="cover"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{city} CENTRAL</Text>
            {!isSmall && (
              <Text style={styles.headerSubtitle}>
                South African Police Service · Gauteng
              </Text>
            )}
          </View>
        </View>

        {/* RIGHT */}
        {!isSmall && (
          <View style={styles.headerRight}>
            <View style={styles.commanderInfo}>
              <Text style={styles.commanderName}>
                {surname} {name}
              </Text>
              <Text style={styles.commanderRole}>Detective Commander</Text>
            </View>
            <View style={styles.avatar}>
              <Image
                source={{
                  uri: "https://tse4.mm.bing.net/th/id/OIP.RuiYdm6APQVna3xXcyCX6AHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
                }}
                style={styles.avatarImg}
              />
            </View>
          </View>
        )}
      </View>

      {/* MAIN SCROLL */}
      <ScrollView
        contentContainerStyle={[
          styles.main,
          { paddingHorizontal: isSmall ? 16 : 40 },
        ]}
      >
        {/* PAGE HEADER */}
        <View style={styles.pageHeader}>
          <View style={styles.eyebrowBadge}>
            <Text style={styles.eyebrowText}>Operational Workflow</Text>
          </View>
          <Text style={styles.pageTitle}>Manual Case Assignment</Text>
          <Text style={styles.pageDesc}>
            Allocate critical investigative resources to Case ID: {caseNumber}.
            Ensure resource allocation follows SAPS standard operating
            procedures and commander discretion.
          </Text>
        </View>

        {/* CASE GRID */}
        <View style={[styles.caseGrid, isMedium && styles.caseGridRow]}>
          {/* CASE CARD */}
          <View style={[styles.caseCard, isMedium && styles.caseCardFlex]}>
            <View style={[styles.caseImage, isMedium && styles.caseImageMd]}>
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWI4-fUu0v_nHAST7dW_qT-wtYcKEd3MW0mvMUWEAZu93Vr8DbgarW_3QKUqKvN109go2DOgiY2dYTxi63wpc2CzxLk3llmuhJPiN6TvltmiUbNzxJIouzNh51gug05byq0tiveh1Cq9yHOqvxqLCaQTuLqbFZS5EaNR2u4RysGdKKVv90xuBK_HGIkAB0YcTM-ipqI8V9ynn5ndxNi_LlPTpmqI6xSTHuOJynyXk4BMu1uzmkYDQJNT102NJjBaiwuMNCEJo0xw_n",
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <View style={styles.caseInfo}>
              <View style={styles.caseTypeBadge}>
                <Text style={styles.caseTypeBadgeText}>Type: {type}</Text>
              </View>
              <Text style={styles.caseTitle}>{victim}</Text>
              <Text style={styles.caseDesc}>{description}</Text>
            </View>
          </View>

          {/* SEARCH CARD */}
          <View style={styles.searchCard}>
            <Text style={styles.searchEyebrow}>Detective Directory</Text>
            <Text style={styles.searchTitle}>Search & Filter</Text>
            <View style={styles.searchWrap}>
              <SearchIcon size={18} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or badge..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Pressable
              style={({ hovered }) => [
                styles.btnFilter,
                hovered && styles.btnFilterHovered,
              ]}
            >
              <View style={styles.btnFilterInner}>
                <SettingsIcon size={15} color="#001b44" />
                <Text style={styles.btnFilterText}>Apply Advanced Filters</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* DETECTIVE SECTION */}
        <View style={styles.section}>
          {/* SECTION HEADER */}
          <View style={styles.sectionEyebrow}>
            <View style={styles.sectionIconWrap}>
              <ShieldIcon size={20} color="#dc2626" />
            </View>
            <Text style={styles.sectionHeading}>
              Officers dealing with {type} cases.
            </Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>4 Officers Available</Text>
            </View>
          </View>

          {/* BENTO GRID */}
          <View style={[styles.bentoGrid, isMedium && styles.bentoGridRow]}>
            {DETECTIVES.map((det) => (
              <Pressable
                key={det.id}
                style={({ hovered }) => [
                  styles.detectiveCard,
                  hovered && styles.detectiveCardHovered,
                ]}
              >
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Image
                      source={{ uri: det.image }}
                      style={styles.detImage}
                      resizeMode="cover"
                    />
                    <View>
                      <Text style={styles.detName}>{det.name}</Text>
                      <Text style={styles.detRole}>{det.role}</Text>
                      <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusLabel}>Active</Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={({ hovered }) => [
                      styles.btnAssign,
                      hovered && styles.btnAssignHovered,
                    ]}
                  >
                    {({ hovered }) => (
                      <Text
                        style={[
                          styles.btnAssignText,
                          hovered && styles.btnAssignTextHovered,
                        ]}
                      >
                        Assign to Case
                      </Text>
                    )}
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <Text style={styles.footerBrand}>SAPS Systems</Text>
            <View style={styles.footerDivider} />
            <Text style={styles.footerLink}>Security Policy</Text>
            <Text style={styles.footerLink}>Terms of Service</Text>
            <Text style={styles.footerLink}>Officer Support</Text>
          </View>
          <Text style={styles.footerCopy}>
            © {formattedDate} South African Police Service Digital Systems. All
            Rights Reserved. Restricted Access. Unauthorized access is
            punishable by law.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// STYLES

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7ff",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,27,68,0.96)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  btnBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "rgba(247,198,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnBackHovered: {
    backgroundColor: "rgba(247,198,0,0.12)",
    borderColor: "#f7c600",
  },
  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(247,198,0,0.4)",
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
  },
  headerTitle: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  commanderInfo: {
    alignItems: "flex-end",
  },
  commanderName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  commanderRole: {
    fontSize: 11,
    color: "rgba(247,198,0,0.75)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(247,198,0,0.5)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },

  // MAIN
  main: {
    paddingTop: 32,
    paddingBottom: 48,
    gap: 40,
  },

  // PAGE HEADER
  pageHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#c0c8e0",
    paddingBottom: 24,
    gap: 10,
  },
  eyebrowBadge: {
    backgroundColor: "#001b44",
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#c9aa00",
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0b1428",
    letterSpacing: 1,
  },
  pageDesc: {
    fontSize: 15,
    lineHeight: 24,
    color: "#6b7594",
    maxWidth: 600,
  },

  // CASE GRID
  caseGrid: {
    gap: 20,
  },
  caseGridRow: {
    flexDirection: "row",
  },
  caseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c0c8e0",
    padding: 20,
    gap: 16,
    shadowColor: "#001b44",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  caseCardFlex: {
    flex: 2,
    flexDirection: "row",
  },
  caseImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e2e7f8",
  },
  caseImageMd: {
    width: 190,
    height: 130,
  },
  caseInfo: {
    flex: 1,
    gap: 8,
  },
  caseTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(220,38,38,0.08)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.2)",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  caseTypeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: "#dc2626",
  },
  caseTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0b1428",
    lineHeight: 26,
  },
  caseDesc: {
    fontSize: 13,
    lineHeight: 21,
    color: "#6b7594",
  },

  // SEARCH CARD
  searchCard: {
    flex: 1,
    backgroundColor: "#001b44",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(247,198,0,0.2)",
    padding: 24,
    gap: 12,
    shadowColor: "#001b44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  searchEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#f7c600",
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#ffffff",
  },
  btnFilter: {
    backgroundColor: "#f7c600",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  btnFilterHovered: {
    backgroundColor: "#ffe033",
  },
  btnFilterInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnFilterText: {
    color: "#001b44",
    fontWeight: "700",
    fontSize: 13,
  },

  // DETECTIVE SECTION
  section: {
    gap: 20,
  },
  sectionEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  sectionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(220,38,38,0.08)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0b1428",
    letterSpacing: 1,
  },
  sectionCountBadge: {
    marginLeft: "auto",
    backgroundColor: "#001b44",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f7c600",
    letterSpacing: 0.5,
  },

  // BENTO GRID
  bentoGrid: {
    gap: 16,
  },
  bentoGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detectiveCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c0c8e0",
    overflow: "hidden",
    shadowColor: "#001b44",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  detectiveCardHovered: {
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
    borderColor: "#8993b0",
  },
  cardBody: {
    padding: 24,
    gap: 20,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  detImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#c0c8e0",
  },
  detName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0b1428",
  },
  detRole: {
    fontSize: 13,
    color: "#6b7594",
    fontWeight: "500",
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  btnAssign: {
    borderWidth: 1.5,
    borderColor: "#001b44",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  btnAssignHovered: {
    backgroundColor: "#001b44",
  },
  btnAssignText: {
    color: "#001b44",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  btnAssignTextHovered: {
    color: "#f7c600",
  },

  // FOOTER
  footer: {
    backgroundColor: "#001b44",
    borderTopWidth: 2,
    borderTopColor: "#f7c600",
    padding: 40,
    alignItems: "center",
    gap: 14,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: "#f7c600",
    letterSpacing: 1,
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(247,198,0,0.25)",
  },
  footerLink: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },
  footerCopy: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 500,
  },
});
