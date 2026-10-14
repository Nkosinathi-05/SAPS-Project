import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
  BackHandler,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "../components/icons/buttons";
import { Colors } from "../constants/FormTheme";
import { CommonStyles } from "../constants/styles";
import { API_BASE_URL } from "../constants/ApiUrl";
import { CommanderAvatars } from "../constants/Lists";

/* ==========================================================
   Configuration
   ========================================================== */

// Commanders are view-only for logs. This flag only controls the
// "Reopen Case" button on resolved cases. Set to false for a strictly
// view-only commander experience.
const COMMANDER_CAN_REOPEN = true;

const JSON_HEADERS = { "Content-Type": "application/json" };

const defaultAvatar = CommanderAvatars["UNKNOWN_UNKNOWN"];

// Shape of one investigation log entry, mapped from the INVESTIGATION_LOG table
interface LogEntry {
  logId: number;
  entryDate: string;
  updateText: string;
  loggedByName: string;
  isDeleted: boolean;
  deletedByName: string | null;
  deletedAt: string | null;
}

/* ==========================================================
   Final verdict
   ========================================================== */

const OUTCOME_OPTIONS = [
  { value: "CONVICTED", label: "Convicted" },
  { value: "ACQUITTED", label: "Acquitted" },
  { value: "CHARGES_WITHDRAWN", label: "Charges withdrawn" },
  { value: "PROPERTY_RECOVERED", label: "Property recovered" },
  { value: "PROPERTY_NOT_RECOVERED", label: "Property not recovered" },
  { value: "UNFOUNDED", label: "Unfounded" },
  { value: "OTHER", label: "Other" },
];

const outcomeLabel = (value: string | null) =>
  OUTCOME_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "";

const VERDICT_MAX_LENGTH = 2000;

interface Verdict {
  outcomeType: string;
  finalVerdict: string;
  resolvedByName: string;
  dateResolved: string;
}

// Longest phrases first so "not guilty" wins over "guilty"
const VERDICT_KEYWORDS = [
  "found not guilty",
  "found guilty",
  "not guilty",
  "guilty",
  "convicted",
  "acquitted",
  "sentenced",
  "partially recovered",
  "not recovered",
  "recovered",
  "charges withdrawn",
  "charges dropped",
  "unfounded",
];

const VERDICT_REGEX = new RegExp(
  `\\b(${[...VERDICT_KEYWORDS]
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/ /g, "\\s+"))
    .join("|")})\\b`,
  "gi",
);

// Display-only: the saved text is never changed
function HighlightedVerdict({ text }: { text: string }) {
  const parts = text.split(VERDICT_REGEX);

  return (
    <Text style={styles.verdictText}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={styles.verdictKeyword}>
            {part.toUpperCase()}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

/* ==========================================================
   Cross-platform dialogs (Alert.alert does nothing on web)
   ========================================================== */

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const confirmAction = (
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: confirmLabel, style: "destructive", onPress: onConfirm },
    ]);
  }
};

export default function InvestigationLogScreen() {
  const {
    name,
    surname,
    rank,
    personalNumber,
    station,
    caseType,
    city,
    caseNumber,
    victim,
    offence,
    status,
    caseId,
    assignedTo,
  } = useLocalSearchParams<{
    name: string;
    surname: string;
    rank: string;
    personalNumber: string;
    station: string;
    caseType: string;
    city: string;
    caseId: string;
    caseNumber: string;
    victim: string;
    offence: string;
    status: string;
    assignedTo: string;
  }>();

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 480;

  const scrollRef = useRef<ScrollView>(null);

  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [caseStatus, setCaseStatus] = useState(status);

  // Final verdict state
  const [verdictModalVisible, setVerdictModalVisible] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [verdictText, setVerdictText] = useState("");
  const [verdictError, setVerdictError] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  // Guards against setting state after the screen has unmounted
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ----------------------------------------------------------
     Roles
     - Commander: view only (can optionally reopen resolved cases)
     - Officer:   can add and delete log entries while case is open
     ---------------------------------------------------------- */
  const isCommander = rank?.trim().toUpperCase() === "COMMANDER";
  const isAssignedDetective = !isCommander && personalNumber === assignedTo;
  const isResolved = caseStatus === "RESOLVED";
  const canEditLog = !isCommander && !isResolved;

  // Resolve the avatar for the currently loaded officer, falling back to
  // the UNKNOWN UNKNOWN placeholder if there's no matching image.
  const avatarKey = `${name?.toUpperCase() ?? "UNKNOWN"}_${surname?.toUpperCase() ?? "UNKNOWN"}`;
  const avatarSource = CommanderAvatars[avatarKey] ?? defaultAvatar;

  /* ----------------------------------------------------------
     Back navigation
     - Commander -> CaseListScreen
     - Officer   -> OfficerCaseList
     Used by both the header arrow and the Android hardware back button.
     ---------------------------------------------------------- */
  const goBack = useCallback(() => {
    router.navigate({
      pathname: isCommander ? "/CaseListScreen" : "/OfficerCaseList",
      params: {
        name,
        surname,
        rank,
        personalNumber,
        station,
        caseType,
        city,
      },
    });
  }, [
    router,
    isCommander,
    name,
    surname,
    rank,
    personalNumber,
    station,
    caseType,
    city,
  ]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Let the modal close first if it is open
        if (verdictModalVisible) {
          if (!resolving) setVerdictModalVisible(false);
          return true;
        }
        goBack();
        return true;
      },
    );

    return () => subscription.remove();
  }, [goBack, verdictModalVisible, resolving]);

  // FETCH LOG
  const fetchLogEntries = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/investigation?action=list&case_id=${caseId}`,
      );
      const rawText = await response.text();
      const sanitized = rawText.replace(/:\s*NaN/g, ": null");
      const data = JSON.parse(sanitized);

      if (!mountedRef.current) return;

      if (!response.ok || !Array.isArray(data)) {
        console.error(
          "Investigation log fetch did not return a valid array:",
          data,
        );
        setLogEntries([]);
        return;
      }

      const mapped: LogEntry[] = data.map((item: any) => ({
        logId: item.LOG_ID,
        entryDate: item.ENTRY_DATE ?? "",
        updateText: item.UPDATE_TEXT ?? "",
        loggedByName: item.LOGGED_BY_NAME ?? "Unknown",
        isDeleted: !!item.IS_DELETED,
        deletedByName: item.DELETED_BY_NAME ?? null,
        deletedAt: item.DELETED_AT ?? null,
      }));

      setLogEntries(mapped);
    } catch (error) {
      console.error("Failed to fetch investigation log:", error);
      if (mountedRef.current) setLogEntries([]);
    } finally {
      if (mountedRef.current) setLoadingLog(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchLogEntries();
  }, [fetchLogEntries]);

  // FETCH FINAL VERDICT
  const fetchVerdict = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/investigation?action=verdict&case_id=${caseId}`,
      );
      const rawText = await response.text();
      const data = JSON.parse(rawText.replace(/:\s*NaN/g, ": null"));

      if (!mountedRef.current) return;

      if (!response.ok || !data || !data.FINAL_VERDICT) {
        setVerdict(null);
        return;
      }

      setVerdict({
        outcomeType: data.OUTCOME_TYPE ?? "OTHER",
        finalVerdict: data.FINAL_VERDICT,
        resolvedByName: data.RESOLVED_BY_NAME ?? "Unknown",
        dateResolved: data.DATE_RESOLVED ?? "",
      });
    } catch (error) {
      console.error("Failed to fetch verdict:", error);
      if (mountedRef.current) setVerdict(null);
    }
  }, [caseId]);

  useEffect(() => {
    if (isResolved) {
      fetchVerdict();
    } else {
      setVerdict(null);
    }
  }, [isResolved, fetchVerdict]);

  const handleAddUpdate = async () => {
    if (!canEditLog) return;

    if (!newUpdateText.trim()) {
      showMessage(
        "Empty update",
        "Please enter a progress update before submitting.",
      );
      return;
    }

    setSubmittingUpdate(true);
    try {
      const response = await fetch(`${API_BASE_URL}/investigation`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          caseId,
          employeeNumber: personalNumber,
          updateText: newUpdateText.trim(),
        }),
      });
      const result = await response.json();

      if (!response.ok || result.status !== "added") {
        showMessage(
          "Error",
          "Could not add the progress update. Please try again.",
        );
        return;
      }

      setNewUpdateText("");
      await fetchLogEntries();
    } catch (error) {
      console.error("Failed to add update:", error);
      showMessage(
        "Error",
        "Could not add the progress update. Please try again.",
      );
    } finally {
      if (mountedRef.current) setSubmittingUpdate(false);
    }
  };

  const handleDeleteEntry = (logId: number) => {
    if (!canEditLog) return;

    confirmAction(
      "Delete update",
      "Are you sure you want to delete this progress update? A record of the deletion will remain visible in the log.",
      "Delete",
      async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/investigation?log_id=${logId}&employee_number=${personalNumber}`,
            {
              method: "DELETE",
              headers: JSON_HEADERS,
            },
          );
          const result = await response.json();

          if (!response.ok || result.status !== "deleted") {
            showMessage(
              "Error",
              "Could not delete the update. Please try again.",
            );
            return;
          }

          await fetchLogEntries();
        } catch (error) {
          console.error("Failed to delete update:", error);
          showMessage(
            "Error",
            "Could not delete the update. Please try again.",
          );
        }
      },
    );
  };

  // Opens the verdict modal; the actual resolve happens in handleSubmitVerdict
  const handleResolve = () => {
    setSelectedOutcome(null);
    setVerdictText("");
    setVerdictError("");
    setVerdictModalVisible(true);
  };

  const handleSubmitVerdict = () => {
    if (!selectedOutcome) {
      setVerdictError("Please select the outcome of the case.");
      return;
    }
    if (!verdictText.trim()) {
      setVerdictError("Please write the final verdict before resolving.");
      return;
    }

    setVerdictError("");

    confirmAction(
      "Resolve case",
      "Once resolved, the final verdict cannot be edited. Are you sure?",
      "Resolve",
      async () => {
        setResolving(true);
        try {
          const response = await fetch(`${API_BASE_URL}/investigation`, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
              action: "resolve",
              caseId,
              employeeNumber: personalNumber,
              outcomeType: selectedOutcome,
              finalVerdict: verdictText.trim(),
            }),
          });
          const result = await response.json();

          if (!response.ok || result.status !== "resolved") {
            setVerdictError(
              result.message ?? "Could not resolve the case. Please try again.",
            );
            return;
          }

          setVerdictModalVisible(false);
          setCaseStatus("RESOLVED");
        } catch (error) {
          console.error("Failed to resolve case:", error);
          if (mountedRef.current) {
            setVerdictError("Could not resolve the case. Please try again.");
          }
        } finally {
          if (mountedRef.current) setResolving(false);
        }
      },
    );
  };

  const handleReopen = () => {
    confirmAction(
      "Reopen case",
      "Are you sure you want to reopen this case? It will be marked as assigned again.",
      "Reopen",
      async () => {
        setReopening(true);
        try {
          const response = await fetch(`${API_BASE_URL}/investigation`, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
              action: "reopen",
              caseId,
            }),
          });
          const result = await response.json();

          if (!response.ok || result.status !== "reopened") {
            showMessage(
              "Error",
              "Could not reopen the case. Please try again.",
            );
            return;
          }

          setCaseStatus("ASSIGNED");
        } catch (error) {
          console.error("Failed to reopen case:", error);
          showMessage("Error", "Could not reopen the case. Please try again.");
        } finally {
          if (mountedRef.current) setReopening(false);
        }
      },
    );
  };

  return (
    <SafeAreaView
      style={CommonStyles.safeArea}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={CommonStyles.container}>
          {/* HEADER */}
          <View style={CommonStyles.header}>
            <View style={CommonStyles.headerLeft}>
              <Pressable
                style={({ hovered }: any) => [
                  CommonStyles.btnBack,
                  hovered && CommonStyles.btnBackHovered,
                ]}
                onPress={() =>
                  router.navigate({
                    pathname: isCommander ? "/CaseListScreen" : "/OfficerCaseList",
                    params: {
                      name,
                      surname,
                      rank,
                      personalNumber,
                      station,
                      caseType,
                      city,
                      caseNumber,
                      victim,
                      offence,
                      status,
                      caseId,
                      assignedTo,
                    },
                  })
                }
              >
                <ArrowLeftIcon size={18} color={Colors.gold} />
              </Pressable>

              <View style={CommonStyles.headerDivider} />

              <View style={CommonStyles.logoWrapper}>
                <Image
                  source={require("../assets/images/saps-logo.png")}
                  style={CommonStyles.sapsLogo}
                  resizeMode="cover"
                />
              </View>

              <View style={CommonStyles.headerText}>
                <Text style={CommonStyles.headerTitle}>{caseNumber}</Text>
                {!isSmall && (
                  <Text style={CommonStyles.headerSubtitle}>
                    Investigation Log
                  </Text>
                )}
              </View>
            </View>

            {/* HEADER RIGHT: avatar */}
            <View style={CommonStyles.headerRight}>
              <View style={CommonStyles.avatar}>
                <Image
                  source={avatarSource}
                  style={CommonStyles.avatarImg}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* MAIN */}
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              { paddingHorizontal: isSmall ? 12 : 24 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Status badge */}
            <View style={styles.topRow}>
              <View
                style={[
                  styles.statusBadge,
                  statusStyles[caseStatus] ?? statusStyles.DEFAULT,
                ]}
              >
                <Text style={styles.statusText}>{caseStatus}</Text>
              </View>
            </View>

            <Text style={styles.label}>Victim</Text>
            <Text style={styles.value}>{victim}</Text>
            <Text style={styles.label}>Offence</Text>
            <Text style={styles.value}>{offence}</Text>

            {/* Final verdict: resolved cases only */}
            {isResolved && verdict && (
              <View style={styles.verdictCard}>
                <Text style={styles.verdictHeading}>Final Verdict</Text>
                <View style={styles.outcomeBadge}>
                  <Text style={styles.outcomeBadgeText}>
                    {outcomeLabel(verdict.outcomeType)}
                  </Text>
                </View>
                <HighlightedVerdict text={verdict.finalVerdict} />
                <Text style={styles.logSignature}>
                  - {verdict.resolvedByName}
                  {verdict.dateResolved ? `, ${verdict.dateResolved}` : ""}
                </Text>
              </View>
            )}

            {/* Investigation log list */}
            <Text style={styles.sectionTitle}>Investigation Log</Text>
            {loadingLog ? (
              <ActivityIndicator
                size="small"
                color={Colors.sapsblue}
                style={{ marginTop: 10 }}
              />
            ) : logEntries.length === 0 ? (
              <Text style={styles.emptyText}>No progress updates yet.</Text>
            ) : (
              logEntries.map((entry) => (
                <View
                  key={entry.logId}
                  style={[
                    styles.logEntry,
                    entry.isDeleted && styles.logEntryDeleted,
                  ]}
                >
                  <View style={styles.logEntryTop}>
                    <Text style={styles.logDate}>{entry.entryDate}</Text>
                    {!isCommander && !entry.isDeleted && (
                      <Pressable onPress={() => handleDeleteEntry(entry.logId)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    )}
                  </View>
                  {entry.isDeleted ? (
                    <>
                      <Text style={styles.deletedNotice}>
                        This log was deleted by{" "}
                        {entry.deletedByName ?? "Unknown"} on {entry.deletedAt}
                      </Text>
                      <Text style={styles.deletedContactNotice}>
                        Contact the SAPS records department if you need this
                        entry recovered.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.logText}>{entry.updateText}</Text>
                      <Text style={styles.logSignature}>
                        - {entry.loggedByName}
                      </Text>
                    </>
                  )}
                </View>
              ))
            )}

            {/* Add update form: detectives only, never commanders */}
            {!isCommander && !isResolved && (
              <View style={styles.addSection}>
                <Text style={styles.sectionTitle}>Add Progress Update</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Describe the latest progress on this case..."
                  value={newUpdateText}
                  onChangeText={setNewUpdateText}
                  onFocus={() =>
                    setTimeout(
                      () => scrollRef.current?.scrollToEnd({ animated: true }),
                      300,
                    )
                  }
                  multiline
                  numberOfLines={4}
                  editable={!submittingUpdate}
                />
                <Pressable
                  style={[
                    styles.addButton,
                    submittingUpdate && styles.buttonDisabled,
                  ]}
                  onPress={handleAddUpdate}
                  disabled={submittingUpdate}
                >
                  <Text style={styles.addButtonText}>
                    {submittingUpdate ? "Adding..." : "Add Update"}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Resolve button: assigned detective only */}
            {isAssignedDetective && !isResolved && (
              <Pressable
                style={[
                  styles.resolveButton,
                  resolving && styles.buttonDisabled,
                ]}
                onPress={handleResolve}
                disabled={resolving}
              >
                <Text style={styles.resolveButtonText}>
                  {resolving ? "Resolving..." : "Resolve Case"}
                </Text>
              </Pressable>
            )}

            {/* Reopen button: commander only, resolved cases only */}
            {isCommander && isResolved && (
              <Pressable
                style={[
                  styles.reopenButton,
                  reopening && styles.buttonDisabled,
                ]}
                onPress={handleReopen}
                disabled={reopening}
              >
                <Text style={styles.reopenButtonText}>
                  {reopening ? "Reopening..." : "Reopen Case"}
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* FINAL VERDICT MODAL */}
      <Modal
        visible={verdictModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !resolving && setVerdictModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Resolve Case</Text>
              <Text style={styles.modalSubtitle}>{caseNumber}</Text>

              <Text style={styles.modalLabel}>Outcome</Text>
              <View style={styles.outcomeRow}>
                {OUTCOME_OPTIONS.map((option) => {
                  const selected = selectedOutcome === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.outcomeChip,
                        selected && styles.outcomeChipSelected,
                      ]}
                      onPress={() => {
                        setSelectedOutcome(option.value);
                        setVerdictError("");
                      }}
                      disabled={resolving}
                    >
                      <Text
                        style={[
                          styles.outcomeChipText,
                          selected && styles.outcomeChipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Final verdict</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 120 }]}
                placeholder="e.g. Suspect 1 John Doe was found guilty and sentenced to 10 years imprisonment."
                value={verdictText}
                onChangeText={(text) => {
                  setVerdictText(text);
                  setVerdictError("");
                }}
                multiline
                maxLength={VERDICT_MAX_LENGTH}
                editable={!resolving}
              />
              <Text style={styles.charCount}>
                {verdictText.length}/{VERDICT_MAX_LENGTH}
              </Text>

              {!!verdictError && (
                <Text style={styles.verdictError}>{verdictError}</Text>
              )}

              <Text style={styles.lockNotice}>
                The final verdict cannot be edited once the case is resolved.
              </Text>

              <View style={styles.modalActions}>
                <Pressable
                  style={[
                    styles.modalCancel,
                    resolving && styles.buttonDisabled,
                  ]}
                  onPress={() => setVerdictModalVisible(false)}
                  disabled={resolving}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalConfirm,
                    resolving && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmitVerdict}
                  disabled={resolving}
                >
                  <Text style={styles.modalConfirmText}>
                    {resolving ? "Resolving..." : "Resolve Case"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const statusStyles: Record<string, { backgroundColor: string }> = {
  ASSIGNED: { backgroundColor: "#f0ad4e" },
  UNASSIGNED: { backgroundColor: "#6c757d" },
  RESOLVED: { backgroundColor: "#28a745" },
  DEFAULT: { backgroundColor: "#6c757d" },
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    color: "#777",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 10,
    color: "#1a1a1a",
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
  },
  logEntry: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sapsblue,
  },
  logEntryDeleted: {
    backgroundColor: "#f5f5f5",
    borderLeftColor: "#c0392b",
  },
  logEntryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  logDate: {
    fontSize: 12,
    color: "#777",
  },
  deleteText: {
    fontSize: 12,
    color: "#c0392b",
    fontWeight: "600",
  },
  logText: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  logSignature: {
    fontSize: 11,
    color: "#555",
    fontStyle: "italic",
    marginTop: 6,
  },
  deletedNotice: {
    fontSize: 11,
    color: "#c0392b",
    fontWeight: "600",
    marginTop: 6,
  },
  deletedContactNotice: {
    fontSize: 11,
    color: "#777",
    fontStyle: "italic",
    marginTop: 4,
  },
  addSection: {
    marginTop: 10,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 90,
  },
  addButton: {
    backgroundColor: Colors.sapsblue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  resolveButton: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  resolveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  reopenButton: {
    backgroundColor: Colors.sapsblue,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  reopenButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  /* Final verdict card */
  verdictCard: {
    backgroundColor: "#eef3ff",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sapsblue,
  },
  verdictHeading: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#777",
    marginBottom: 8,
  },
  outcomeBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.sapsblue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  outcomeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  verdictText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#1a1a1a",
  },
  verdictKeyword: {
    fontWeight: "800",
    color: Colors.sapsblue,
    backgroundColor: "#fff3bf",
  },

  /* Final verdict modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 12,
    marginBottom: 8,
  },
  outcomeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  outcomeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  outcomeChipSelected: {
    backgroundColor: Colors.sapsblue,
    borderColor: Colors.sapsblue,
  },
  outcomeChipText: {
    fontSize: 13,
    color: "#1a1a1a",
  },
  outcomeChipTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  charCount: {
    fontSize: 11,
    color: "#888",
    textAlign: "right",
    marginTop: 4,
  },
  verdictError: {
    color: "#c0392b",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  lockNotice: {
    fontSize: 11,
    color: "#777",
    fontStyle: "italic",
    marginTop: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalCancelText: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  modalConfirm: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: Colors.green,
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
