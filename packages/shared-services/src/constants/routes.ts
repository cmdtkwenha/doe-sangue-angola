import type { UserRole } from "@doe-sangue-angola/shared-types";

export const appRoutes = {
  login: "/auth",
  unauthorized: "/unauthorized",
  admin: "/admin",
  hospital: "/hospital",
  donor: "/mobile"
} as const;

export const roleHomeRoute: Record<UserRole, string> = {
  admin: appRoutes.admin,
  hospital: appRoutes.hospital,
  donor: appRoutes.donor,
  support: appRoutes.unauthorized,
  viewer: appRoutes.unauthorized
};

export const protectedRoutes = [
  appRoutes.admin,
  appRoutes.hospital,
  appRoutes.donor
] as const;
