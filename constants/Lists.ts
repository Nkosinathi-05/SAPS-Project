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