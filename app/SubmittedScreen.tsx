import { useState } from "react";
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
import {
  CalendarIcon,
  HomeIcon,
  HashIcon,
} from "../components/icons/navigations";
import { CheckIcon, ClockIcon, PowerIcon } from "../components/icons/buttons";

export default function CaseSubmissionSuccess() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { surname } = useLocalSearchParams<{ surname: string }>();

  const isSmall = width < 480;
  const [now] = useState(new Date());

  const { caseNumber } = useLocalSearchParams<{
    caseNumber: string;
  }>();
  const formattedDate = now.toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const resolvedOfficer = surname ?? "Officer";

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/saps-logo.png")}
            style={styles.sapsLogo}
            resizeMode="cover"
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Johannesburg Central</Text>
          <Text style={styles.headerSubtitle}>
            South African Police Service · Gauteng
          </Text>
        </View>
      </View>

      {/* SCROLL BODY */}
      <ScrollView
        contentContainerStyle={[
          styles.main,
          { paddingHorizontal: isSmall ? 12 : 32 },
        ]}
      >
        {/* SUCCESS CARD */}
        <View style={[styles.successCard, isSmall && styles.successCardSmall]}>
          {/* Gold-ringed check icon */}
          <View style={styles.iconCircle}>
            <CheckIcon size={36} color="#f7c600" />
          </View>

          <Text style={styles.successHeading}>Case Successfully Submitted</Text>
          <Text style={styles.successSubtitle}>
            Well done, <Text style={styles.highlight}>{resolvedOfficer}</Text>.
            Your case has been recorded and is queued for review.
          </Text>

          {/* CASE NUMBER BANNER */}
          <View style={styles.caseNumberBanner}>
            <View style={styles.caseNumberIconWrap}>
              <HashIcon size={20} color="#f7c600" />
            </View>
            <View style={styles.caseNumberTextWrap}>
              <Text style={styles.caseNumberLabel}>Case Reference Number</Text>
              <Text style={styles.caseNumberValue}>{caseNumber}</Text>
            </View>
          </View>

          {/* Second divider */}
          <View style={[styles.divider, { marginTop: 24 }]} />

          {/*DATE & TIME */}
          <View
            style={[styles.dateTimeRow, isSmall && styles.dateTimeRowSmall]}
          >
            <View style={styles.dateTimeCard}>
              <CalendarIcon size={22} color="#f7c600" />
              <View>
                <Text style={styles.dateTimeLabel}>Date Submitted</Text>
                <Text style={styles.dateTimeValue}>{formattedDate}</Text>
              </View>
            </View>
            <View style={styles.dateTimeCard}>
              <ClockIcon size={22} color="#f7c600" />
              <View>
                <Text style={styles.dateTimeLabel}>Time Submitted</Text>
                <Text style={styles.dateTimeValue}>{formattedTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/*ACTION BUTTONS */}
        <View style={[styles.buttonRow, isSmall && styles.buttonRowSmall]}>
          <Pressable
            style={({ pressed, hovered }) => [
              styles.btnDashboard,
              hovered && styles.btnDashboardHovered,
              pressed && styles.btnPressed,
            ]}
            onPress={() => router.replace("/OfficerDashboardScreen")}
          >
            <HomeIcon size={18} color="#ffffff" />
            <Text style={styles.btnDashboardText}>Dashboard</Text>
          </Pressable>

          <Pressable
            style={({ pressed, hovered }) => [
              styles.btnLogout,
              hovered && styles.btnLogoutHovered,
              pressed && styles.btnPressed,
            ]}
            onPress={() => {
              router.dismissAll();
              router.replace("/");
            }}
          >
            <PowerIcon size={18} color="#b91c1c" />
            <Text style={styles.btnLogoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

//STYLES

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

  // MAIN
  main: {
    paddingTop: 24,
    paddingBottom: 40,
    gap: 32,
  },

  // SUCCESS CARD
  successCard: {
    backgroundColor: "#001b44",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
  },
  successCardSmall: {
    padding: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(247,198,0,0.15)",
    borderWidth: 2,
    borderColor: "rgba(247,198,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 22,
  },
  highlight: {
    color: "#f7c600",
    fontWeight: "700",
  },
  divider: {
    width: "60%",
    height: 2,
    backgroundColor: "rgba(247,198,0,0.35)",
    borderRadius: 1,
    marginVertical: 24,
  },

  // CASE NUMBER BANNER
  caseNumberBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%",
    backgroundColor: "rgba(247,198,0,0.1)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(247,198,0,0.45)",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  caseNumberIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(247,198,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  caseNumberTextWrap: {
    flex: 1,
  },
  caseNumberLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  caseNumberValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f7c600",
    letterSpacing: 1.5,
  },
  caseNumberNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 12,
    paddingHorizontal: 8,
  },

  // DATE & TIME
  dateTimeRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  dateTimeRowSmall: {
    flexDirection: "column",
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(247,198,0,0.2)",
  },
  dateTimeLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // BUTTONS
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  buttonRowSmall: {
    flexDirection: "column",
  },
  btnDashboard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#001b44",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDashboardHovered: {
    backgroundColor: "#00317a",
    transform: [{ translateY: -3 }],
  },
  btnDashboardText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  btnLogout: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "transparent",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#b91c1c",
  },
  btnLogoutHovered: {
    backgroundColor: "rgba(185,28,28,0.08)",
    transform: [{ translateY: -3 }],
  },
  btnLogoutText: {
    color: "#b91c1c",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  btnPressed: {
    opacity: 0.82,
  },
});
