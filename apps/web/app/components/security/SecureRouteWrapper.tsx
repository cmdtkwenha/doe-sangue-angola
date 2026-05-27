"use client";

import { isAuthorized } from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import styles from "../auth/auth.module.css";
import { LogoutButton } from "../auth/LogoutButton";
import { useAuth } from "../auth/useAuth";

export function SecureRouteWrapper({
  allowed,
  children,
  showLogout = true
}: {
  allowed: UserRole[];
  children: ReactNode;
  showLogout?: boolean;
}) {
  const { loading, session } = useAuth();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const allowedKey = allowed.join(":");
  const allowedRoles = useMemo(() => allowed, [allowedKey]);

  useEffect(() => {
    if (loading) return;
    const user = session?.user;
    if (!session || !user) router.replace(`/auth?next=${pathname}`);
    else if (!user.profileMissing && !isAuthorized(user.role, allowedRoles)) {
      router.replace("/unauthorized");
    }
  }, [allowedRoles, loading, pathname, router, session]);

  if (loading || !session) return <SecureLoadingState />;
  if (!session.user) return <MissingProfileState />;
  if (session.user.profileMissing) return <MissingProfileState />;
  if (!isAuthorized(session.user.role, allowedRoles)) return <SecureLoadingState />;

  return (
    <>
      {showLogout ? <div className={styles.topRight}><LogoutButton /></div> : null}
      {children}
    </>
  );
}

function MissingProfileState() {
  return (
    <main className={styles.loading}>
      <div className="panel">
        <div className="eyebrow">Perfil em falta</div>
        <h1 className="title">Perfil não encontrado</h1>
        <p className="muted">
          A conta existe, mas ainda não tem perfil de acesso.
          Termine o registo ou peça ao administrador para criar o perfil.
        </p>
        <LogoutButton />
      </div>
    </main>
  );
}

function SecureLoadingState() {
  return (
    <main className={styles.loading}>
      <div className="panel">
        <div className="eyebrow">Sessão segura</div>
        <h1 className="title">A validar permissões...</h1>
      </div>
    </main>
  );
}
