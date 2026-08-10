export const FILTERS = [
  "All",
  "Murder",
  "Rape",
  "Assault",
  "Theft",
  "Violence",
];

//TYPES
export type CaseItem = {
  caseNumber: string;
  dateOpened: string;
  victim: string;
  offence: string;
  place: string;
  caseDescription: string;
  status: string;
};
