"use client";

import {
  getDataMode,
  hospitals as mockHospitals,
} from "@doe-sangue-angola/shared-services";
import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useEffect, useMemo } from "react";
import { useApiData } from "../../hooks/useApiData";
import { useAuth } from "../auth/useAuth";

export function useCurrentHospital() {
  const { session } = useAuth();
  const fallback = useMemo(() =>
    getDataMode() === "mock"
      ? mockHospitals[0] ?? null
      : null, []);
  const userId = session?.user.id ?? "";
  const path = userId ? `/api/hospitals?userId=${userId}` : "/api/hospitals?userId=missing";

  const result = useApiData<Hospital | null>(path, fallback, userId.length);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      !result.loading &&
      session?.user.role === "hospital" &&
      !result.data?.id
    ) {
      console.info("[hospital] Hospital ligado não encontrado", {
        linkedEntityId: session.user.linkedEntityId,
        profileId: session.user.id
      });
    }
  }, [result.data?.id, result.loading, session]);

  return result;
}
