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

export type PilotIssue = {
  id: string;
  owner: "Admin" | "Hospital" | "Dador";
  priority: "Alta" | "Média" | "Baixa";
  status: "Aberto" | "Em revisão" | "Resolvido";
  title: string;
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

export const firstPilotAccounts: PilotAccount[] = [
  {
    email: "admin.piloto@sangueangola.ao",
    name: "Admin Piloto",
    password: "Piloto@2026",
    province: "Luanda",
    role: "admin"
  },
  {
    email: "hospital.piloto@sangueangola.ao",
    name: "Hospital Piloto Luanda",
    password: "Piloto@2026",
    province: "Luanda",
    role: "hospital"
  },
  ...["ana", "maria", "joao", "paulo", "teresa"].map((name, index) => ({
    email: `dador.${name}@sangueangola.ao`,
    name: `Dador Piloto ${index + 1}`,
    password: "Piloto@2026",
    province: "Luanda" as const,
    role: "donor" as const
  }))
];

export const pilotIssues: PilotIssue[] = [
  {
    id: "PILOT-01",
    owner: "Admin",
    priority: "Alta",
    status: "Aberto",
    title: "Confirmar 25 hospitais importados antes do teste."
  },
  {
    id: "PILOT-02",
    owner: "Hospital",
    priority: "Média",
    status: "Em revisão",
    title: "Validar PIN em dispositivo real durante a sessão."
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
  const pilotHospitalCount =
    pilotHospitals.length || pilotAccounts.filter((account) => account.role === "hospital").length;
  const pilotRequests = requests.filter((request) =>
    pilotHospitals.some((hospital) => hospital.id === request.hospitalId)
  );

  return {
    activeRequests: pilotRequests.filter((request) => request.status !== "Concluído").length,
    donors: pilotDonors.length,
    hospitals: pilotHospitalCount,
    notificationsSafe: pilotConfig.notifications,
    provinces: pilotProvinces,
    requests: pilotRequests.length
  };
}

export function getFirstPilotDashboard() {
  const analytics = getPilotAnalytics();
  const donorUsers = firstPilotAccounts.filter((account) => account.role === "donor");
  const hospitalUsers = firstPilotAccounts.filter((account) => account.role === "hospital");

  return {
    donors: donorUsers.length,
    hospitals: hospitalUsers.length,
    issues: pilotIssues,
    requests: analytics.requests,
    users: firstPilotAccounts.length
  };
}
