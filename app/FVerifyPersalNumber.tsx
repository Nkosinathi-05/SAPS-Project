import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors } from "../constants/FormTheme";
import { API_BASE_URL } from "../constants/ApiUrl";
import { CommonStyles } from "../constants/styles";

export default function VerifyEmployeeScreen() {
  const router = useRouter();
  const [personalNumber, setPersonalNumber] = useState("");
  const [error, setError] = useState("");
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

  async function handleContinue() {
    const persNo = personalNumber.trim().toUpperCase();
    setError("");

    if (!persNo) {
      setError("Please enter your Personal Number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/employees?id=${persNo}&action=forgotPassword_otp`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      const data = await response.json();
      if (data.status === "sent") {
        router.push({
          pathname: "/FOtpVerification",
          params: {
            personalNumber: persNo,
          },
        });
      } else if (!response.ok || data.status !== "sent") {
        setError(
          "Employee number not found please re-enter or create an account.",
        );
        return;
      }
    } catch (err) {
      showAlert("Error", "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
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

        {/* HEADING */}
        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Forgot Password?</Text>
          <Text style={styles.headingSubtitle}>
            Enter your personal number to reset your password
          </Text>
        </View>

        {/* PERSONAL NUMBER */}
        <View style={styles.field}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter personal number..."
            placeholderTextColor={Colors.grey500}
            value={personalNumber}
            onChangeText={(text) => {
              setPersonalNumber(text);
              if (error) setError("");
            }}
            autoCapitalize="characters"
          />
        </View>
        {error !== "" && <Text style={styles.errorText}>{error}</Text>}

        {/* NOTE */}
        <Text style={styles.note}>
          We'll check if you exist in our system before sending a verification
          code.
        </Text>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.btnPrimaryText}>
            {loading ? "Checking..." : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* BACK TO LOGIN */}
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.btnOutlineText}>Back to Login</Text>
        </TouchableOpacity>

        {/* FOOTER NOTE */}
        <Text style={styles.footerNote}>
          Only registered SAPS employees can reset a password
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.sapsblue,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 110,
    height: 110,
  },
  heading: {
    alignItems: "center",
    marginBottom: 32,
  },
  headingTitle: {
    fontSize: 42,
    fontWeight: "700",
    color: Colors.white,
  },
  headingSubtitle: {
    fontSize: 15,
    color: Colors.grey500,
    marginTop: 6,
    textAlign: "center",
  },
  field: {
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    paddingLeft: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    fontSize: 15,
    color: Colors.sapsblue,
    borderBottomWidth: 3,
    borderBottomColor: Colors.grey500,
  },
  inputError: {
    borderBottomColor: Colors.red,
    backgroundColor: "#fff8f8",
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -12,
    marginBottom: 16,
  },
  note: {
    textAlign: "center",
    fontSize: 13,
    color: Colors.grey500,
    marginBottom: 28,
    lineHeight: 21,
  },
  btnPrimary: {
    width: "100%",
    padding: 16,
    backgroundColor: Colors.blueMuted,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 14,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  btnOutline: {
    width: "100%",
    padding: 15,
    backgroundColor: "transparent",
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.grey,
    marginBottom: 28,
  },
  btnOutlineText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.grey500,
  },
});
