// app/CreateNewPasswordScreen.tsx
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Image,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { Colors } from "../constants/FormTheme";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../constants/ApiUrl";
import { CommonStyles } from "../constants/styles";

const EyeIcon = ({ size = 20, color = Colors.grey500, closed = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    {closed ? (
      <>
        <Path
          d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.53 9.53a3 3 0 104.24 4.24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Line
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <Path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <Circle
          cx="12"
          cy="12"
          r="3"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
      </>
    )}
  </Svg>
);

export default function CreateNewPasswordScreen() {
  const router = useRouter();
  const { personalNumber } = useLocalSearchParams<{ personalNumber: string }>();
  const [newPassword, setNewPassword] = useState("");
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
    { label: "At least 8 characters", passed: newPassword.length >= 8 },
    {
      label: "One uppercase & one lowercase letter",
      passed: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    },
    { label: "At least one number", passed: /[0-9]/.test(newPassword) },
    {
      label: "At least one special character (!@#$%)",
      passed: /[!@#$%]/.test(newPassword),
    },
  ];

  async function handleReset() {
    const allPass = rules.every((rule) => rule.passed);

    if (!allPass) {
      showAlert("Error", "Password does not meet all criteria.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMatchError(true);
      return;
    }
    setMatchError(false);

    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          Employee_id: personalNumber,
          Password: newPassword,
        }),
      });
      showAlert(
        "Success",
        "Password reset successful! Please login with new password.",
      );
      router.replace("/");
    } catch (err) {
      showAlert("Error", "Failed to reset password.");
      router.replace("/");
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

        {/* SUB HEADING */}
        <View style={styles.subHeading}>
          <Text style={styles.subHeadingTitle}>Create New Password</Text>
          <Text style={styles.subHeadingSubtitle}>
            Your new password must be different from previously used passwords
          </Text>
        </View>

        {/* NEW PASSWORD */}
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Enter new password..."
            placeholderTextColor={Colors.grey500}
            value={newPassword}
            onChangeText={setNewPassword}
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
            placeholder="Confirm new password..."
            placeholderTextColor={Colors.grey500}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (matchError) setMatchError(false);
            }}
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
        {matchError && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

        {/* BUTTON */}
        <Pressable
          style={styles.btnPrimary}
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.btnPrimaryText}>
            {loading ? "Resetting..." : "Reset Password"}
          </Text>
        </Pressable>

        {/* FOOTER */}
        <Text style={styles.footerNote}>
          Your account will be linked to employee no. {personalNumber}
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
  subHeading: {
    alignItems: "center",
    marginBottom: 28,
  },
  subHeadingTitle: {
    fontSize: 26,
    color: Colors.white,
    fontWeight: "700",
    textAlign: "center",
  },
  subHeadingSubtitle: {
    color: Colors.grey500,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
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
