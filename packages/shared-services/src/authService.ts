import type { UserRole } from "@doe-sangue-angola/shared-types";
import { getAuthMode } from "./config";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const roleRedirects: Record<UserRole, string> = {
  admin: "/admin",
  hospital: "/hospital",
  donor: "/mobile"
};

export const roleOnboardingRedirects: Record<UserRole, string> = {
  admin: "/onboarding/admin",
  hospital: "/onboarding/hospital",
  donor: "/onboarding/donor"
};

export function getRedirectForRole(role: UserRole) {
  return roleRedirects[role];
}

export function getOnboardingRedirectForRole(role: UserRole) {
  return roleOnboardingRedirects[role];
}

export function isAuthorized(role: UserRole, allowed: UserRole[]) {
  return allowed.includes(role);
}

export function normalizeRole(role: unknown): UserRole {
  if (role === "admin" || role === "hospital" || role === "donor") return role;
  return "donor";
}

export function isKnownRole(role: unknown): role is UserRole {
  return role === "admin" || role === "hospital" || role === "donor";
}

export function getRoleFromMetadata(metadata?: Record<string, unknown>) {
  return normalizeRole(metadata?.role);
}

export function isDemoAuthAllowed() {
  return getAuthMode() !== "supabase";
}
