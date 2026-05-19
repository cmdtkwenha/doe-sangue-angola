"use client";

import {
  hospitals as mockHospitals,
  isSupabaseMode
} from "@doe-sangue-angola/shared-services";
import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useMemo } from "react";
import { useApiData } from "../../hooks/useApiData";
import { useAuth } from "../auth/useAuth";

export function useCurrentHospital() {
  const { session } = useAuth();
  const fallback = useMemo(() =>
    !isSupabaseMode() && process.env.NODE_ENV === "development"
      ? mockHospitals[0] ?? null
      : null, []);
  const userId = session?.user.id ?? "";
  const path = userId ? `/api/hospitals?userId=${userId}` : "/api/hospitals?userId=missing";

  return useApiData<Hospital | null>(path, fallback, userId.length);
}
