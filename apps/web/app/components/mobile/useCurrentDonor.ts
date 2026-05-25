"use client";

import type { Donor } from "@doe-sangue-angola/shared-types";
import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { useApiData } from "../../hooks/useApiData";

export function useCurrentDonor() {
  const { session } = useAuth();
  const userId = session?.user.authUserId ?? session?.user.id ?? "";
  const path = userId ? `/api/donors?userId=${userId}` : "/api/donors?userId=missing";

  const result = useApiData<Donor | null>(path, null, userId.length);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      !result.loading &&
      session?.user.role === "donor" &&
      !result.data?.id
    ) {
      console.info("[donor] Perfil de dador não encontrado", {
        authUserId: session.user.authUserId,
        profileId: session.user.id
      });
    }
  }, [result.data?.id, result.loading, session]);

  return result;
}

export function isDonorProfileComplete(
  donor: Donor | null,
  authUserId?: string
): donor is Donor {
  return getMissingDonorFields(donor, authUserId).length === 0;
}

export function getMissingDonorFields(donor: Donor | null, authUserId?: string) {
  if (!donor?.id) return ["linha do dador"];
  const fields: Array<[string, unknown]> = [
    ["auth_user_id", donor.authUserId === authUserId ? donor.authUserId : ""],
    ["blood_type", donor.bloodType],
    ["province", donor.province],
    ["municipality", donor.municipality],
    ["phone", donor.phone]
  ];

  return fields
    .filter(([, value]) => !String(value ?? "").trim())
    .map(([label]) => label);
}
