import { StyleSheet } from "react-native";
import { Colors } from "./FormTheme";

export const CommonStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  main: { paddingTop: 20, paddingBottom: 100, gap: 16 },
  container: {
    flex: 1,
    backgroundColor: Colors.grey50,
  },
  // Shared by mobile and laptop: just sizing, no visible container
  cardBase: {
    width: "100%",
    maxWidth: 420,
  },

  // STATUS BANNER
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 200,
  },
  statusBannerSuccess: {
    backgroundColor: Colors.green,
  },
  statusBannerError: {
    backgroundColor: Colors.red,
  },
  statusBannerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
  },
  statusBannerClose: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    paddingLeft: 12,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    backgroundColor: Colors.sapsblue,
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
    borderColor: Colors.gold,
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
    fontSize: 14,
    color: Colors.white,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: Colors.grey500,
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.gold,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },

  //BACK BUTTON
  btnBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  btnBackHovered: {
    backgroundColor: Colors.logoutHovered,
    borderColor: Colors.gold,
  },

  // LOGOUT BUTTON
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.logout,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnHovered: {
    backgroundColor: Colors.logoutHovered,
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

  // SEARCH
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.sapsblue,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.white,
  },

  // CASE LIST
  caseList: { gap: 12 },
  caseCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 12,
    padding: 16,
  },
  caseCardHovered: {
    shadowColor: Colors.black0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderColor: Colors.grey500,
  },
  caseCardPressed: { transform: [{ scale: 0.98 }] },
  caseCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  caseId: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: Colors.sapsblue,
  },
  caseTime: { fontSize: 12, color: Colors.grey500 },
  caseCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  caseVictim: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.sapsblue,
    marginBottom: 4,
  },
  caseTypeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  caseType: { fontSize: 13, color: Colors.grey500 },
  casePlace: { fontSize: 11, color: Colors.sapsblue, marginTop: 4 },
  SmallcasePlace: { fontSize: 10, color: Colors.sapsblue, marginTop: 3 },
  progress: {
    backgroundColor: Colors.sapsblue,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  progressText: { fontSize: 11, fontWeight: "700", color: Colors.white },

  // INVESTIGATION LOG BUTTON
  logButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.sapsblue,
    alignItems: "center",
  },
  logButtonHovered: {
    backgroundColor: Colors.sapsblue,
  },
  logButtonPressed: {
    opacity: 0.7,
  },
  logButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.sapsblue,
    letterSpacing: 0.5,
  },
  logButtonTextHovered: {
    color: Colors.white,
  },

  // SECTION
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.grey500,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.grey500,
    marginTop: 40,
    fontSize: 14,
  },

  // BOTTOM NAV
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grey300,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 200,
  },
  bottomNavSmall: {
    height: 68,
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.grey500,
  },
  navActive: {
    color: Colors.sapsblue,
  },
});
