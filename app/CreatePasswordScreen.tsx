import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Image,
  Alert,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { Colors } from "../constants/FormTheme";
import { API_BASE_URL } from "../constants/ApiUrl";
import { CommonStyles } from "../constants/styles";
import { Ionicons } from "@expo/vector-icons";

export default function CreatePassword() {
  const router = useRouter();
  const { personalNumber, name, surname, rank, station, caseType, city } =
    useLocalSearchParams<{
      personalNumber: string;
      name: string;
      surname: string;
      rank: string;
      station: string;
      caseType: string;
      city: string;
    }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [matchError, setMatchError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const isLaptop = width >= 768;

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  // Password rules
  const rules = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    {
      label: "One uppercase & one lowercase letter",
      passed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "At least one number", passed: /[0-9]/.test(password) },
    {
      label: "At least one special character (!@#$%)",
      passed: /[!@#$%]/.test(password),
    },
  ];
  const allRulesPassed = rules.every((rule) => rule.passed);

  async function handleCreateAccount() {
    if (password === "" || confirmPassword === "") {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    if (!allRulesPassed) {
      const failedRules = rules.filter((rule) => !rule.passed);
      const missing = failedRules.map((r) => `• ${r.label}`).join("\n");
      showAlert(
        "Password too weak",
        `Please re-enter your password. It must meet:\n${missing}`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setMatchError(true);
      return;
    }
    setMatchError(false);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          Employee_id: personalNumber,
          Password: password,
        }),
      });

      const data = await response.json();

      if (data.status === "Successfully added") {
        const target =
          rank === "COMMANDER"
            ? "/CommanderDashboardScreen"
            : "/OfficerDashboardScreen";
        router.replace({
          pathname: target,
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
      } else {
        showAlert("Error", "Could not create account. Please try again.");
      }
    } catch (error) {
      console.error(error);
      showAlert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: Colors.sapsblue }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={0}
  >
    <ScrollView contentContainerStyle={styles.page}>
      <View
        style={[CommonStyles.cardBase, isLaptop && CommonStyles.cardLaptop]}
      >
        {/* LOGO */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/saps-logo.png")}
            style={styles.logoBadge}
            resizeMode="contain"
          />
        </View>

        {/* VERIFIED BANNER */}
        <View style={styles.verifiedBanner}>
          <Text style={styles.verifiedText}>✓ Personal Number Verified</Text>
        </View>

        {/* WELCOME */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeLabel}>Welcome</Text>
          <Text style={styles.welcomeName}>
            {surname ?? "MKHWANAZI"} {name ?? "NHLANHLA"}
          </Text>
          <View style={styles.pnPill}>
            <Text style={styles.pnPillText}>
              Personal No.{" "}
              <Text style={styles.pnPillStrong}>{personalNumber}</Text>
            </Text>
          </View>
        </View>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* SUB HEADING */}
        <View style={styles.subHeading}>
          <Text style={styles.subHeadingTitle}>Create Password</Text>
          <Text style={styles.subHeadingSubtitle}>
            Set a secure password for your account
          </Text>
        </View>

        {/* PASSWORD */}
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Create password..."
            placeholderTextColor={Colors.grey500}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!visible}
          />
          <Pressable
            style={CommonStyles.eyeBtn}
            onPress={() => setVisible((prev) => !prev)}
            accessibilityLabel={visible ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={visible ? "eye-off" : "eye"}
              size={22}
              color={Colors.grey500}
            />
          </Pressable>
        </View>

        {/* RULES */}
        <View style={styles.rules}>
          {rules.map((rule, index) => (
            <View key={index} style={styles.rule}>
              <Text
                style={{
                  color: rule.passed ? Colors.green : Colors.grey500,
                  fontSize: 14,
                }}
              >
                ●
              </Text>
              <Text
                style={[styles.ruleText, rule.passed && styles.ruleTextPassed]}
              >
                {rule.label}
              </Text>
            </View>
          ))}
        </View>

        {/* CONFIRM PASSWORD */}
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Confirm password..."
            placeholderTextColor={Colors.grey500}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (matchError) setMatchError(false);
            }}
            secureTextEntry={!visible}
          />
        </View>
        {matchError && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

        {/* BUTTON */}
        <Pressable
          style={[styles.btnPrimary, !allRulesPassed && styles.btnDisabled]}
          onPress={handleCreateAccount}
          disabled={loading || !allRulesPassed}
        >
          <Text style={styles.btnPrimaryText}>
            {loading ? "Creating..." : "Create Account"}
          </Text>
        </Pressable>

        {/* FOOTER */}
        <Text style={styles.footerNote}>
          Your account will be linked to personal no. {personalNumber}
        </Text>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
  flexGrow: 1,
  backgroundColor: Colors.sapsblue,
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  paddingBottom: 48,
},
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.sapsblue,
    borderRadius: 18,
    padding: 36,
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.55,
    shadowRadius: 80,
    elevation: 20,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
  },
  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.greenLight,
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  verifiedText: {
    color: Colors.green,
    fontSize: 13,
    fontWeight: "600",
  },
  welcome: {
    alignItems: "center",
    marginBottom: 28,
  },
  welcomeLabel: {
    fontSize: 15,
    color: Colors.grey500,
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: "700",
    marginBottom: 10,
  },
  pnPill: {
    backgroundColor: Colors.grey300,
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pnPillText: {
    color: Colors.grey500,
    fontSize: 13,
  },
  pnPillStrong: {
    color: Colors.grey500,
    fontWeight: "700",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.grey500,
    marginBottom: 26,
  },
  subHeading: {
    alignItems: "center",
    marginBottom: 24,
  },
  subHeadingTitle: {
    fontSize: 26,
    color: Colors.white,
    fontWeight: "700",
  },
  subHeadingSubtitle: {
    color: Colors.grey500,
    fontSize: 14,
    marginTop: 4,
  },
  field: {
    marginBottom: 20,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    paddingLeft: 16,
    paddingRight: 42,
    backgroundColor: Colors.white,
    borderRadius: 8,
    fontSize: 15,
    color: Colors.grey500,
    borderBottomWidth: 3,
    borderBottomColor: Colors.grey500,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
  },
  rules: {
    marginBottom: 20,
    gap: 6,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    color: Colors.grey500,
    fontSize: 12,
  },
  ruleTextPassed: {
    color: Colors.green,
  },
  errorText: {
    color: Colors.red,
    fontSize: 12.5,
    marginTop: -12,
    marginBottom: 12,
  },
  btnPrimary: {
    width: "100%",
    padding: 16,
    backgroundColor: Colors.blueMuted,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 28,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "700",
  },
  footerNote: {
    textAlign: "center",
    color: Colors.grey500,
    fontSize: 12,
  },
});
