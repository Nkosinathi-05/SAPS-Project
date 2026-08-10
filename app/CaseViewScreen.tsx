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
import {
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  ArrowLeftIcon,
} from "../components/icons/buttons";
import { Colors } from "../constants/FormTheme";

type Detective = {
  Detname: string;
  Detsurname: string;
  DetpersonalNumber?: string;
};

export default function CaseView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;
  const isMedium = width >= 768;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [detectives, setDetectives] = useState<Detective[]>([]);
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
    city: string;
    description: string;
    victim: string;
  }>();

  async function AssignDetective(personalNumber: string, caseNumber: string) {
    setAssigningId(personalNumber);
    try {
      const response = await fetch(
        "https://danger-reliable-conclude.ngrok-free.dev/cases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            employee_number: personalNumber,
            case_number: caseNumber,
            action: "assign",
          }),
        },
      );
      const text = await response.text();
      console.log("STATUS:", response.status);
      console.log("BODY:", text);

      if (!response.ok) {
        console.error("Assign failed:", text);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch officers:", error);
    } finally {
      setAssigningId(null);
    }
  }

  useEffect(() => {
    async function fetchOfficers() {
      try {
        const response = await fetch(
          `https://danger-reliable-conclude.ngrok-free.dev/employees?case_type=${type}&action=filter&rank=detective`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
        const data = await response.json();

        const mapped: Detective[] = data.map((officer: any) => ({
          Detsurname: officer.SURNAME ?? "",
          Detname: officer.NAME ?? "",
          DetpersonalNumber: officer.EMPLOYEE_NUMBER ?? "",
        }));

        setDetectives(mapped);
      } catch (error) {
        console.error("Failed to fetch officers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOfficers();
  }, [type]);

  const filteredList = detectives.filter((det) => {
    const matchesSearch =
      det.Detname.toLowerCase().includes(search.toLowerCase()) ||
      det.Detsurname.toLowerCase().includes(search.toLowerCase()) ||
      det.DetpersonalNumber?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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
                  type,
                  city,
                },
              })
            }
          >
            <ArrowLeftIcon />
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
            <Text style={styles.headerTitle}>
              {city ?? "JOHANNESBURG"} CENTRAL
            </Text>
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
                {surname ?? "MKHWANAZI"} {name ?? "NHLANHLA"}
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
              <SearchIcon />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or badge..."
                placeholderTextColor={Colors.grey500}
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
                <SettingsIcon />
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
              <ShieldIcon />
            </View>
            <Text style={styles.sectionHeading}>
              Officers dealing with {type} cases.
            </Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>
                {filteredList.length} Officers Available
              </Text>
            </View>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color={Colors.sapsblue}
              style={{ marginTop: 40 }}
            />
          )}
          {/* BENTO GRID */}
          <View style={[styles.bentoGrid, isMedium && styles.bentoGridRow]}>
            {filteredList.map((det) => (
              <Pressable
                key={det.DetpersonalNumber}
                style={({ hovered }) => [
                  styles.detectiveCard,
                  hovered && styles.detectiveCardHovered,
                ]}
              >
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Image
                      source={{
                        uri: "https://tse4.mm.bing.net/th/id/OIP.RuiYdm6APQVna3xXcyCX6AHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
                      }}
                      style={styles.detImage}
                      resizeMode="cover"
                    />
                    <View>
                      <Text style={styles.detName}>
                        {det.Detsurname} {det.Detname} {det.DetpersonalNumber}
                      </Text>
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
                    disabled={assigningId === det.DetpersonalNumber}
                    onPress={() =>
                      AssignDetective(det.DetpersonalNumber ?? "", caseNumber)
                    }
                  >
                    {({ hovered }) => (
                      <Text
                        style={[
                          styles.btnAssignText,
                          hovered && styles.btnAssignTextHovered,
                        ]}
                      >
                        {assigningId === det.DetpersonalNumber
                          ? "Assigning..."
                          : "Assign Case"}
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
    backgroundColor: Colors.white,
  },

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
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  btnBackHovered: {
    backgroundColor: Colors.logoutHovered,
    borderColor: Colors.gold,
  },
  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.gold,
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
    color: Colors.grey500,
    fontSize: 12,
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
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  commanderRole: {
    fontSize: 12,
    color: Colors.gold,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.gold,
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
    borderBottomColor: Colors.grey300,
    paddingBottom: 24,
    gap: 10,
  },
  eyebrowBadge: {
    backgroundColor: Colors.sapsblue,
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
    color: Colors.gold,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.sapsblue,
    letterSpacing: 1,
  },
  pageDesc: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.blue,
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
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grey300,
    padding: 20,
    gap: 16,
    shadowColor: Colors.sapsblue,
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
    backgroundColor: "Colors.grey50",
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
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.red,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  caseTypeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: Colors.red,
  },
  caseTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.sapsblue,
    lineHeight: 26,
  },
  caseDesc: {
    fontSize: 13,
    lineHeight: 21,
    color: Colors.sapsblue,
  },

  // SEARCH CARD
  searchCard: {
    flex: 1,
    minHeight: 250,
    maxHeight: 320,
    backgroundColor: Colors.sapsblue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
    padding: 24,
    gap: 12,
    shadowColor: Colors.sapsblue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  searchEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.gold,
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.white,
    letterSpacing: 1,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.grey200,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grey500,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.sapsblue,
  },
  btnFilter: {
    backgroundColor: Colors.gold,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  btnFilterHovered: {
    backgroundColor: Colors.gold,
  },
  btnFilterInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnFilterText: {
    color: Colors.sapsblue,
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
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.sapsblue,
    letterSpacing: 1,
  },
  sectionCountBadge: {
    marginLeft: "auto",
    backgroundColor: Colors.sapsblue,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gold,
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
    width: "25%",
    minWidth: 300,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grey300,
    overflow: "hidden",
    shadowColor: Colors.sapsblue,
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
    borderColor: Colors.sapsblue,
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
    borderColor: Colors.grey300,
  },
  detName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.sapsblue,
  },
  detRole: {
    fontSize: 13,
    color: Colors.grey500,
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
    backgroundColor: Colors.green,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.green,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  btnAssign: {
    borderWidth: 1.5,
    borderColor: Colors.sapsblue,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  btnAssignHovered: {
    backgroundColor: Colors.sapsblue,
  },
  btnAssignText: {
    color: Colors.sapsblue,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  btnAssignTextHovered: {
    color: Colors.gold,
  },

  // FOOTER
  footer: {
    backgroundColor: Colors.sapsblue,
    borderTopWidth: 2,
    borderTopColor: Colors.gold,
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
    color: Colors.gold,
    letterSpacing: 1,
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.gold,
  },
  footerLink: {
    fontSize: 13,
    color: Colors.grey700,
    fontWeight: "500",
  },
  footerCopy: {
    fontSize: 12,
    color: Colors.grey700,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 500,
  },
});
