import type { UserRole } from "@doe-sangue-angola/shared-types";

export type SecurityPrincipal = {
  donorId?: string;
  hospitalId?: string;
  role: UserRole;
  userId: string;
};

export type PermissionArea =
  | "adminData"
  | "hospitalData"
  | "donorData"
  | "notifications"
  | "auditLogs";

export const protectedRouteRules: Array<{
  label: string;
  path: string;
  roles: UserRole[];
}> = [
  { label: "Admin nacional", path: "/admin", roles: ["admin"] },
  { label: "Hospital ou clínica", path: "/hospital", roles: ["admin", "hospital"] },
  { label: "Dador mobile", path: "/mobile", roles: ["admin", "donor"] },
  { label: "Onboarding admin", path: "/onboarding/admin", roles: ["admin"] },
  { label: "Onboarding hospital", path: "/onboarding/hospital", roles: ["admin", "hospital"] },
  { label: "Onboarding dador", path: "/onboarding/donor", roles: ["admin", "donor"] }
];

export const permissionMatrix: Record<PermissionArea, UserRole[]> = {
  adminData: ["admin"],
  hospitalData: ["admin", "hospital"],
  donorData: ["admin", "donor"],
  notifications: ["admin", "hospital", "donor"],
  auditLogs: ["admin"]
};

export function getAllowedRolesForPath(pathname: string) {
  return protectedRouteRules.find((rule) => pathname.startsWith(rule.path))?.roles;
}

export function canAccessPath(role: UserRole, pathname: string) {
  if (role === "admin") return true;
  const allowed = getAllowedRolesForPath(pathname);
  return allowed ? allowed.includes(role) : true;
}

export function canAccessArea(role: UserRole, area: PermissionArea) {
  return permissionMatrix[area].includes(role);
}

export function canReadHospitalData(principal: SecurityPrincipal, hospitalId: string) {
  if (principal.role === "admin") return true;
  return principal.role === "hospital" && principal.hospitalId === hospitalId;
}

export function canReadDonorData(principal: SecurityPrincipal, donorId: string) {
  if (principal.role === "admin") return true;
  return principal.role === "donor" && principal.donorId === donorId;
}

export function canReadAdminData(principal: SecurityPrincipal) {
  return principal.role === "admin";
}

export function maskPatientCode(patientCode: string) {
  return patientCode.length <= 4 ? "****" : `***-${patientCode.slice(-4)}`;
}
