import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors } from "../constants/FormTheme";
import { API_BASE_URL } from "../constants/ApiUrl";

export default function Login() {
  const router = useRouter();
  const [personalNumber, setPersonalNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [personalNumberError, setPersonalNumberError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function verifyCredentials() {
    const empNo = personalNumber.trim().toUpperCase();

    setPersonalNumberError("");
    setPasswordError("");

    let hasError = false;

    if (!empNo) {
      setPersonalNumberError("Please enter your personal number.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/employees?id=${personalNumber}&action=login&password=${password}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
      const data = await response.json();

      if (data.status === "not found") {
        showAlert("Error", "Create account");
      } else if (data.status === "does not match") {
        showAlert(
          "Error",
          "Invalid credentials, please check your personal number/password",
        );
      } else if (data.status === "otp_sent") {
        router.replace({
          pathname: "/VerifyOtpScreen",
          params: { personalNumber, purpose: "login" },
        });
      } else if (data.status === "error") {
        showAlert(
          "Error",
          "Could not send verification code. Please try again.",
        );
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
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/saps-logo.png")}
            style={styles.logoBadge}
            resizeMode="contain"
          />
        </View>

        {/* HEADING */}
        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Login</Text>
          <Text style={styles.headingSubtitle}>Sign into your account</Text>
        </View>

        {/* PERSONAL NUMBER */}
        <View style={styles.field}>
          <TextInput
            style={[styles.input, personalNumberError && styles.inputError]}
            placeholder="Enter personal number..."
            placeholderTextColor={Colors.grey500}
            value={personalNumber}
            onChangeText={(text) => {
              setPersonalNumber(text);
              if (personalNumberError) setPersonalNumberError("");
            }}
            autoCapitalize="none"
          />
          {personalNumberError ? (
            <Text style={styles.errorText}>{personalNumberError}</Text>
          ) : null}
        </View>

        {/* PASSWORD */}
        <View style={styles.field}>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            placeholder="Enter password..."
            placeholderTextColor={Colors.grey500}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
            secureTextEntry
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        {/* FORGOT PASSWORD */}
        <View style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password? </Text>
          <TouchableOpacity
            onPress={() => {
              router.replace("/FVerifyPersalNumber");
            }}
          >
            <Text style={styles.forgotLink}>Reset password</Text>
          </TouchableOpacity>
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={styles.btnLogin}
          onPress={verifyCredentials}
          disabled={loading}
        >
          <Text style={styles.btnLoginText}>
            {loading ? "Logging..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* SIGN UP */}
        <View style={styles.signup}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              router.navigate("/SignUpScreen");
            }}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
    width: 110,
    height: 110,
  },
  heading: {
    alignItems: "center",
    marginBottom: 32,
  },
  headingTitle: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.white,
  },
  headingSubtitle: {
    fontSize: 15,
    color: Colors.grey500,
    marginTop: 6,
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
    marginTop: 6,
  },
  forgot: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.grey500,
  },
  forgotLink: {
    fontSize: 13,
    color: Colors.white,
  },
  btnLogin: {
    width: "100%",
    padding: 16,
    backgroundColor: Colors.blueMuted,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 28,
  },
  btnLoginText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "700",
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: Colors.grey500,
  },
  signupLink: {
    color: Colors.white,
    fontWeight: "700",
  },
});
