import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors } from "../constants/FormTheme";

export default function SignUp() {
  let errorMessage = "";
  const router = useRouter();
  const [personalNumber, setPersonalNumber] = useState("");

  function showAlert(title: string, message: string) {
    if (typeof window !== "undefined") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function verifyPersonalNumber() {
    if (personalNumber === "") {
      showAlert("Error", "Enter your personal number");
      return;
    }

    try {
      const response = await fetch(
        `https://danger-reliable-conclude.ngrok-free.dev/employees?id=${personalNumber}&action=verify`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const data = await response.json();

      if (data.status === "found") {
        {
          router.replace({
            pathname: "/CreatePasswordScreen",
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
      } else {
        showAlert("Error", "Account exists, please log in");
        errorMessage = "Account exists, please log in";
      }
    } catch (error) {
      console.error(error);
      showAlert("Error", "Something went wrong. Please try again.");
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
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
          <Text style={styles.headingTitle}>Sign Up</Text>
          <Text style={styles.headingSubtitle}>
            Verify your personal number to get started
          </Text>
        </View>

        {/* PERSONAL NUMBER */}
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Enter personal number..."
            placeholderTextColor={Colors.grey500}
            value={personalNumber}
            onChangeText={setPersonalNumber}
            autoCapitalize="none"
          />
        </View>

        {/* NOTE */}
        <Text style={styles.note}>
          Enter your SAPS personal number to verify your employment status
          before creating an account.
        </Text>
        {/*Error message*/}
        <Text style={styles.footerNote}>{errorMessage}</Text>
        {/* VERIFY BUTTON */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/OfficerDashboardScreen")}
        >
          <Text style={styles.btnPrimaryText}>Verify Personal Number</Text>
        </TouchableOpacity>

        {/* BACK TO LOGIN */}
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.push("/")}
        >
          <Text style={styles.btnOutlineText}>Back to Login</Text>
        </TouchableOpacity>

        {/* FOOTER NOTE */}
        <Text style={styles.footerNote}>
          Only registered SAPS employees can create accounts
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
