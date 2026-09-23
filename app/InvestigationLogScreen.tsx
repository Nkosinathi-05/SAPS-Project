import React, { useEffect, useState } from "react";
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
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "../components/icons/buttons";
import { Colors } from "../constants/FormTheme";
import { API_BASE_URL } from "../constants/ApiUrl";

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

  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [caseStatus, setCaseStatus] = useState(status);

  const isCommander = rank === 'COMMANDER';
  const isAssignedDetective = !isCommander && personalNumber === assignedTo;
  const isResolved = caseStatus === 'RESOLVED';

  //FETCH LOG
  const fetchLogEntries = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/investigation?action=list&case_id=${caseId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      const rawText = await response.text();
      const sanitized = rawText.replace(/:\s*NaN/g, ": null");
      const data = JSON.parse(sanitized);

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
      setLogEntries([]);
    } finally {
      setLoadingLog(false);
    }
  };

  useEffect(() => {
    fetchLogEntries();
  }, [caseId]);

  const handleAddUpdate = async () => {
    if (!newUpdateText.trim()) {
      Alert.alert(
        "Empty update",
        "Please enter a progress update before submitting.",
      );
      return;
    }

    setSubmittingUpdate(true);
    try {
      const response = await fetch(`${API_BASE_URL}/investigation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          caseId,
          employeeNumber: personalNumber,
          updateText: newUpdateText.trim(),
        }),
      });
      const result = await response.json();

      if (!response.ok || result.status !== "added") {
        Alert.alert(
          "Error",
          "Could not add the progress update. Please try again.",
        );
        return;
      }

      setNewUpdateText("");
      await fetchLogEntries();
    } catch (error) {
      console.error("Failed to add update:", error);
      Alert.alert(
        "Error",
        "Could not add the progress update. Please try again.",
      );
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleDeleteEntry = (logId: number) => {
    confirmAction(
      'Delete update',
      'Are you sure you want to delete this progress update? A record of the deletion will remain visible in the log.',
      'Delete',
      async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/investigation?log_id=${logId}&employee_number=${personalNumber}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              },
            },
          );
          const result = await response.json();

          if (!response.ok || result.status !== 'deleted') {
            Alert.alert('Error', 'Could not delete the update. Please try again.');
            return;
          }

          await fetchLogEntries();
        } catch (error) {
          console.error('Failed to delete update:', error);
          Alert.alert('Error', 'Could not delete the update. Please try again.');
        }
      }
    );
  };

  const handleResolve = () => {
    confirmAction(
      'Resolve case',
      'Are you sure you want to mark this case as resolved?',
      'Resolve',
      async () => {
        setResolving(true);
        try {
          const response = await fetch(`${API_BASE_URL}/investigation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              action: 'resolve',
              caseId,
            }),
          });
          const result = await response.json();

          if (!response.ok || result.status !== 'resolved') {
            Alert.alert('Error', 'Could not resolve the case. Please try again.');
            return;
          }

          setCaseStatus('RESOLVED');
        } catch (error) {
          console.error('Failed to resolve case:', error);
          Alert.alert('Error', 'Could not resolve the case. Please try again.');
        } finally {
          setResolving(false);
        }
      }
    );
  };

  const handleReopen = () => {
    confirmAction(
      'Reopen case',
      'Are you sure you want to reopen this case? It will be marked as assigned again.',
      'Reopen',
      async () => {
        setReopening(true);
        try {
          const response = await fetch(`${API_BASE_URL}/investigation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              action: 'reopen',
              caseId,
            }),
          });
          const result = await response.json();

          if (!response.ok || result.status !== 'reopened') {
            Alert.alert('Error', 'Could not reopen the case. Please try again.');
            return;
          }

          setCaseStatus('ASSIGNED');
        } catch (error) {
          console.error('Failed to reopen case:', error);
          Alert.alert('Error', 'Could not reopen the case. Please try again.');
        } finally {
          setReopening(false);
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={({ hovered }) => [
                styles.btnBack,
                hovered && styles.btnBackHovered,
              ]}
              onPress={() =>
                router.navigate({
                  pathname: isCommander ? '/CaseListScreen' : '/OfficerCaseList',
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

            <View style={styles.headerDivider} />

            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/images/saps-logo.png")}
                style={styles.sapsLogo}
                resizeMode="cover"
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{caseNumber}</Text>
              {!isSmall && (
                <Text style={styles.headerSubtitle}>Investigation Log</Text>
              )}
            </View>
          </View>

          {!isSmall && (
            <View style={styles.headerRight}>
              <View style={styles.commanderInfo}>
                <Text style={styles.commanderName}>
                  {surname} {name}
                </Text>
                <Text style={styles.commanderRole}>{rank}</Text>
              </View>
              <View style={styles.avatar}>
                <Image
                  source={{
                    uri: "https://tse4.mm.bing.net/th/id/OIP.RuiYdm6APQVna3xXcyCX6AHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
                  }}
                  style={styles.avatarImg}
                />
              </View>
            </View>
          )}
        </View>

        {/* MAIN */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: isSmall ? 12 : 24 },
          ]}
        >
          {/* Case summary */}
          <View style={styles.caseSummaryRow}>
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
                style={[styles.logEntry, entry.isDeleted && styles.logEntryDeleted]}
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
                      This log was deleted by {entry.deletedByName ?? "Unknown"} on {entry.deletedAt}
                    </Text>
                    <Text style={styles.deletedContactNotice}>
                       Contact the SAPS records department if you need this entry recovered.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.logText}>{entry.updateText}</Text>
                    <Text style={styles.logSignature}>
                      — {entry.loggedByName}
                    </Text>
                  </>
                )}
              </View>
            ))
          )}

          {/* Add update form — detectives only, never commanders */}
          {!isCommander && !isResolved && (
            <View style={styles.addSection}>
              <Text style={styles.sectionTitle}>Add Progress Update</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Describe the latest progress on this case..."
                value={newUpdateText}
                onChangeText={setNewUpdateText}
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

          {/* Resolve button — assigned detective only */}
          {isAssignedDetective && !isResolved && (
            <Pressable
              style={[styles.resolveButton, resolving && styles.buttonDisabled]}
              onPress={handleResolve}
              disabled={resolving}
            >
              <Text style={styles.resolveButtonText}>
                {resolving ? "Resolving..." : "Resolve Case"}
              </Text>
            </Pressable>
          )}

          {/* Reopen button — commander only, resolved cases only */}
          {isCommander && isResolved && (
            <Pressable
              style={[styles.reopenButton, reopening && styles.buttonDisabled]}
              onPress={handleReopen}
              disabled={reopening}
            >
              <Text style={styles.reopenButtonText}>
                {reopening ? 'Reopening...' : 'Reopen Case'}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.sapsblue,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
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
  headerDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.gold,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  commanderInfo: {
    alignItems: "flex-end",
  },
  commanderName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  commanderRole: {
    fontSize: 11,
    color: Colors.gold,
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
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  sapsLogo: { width: "100%", height: "100%" },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.grey700,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  caseSummaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
  logTextDeleted: {
    textDecorationLine: "line-through",
    color: "#999",
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
    alignItems: 'center',
    marginTop: 24,
  },
  reopenButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});