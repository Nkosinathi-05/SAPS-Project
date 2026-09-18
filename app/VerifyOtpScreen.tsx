import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
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

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Verify");
  const [timeLeft, setTimeLeft] = useState(60);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  function handleChange(text: string, index: number) {
    const clean = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = clean;
    setOtp(next);
    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function verifyOtp() {
    const code = otp.join("");

    if (code.length !== 6) {
      showAlert("Error", "Enter the code sent to your email");
      return;
    }

    setLoading(true);
    setStatusText("Verifying...");

    try {
      const response = await fetch(
        `https://danger-reliable-conclude.ngrok-free.dev/employees?id=${personalNumber}&action=verify_otp&otp=${code}`,
        { headers: { "ngrok-skip-browser-warning": "true" } },
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (data.status === "invalid_otp") {
        showAlert("Error", "Incorrect code, please try again");
        setOtp(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        setStatusText("Verify");
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
      } else {
        setStatusText("Invalid code - try again");
        setOtp(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        setTimeout(() => setStatusText("Verify"), 2000);
      }
    } catch (error) {
      console.error(error);
      showAlert("Error", "Something went wrong. Please try again.");
      setStatusText("Verify");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (timeLeft > 0) return;
    try {
      await fetch(
        `https://danger-reliable-conclude.ngrok-free.dev/employees?id=${personalNumber}&action=resend_otp`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      setTimeLeft(60);
    } catch (err) {
      console.error("Failed to resend OTP:", err);
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.heading}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/images/saps-logo.png")}
              style={styles.logoBadge}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headingTitle}>Check Your Email</Text>
          <Text style={styles.headingSubtitle}>
            We've sent a 6-digit verification code to your registered email.
          </Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.btnLogin,
            pressed && styles.btnLoginPressed,
          ]}
          onPress={verifyOtp}
          disabled={loading}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color={Colors.white}
              style={{ marginRight: 10 }}
            />
          )}
          <Text style={styles.btnLoginText}>{statusText}</Text>
        </Pressable>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <Pressable onPress={handleResend} disabled={timeLeft > 0}>
            <Text
              style={[
                styles.resendBtn,
                timeLeft <= 0 && styles.resendBtnActive,
              ]}
            >
              Resend OTP
            </Text>
          </Pressable>
          {timeLeft > 0 && (
            <Text style={styles.timerText}>
              {" "}
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </Text>
          )}
        </View>

        <Pressable
          style={styles.backLink}
          onPress={() =>
            router.replace(purpose === "register" ? "/SignUpScreen" : "/")
          }
        >
          <Text style={styles.backLinkText}>
            {purpose === "register" ? "Back to Sign Up" : "Back to Login"}
          </Text>
        </Pressable>
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
    maxWidth: 460,
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
  heading: { alignItems: "center", marginBottom: 32 },
  headingTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
  },
  headingSubtitle: {
    fontSize: 15,
    color: Colors.grey500,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 28,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: Colors.sapsblue,
  },
  btnLogin: {
    flexDirection: "row",
    width: "100%",
    padding: 16,
    backgroundColor: Colors.blueMuted,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLoginPressed: {
    opacity: 0.85,
  },
  btnLoginText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  resendText: {
    fontSize: 14,
    color: Colors.grey500,
  },
  resendBtn: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.grey500,
  },
  resendBtnActive: {
    color: Colors.white,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  backLink: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backLinkText: {
    color: Colors.grey500,
    fontSize: 14,
    fontWeight: "500",
  },
});
