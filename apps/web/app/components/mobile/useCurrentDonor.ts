"use client";

import {
  isSupabaseMode,
  listDonors
} from "@doe-sangue-angola/shared-services";
import type { Donor } from "@doe-sangue-angola/shared-types";
import { useMemo } from "react";
import { useAuth } from "../auth/useAuth";
import { useApiData } from "../../hooks/useApiData";

export function useCurrentDonor() {
  const { session } = useAuth();
  const fallback = useMemo(() => canUseDevelopmentMock() ? listDonors()[0] : null, []);
  const userId = session?.user.id ?? "";
  const path = userId ? `/api/donors?userId=${userId}` : "/api/donors?userId=missing";

  return useApiData<Donor | null>(path, fallback, userId.length);
}

export function canUseDevelopmentMock() {
  return !isSupabaseMode() && process.env.NODE_ENV === "development";
}

export function isDonorProfileComplete(donor: Donor | null): donor is Donor {
  return Boolean(
    donor?.bloodType &&
    donor.province &&
    donor.municipality &&
    donor.phone &&
    donor.birthDate
  );
}
