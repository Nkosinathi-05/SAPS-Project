import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Colors } from "../constants/FormTheme";

export default function VerifyOtp() {
  const router = useRouter();
  const {
    personalNumber,
    purpose,
    name,
    surname,
    rank,
    station,
    caseType,
    city,
  } = useLocalSearchParams<{
    personalNumber: string;
    purpose: "login" | "register";
    name?: string;
    surname?: string;
    rank?: string;
    station?: string;
    caseType?: string;
    city?: string;
  }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function verifyOtp() {
    if (otp === "") {
      showAlert("Error", "Enter the code sent to your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
  `https://danger-reliable-conclude.ngrok-free.dev/employees?id=${personalNumber}&action=verify_otp&otp=${otp}&purpose=${purpose}`,
  { headers: { "ngrok-skip-browser-warning": "true" } },);
  console.log("status code:", response.status);
  const text = await response.text();
  console.log("raw response body:", text);
  const data = text ? JSON.parse(text) : null;

      if (data.status === "invalid_otp") {
        showAlert("Error", "Incorrect code, please try again");
      } else if (data.status === "expired") {
        showAlert("Error", "Code expired, please try again");
        router.replace(purpose === "register" ? "/SignUpScreen" : "/");
      } else if (data.status === "verified") {
        if (purpose === "register") {
          router.replace({
            pathname: "/CreatePasswordScreen",
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
          const officer = data[personalNumber as string];
          const target =
            officer.rank === "COMMANDER"
              ? "/CommanderDashboardScreen"
              : "/OfficerDashboardScreen";

          router.replace({
            pathname: target,
            params: {
              personalNumber,
              name: officer.name,
              surname: officer.surname,
              rank: officer.rank,
              station: officer.station,
              caseType: officer.case_type,
              city: officer.city,
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
      showAlert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Verify Code</Text>
          <Text style={styles.headingSubtitle}>
            Enter the code sent to your email
          </Text>
        </View>

        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code..."
            placeholderTextColor={Colors.grey500}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity
          style={styles.btnLogin}
          onPress={verifyOtp}
          disabled={loading}
        >
          <Text style={styles.btnLoginText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.sapsblue, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 420, backgroundColor: Colors.sapsblue, borderRadius: 18, padding: 36 },
  heading: { alignItems: "center", marginBottom: 32 },
  headingTitle: { fontSize: 36, fontWeight: "700", color: Colors.white },
  headingSubtitle: { fontSize: 15, color: Colors.grey500, marginTop: 6, textAlign: "center" },
  field: { marginBottom: 20 },
  input: { width: "100%", padding: 15, backgroundColor: Colors.white, borderRadius: 8, fontSize: 15, color: Colors.sapsblue, textAlign: "center", letterSpacing: 8 },
  btnLogin: { width: "100%", padding: 16, backgroundColor: Colors.blueMuted, borderRadius: 50, alignItems: "center" },
  btnLoginText: { color: Colors.white, fontSize: 22, fontWeight: "700" },
});