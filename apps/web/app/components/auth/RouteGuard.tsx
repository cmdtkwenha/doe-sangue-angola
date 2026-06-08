import type { UserRole } from "@doe-sangue-angola/shared-types";
import type { ReactNode } from "react";
import { SecureRouteWrapper } from "../security/SecureRouteWrapper";

export function RouteGuard({
  allowed,
  children
}: {
  allowed: UserRole[];
  children: ReactNode;
}) {
  return <SecureRouteWrapper allowed={allowed} showLogout={false}>{children}</SecureRouteWrapper>;
}
