"use client";

import type { Donor } from "@doe-sangue-angola/shared-types";
import { useAuth } from "../auth/useAuth";
import { useApiData } from "../../hooks/useApiData";

export function useCurrentDonor() {
  const { session } = useAuth();
  const userId = session?.user.authUserId ?? session?.user.id ?? "";
  const path = userId ? `/api/donors?userId=${userId}` : "/api/donors?userId=missing";

  return useApiData<Donor | null>(path, null, userId.length);
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
