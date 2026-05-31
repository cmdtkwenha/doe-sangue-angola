export type ReportFilterState = {
  bloodType: string;
  dateFrom: string;
  dateTo: string;
  hospital: string;
  municipality: string;
  province: string;
  status: string;
};

export type ReportDefinition = {
  description: string;
  id: string;
  rows: Record<string, string>[];
  summary: Array<[string, string]>;
  title: string;
};

export const emptyFilters: ReportFilterState = {
  bloodType: "",
  dateFrom: "",
  dateTo: "",
  hospital: "",
  municipality: "",
  province: "",
  status: ""
};
