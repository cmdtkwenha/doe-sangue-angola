import type { BloodType, UserRole } from "@doe-sangue-angola/shared-types";
import { donors, hospitals, requests } from "./mockStore";
import { monitoringService } from "./monitoringService";

export type PilotAccount = {
  email: string;
  name: string;
  password: string;
  province: "Luanda" | "Benguela";
  role: UserRole;
};

export const pilotProvinces = ["Luanda", "Benguela"] as const;

export const pilotConfig = {
  enabled: process.env.NEXT_PUBLIC_PILOT_MODE === "true",
  notifications: process.env.NEXT_PUBLIC_PILOT_SAFE_NOTIFICATIONS !== "false",
  provinces: pilotProvinces,
  defaultProvince: "Luanda" as const,
  bloodTypes: ["O-", "O+", "A+", "B+"] as BloodType[]
};

export const pilotAccounts: PilotAccount[] = [
  {
    email: "hospital.luanda@sangueangola.ao",
    name: "Hospital Piloto Luanda",
    password: "Piloto@2026",
    province: "Luanda",
    role: "hospital"
  },
  {
    email: "hospital.benguela@sangueangola.ao",
    name: "Hospital Piloto Benguela",
    password: "Piloto@2026",
    province: "Benguela",
    role: "hospital"
  },
  {
    email: "dador.luanda@sangueangola.ao",
    name: "Dador Piloto Luanda",
    password: "Piloto@2026",
    province: "Luanda",
    role: "donor"
  },
  {
    email: "dador.benguela@sangueangola.ao",
    name: "Dador Piloto Benguela",
    password: "Piloto@2026",
    province: "Benguela",
    role: "donor"
  }
];

export function seedPilotAccounts() {
  monitoringService({
    message: "Contas piloto preparadas",
    metadata: { accounts: pilotAccounts.length, provinces: pilotProvinces.join(",") },
    status: "ok",
    type: "USER_ACTION"
  });

  return {
    accounts: pilotAccounts,
    message: "Contas piloto prontas para onboarding controlado."
  };
}

export function getPilotAnalytics() {
  const provinceSet = new Set<string>(pilotProvinces);
  const pilotHospitals = hospitals.filter((hospital) => provinceSet.has(hospital.province));
  const pilotDonors = donors.filter((donor) => provinceSet.has(donor.province));
  const pilotRequests = requests.filter((request) =>
    pilotHospitals.some((hospital) => hospital.id === request.hospitalId)
  );

  return {
    activeRequests: pilotRequests.filter((request) => request.status !== "Concluído").length,
    donors: pilotDonors.length,
    hospitals: pilotHospitals.length,
    notificationsSafe: pilotConfig.notifications,
    provinces: pilotProvinces,
    requests: pilotRequests.length
  };
}
