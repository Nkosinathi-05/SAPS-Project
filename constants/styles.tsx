import { StyleSheet } from "react-native";
import { Colors } from "./FormTheme";

export const CommonStyles = StyleSheet.create({
  // Shared by mobile and laptop: just sizing, no visible container
  cardBase: {
    width: "100%",
    maxWidth: 420,
  },
  // Card look, applied on laptop only (width >= 768)
  cardLaptop: {
    backgroundColor: Colors.sapsblue,
    borderRadius: 18,
    padding: 36,
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.55,
    shadowRadius: 80,
    elevation: 20,
  },
  // Eye button for password visibility
  eyeBtn: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
  },
});
