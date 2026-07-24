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

export default function Login() {
  const router = useRouter();
  const [personalNumber, setPersonalNumber] = useState("");
  const [password, setPassword] = useState("");

  function showAlert(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }
  async function verifyCredentials() {
    if (personalNumber === "" || password === "") {
      showAlert("Error", "Enter your credentials to log in");
      return;
    }

    try {
      const response = await fetch(
        `https://danger-reliable-conclude.ngrok-free.dev/employees?id=${personalNumber}&action=login&password=${password}`,
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
      } else if (data.status === "found") {
        let officer = data[personalNumber];
        if (officer.rank === "COMMANDER") {
          {
            router.replace({
              pathname: "/CommanderDashboardScreen",
              params: {
                personalNumber,
                name: data[personalNumber].name,
                surname: data[personalNumber].surname,
                rank: data[personalNumber].rank,
                staion: data[personalNumber].station,
                caseType: data[personalNumber].case_type,
                city: data[personalNumber].city,
              },
            });
          }
        } else {
          {
            router.replace({
              pathname: "/OfficerDashboardScreen",
              params: {
                personalNumber,
                name: data[personalNumber].name,
                surname: data[personalNumber].surname,
                rank: data[personalNumber].rank,
                station: data[personalNumber].station,
                caseType: data[personalNumber].case_type,
                city: data[personalNumber].city,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
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
            style={styles.input}
            placeholder="Enter personal number..."
            placeholderTextColor="#8d9bbf"
            value={personalNumber}
            onChangeText={setPersonalNumber}
            autoCapitalize="none"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Enter password..."
            placeholderTextColor="#8d9bbf"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* FORGOT PASSWORD */}
        <View style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password? </Text>
          <TouchableOpacity
            onPress={() => {
              router.replace("/CaseViewScreen");
            }}
          >
            <Text style={styles.forgotLink}>Reset password</Text>
          </TouchableOpacity>
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity style={styles.btnLogin} onPress={verifyCredentials}>
          <Text style={styles.btnLoginText}>Login</Text>
        </TouchableOpacity>

        {/* SIGN UP */}
        <View style={styles.signup}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              router.replace("/SignUpScreen");
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
    backgroundColor: "#0d1b4b",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#132060",
    borderRadius: 18,
    padding: 36,
    shadowColor: "#000",
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
    color: "#ffffff",
  },
  headingSubtitle: {
    fontSize: 15,
    color: "#8d9bbf",
    marginTop: 6,
  },
  field: {
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    paddingLeft: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    fontSize: 15,
    color: "#222",
    borderBottomWidth: 3,
    borderBottomColor: "#c8d0e8",
  },
  forgot: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 13,
    color: "#8d9bbf",
  },
  forgotLink: {
    fontSize: 13,
    color: "#ffffff",
  },
  btnLogin: {
    width: "100%",
    padding: 16,
    backgroundColor: "#2e4499",
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 28,
  },
  btnLoginText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#8d9bbf",
  },
  signupLink: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
