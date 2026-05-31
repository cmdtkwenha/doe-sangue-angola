export type NationalMetric = {
  change: string;
  label: string;
  tone: "red" | "gold" | "black" | "green";
  value: string;
};

export type AvailabilityArea = {
  critical: number;
  donations: number;
  hospitals: number;
  level: "critical" | "warning" | "stable" | "surplus";
  name: string;
  requests: number;
  surplus: number;
};

export type BloodMonitorItem = {
  bloodType: string;
  demand: number;
  safeMinimum: number;
  status: "critical" | "warning" | "stable" | "surplus";
  units: number;
};

export type NationalAlert = {
  id: string;
  message: string;
  severity: "critical" | "warning" | "info";
  title: string;
};

export type ProvinceRanking = {
  activeDonors: number;
  donations: number;
  hospitals: number;
  province: string;
};

export type NationalAuditEvent = {
  action: string;
  actor: string;
  id: string;
  time: string;
};

export type NationalOperationsData = {
  alerts: NationalAlert[];
  auditTrail: NationalAuditEvent[];
  bloodTypes: BloodMonitorItem[];
  metrics: NationalMetric[];
  municipalities: AvailabilityArea[];
  provinces: AvailabilityArea[];
  rankings: ProvinceRanking[];
  sampleMode: boolean;
};
