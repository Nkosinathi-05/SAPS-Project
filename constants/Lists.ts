export const FILTERS = ["All", "Murder", "Rape", "Assault", "Theft"];

export type CaseItem = {
  caseNumber: string;
  dateOpened: string;
  victim: string;
  offence: string;
  place: string;
  caseDescription: string;
  status: string;
  assignedTo: string;
  caseId: string;
};
