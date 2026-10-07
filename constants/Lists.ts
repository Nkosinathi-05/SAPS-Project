export const FILTERS = ["All", "Murder", "Rape", "Assault", "Theft"];

export type CaseItem = {
  caseId: string;
  assignedTo: string;
  caseNumber: string;
  dateOpened: string;
  victim: string;
  offence: string;
  place: string;
  caseDescription: string;
  status: string;
};

// Static avatar lookup — Metro needs require() calls to be literal strings,
// so every officer image has to be listed explicitly here.
export const officerAvatars: Record<string, any> = {
  JOHN_MOKOENA: require("../assets/images/JOHN_MOKOENA.jpeg"),
  EMILY_NAIDOO: require("../assets/images/EMILY_NAIDOO.jpeg"),
  LERATO_NKOSI: require("../assets/images/LERATO_NKOSI.jpeg"),
  NATHI_MOKWENA: require("../assets/images/NATHI_MOKWENA.jpeg"),
  SIPHO_DLAMINI: require("../assets/images/SIPHO_DLAMINI.jpeg"),
  THABO_MOKWENA: require("../assets/images/THABO_MOKWENA.jpeg"),
  UNKNOWN_UNKNOWN: require("../assets/images/UNKNOWN_UNKNOWN.jpeg"),
  // "NAME_SURNAME": require("../assets/images/NAME_SURNAME.jpeg"),
};

export const CommanderAvatars: Record<string, any> = {
  "JACOB_VAN WYK": require("../assets/images/JACOB_VAN WYK.jpeg"),
  UNKNOWN_UNKNOWN: require("../assets/images/UNKNOWN_UNKNOWN.jpeg"),
  // Add one entry per officer image in assets/images, matching the exact filename:
  // "NAME_SURNAME": require("../assets/images/NAME_SURNAME.jpeg"),
};

export const CHART_BARS = [
  { label: "Murder", color: "#dc2626" },
  { label: "Assault", color: "#001b44" },
  { label: "Rape", color: "#f7c600" },
  { label: "Theft", color: "#2563eb" },
];
