"use client";

import { useAuth } from "./useAuth";

export function LogoutButton() {
  const { logout, session } = useAuth();

  if (!session) return null;

  return (
    <button className="button" onClick={logout} type="button">
      Sair
    </button>
  );
}
