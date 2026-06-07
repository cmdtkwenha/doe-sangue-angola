"use client";

import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../auth/useAuth";

type HospitalRow = {
  address?: string | null;
  capacity?: number | null;
  contact?: string | null;
  email?: string | null;
  facility_type?: string | null;
  hospital_type?: string | null;
  institutional_email?: string | null;
  id: string;
  license_number?: string | null;
  municipality: string;
  name: string;
  phone?: string | null;
  province: string;
  responsible_person?: string | null;
  rejection_reason?: string | null;
  type?: string | null;
  status?: string | null;
  verified?: boolean | null;
  verification_status?: string | null;
};

export function useCurrentHospital() {
  const { session } = useAuth();
  const [data, setData] = useState<Hospital | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user || !supabase) {
      setData(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    void loadLinkedHospital();

    async function loadLinkedHospital() {
      try {
        const { data: auth } = await supabase!.auth.getUser();
        const authUserId = auth.user?.id ?? session?.user.authUserId;
        const { data: profile, error: profileError } = await supabase!
          .from("profiles")
          .select("*")
          .eq("auth_user_id", authUserId)
          .maybeSingle();
        if (profileError) throw profileError;
        const linkedId = String(profile?.linked_entity_id ?? profile?.hospital_id ?? "");
        if (!linkedId) {
          if (active) setData(null);
          return;
        }
        const { data: hospital, error: hospitalError } = await supabase!
          .from("hospitals")
          .select("*")
          .eq("id", linkedId)
          .maybeSingle();
        if (hospitalError) throw hospitalError;
        if (active) setData(hospital ? mapHospital(hospital as HospitalRow) : null);
      } catch (loadError) {
        if (!active) return;
        setData(null);
        setError(loadError instanceof Error ? loadError.message : "Erro ao carregar hospital.");
      } finally {
        if (active) setLoading(false);
      }
    }
    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || loading || data?.id) return;
    if (session?.user.role === "hospital") {
      console.info("[hospital] Hospital ligado não encontrado", {
        error,
        linkedEntityId: session.user.linkedEntityId,
        profileId: session.user.id
      });
    }
  }, [data?.id, error, loading, session]);

  return { data, error, loading, usingApi: true };
}

function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    address: row.address ?? undefined,
    capacity: row.capacity ?? 0,
    contact: row.responsible_person ?? row.contact ?? row.phone ?? "",
    email: row.institutional_email ?? row.email ?? undefined,
    licenseNumber: row.license_number ?? undefined,
    municipality: row.municipality,
    name: row.name,
    province: row.province,
    rejectionReason: row.rejection_reason ?? undefined,
    type: row.hospital_type ?? row.facility_type ?? row.type ?? "Hospital",
    verified: Boolean(row.verified),
    verificationStatus: normalizeHospitalStatus(row)
  };
}

function normalizeHospitalStatus(row: HospitalRow) {
  const value = row.status ?? row.verification_status;
  if (value === "Pendente" || value === "Verificado" || value === "Rejeitado" || value === "Suspenso" || value === "Revisão Necessária") return value;
  if (value === "pending" || value === "verified" || value === "rejected" || value === "suspended" || value === "needs_review") return value;
  return row.verified ? "Verificado" : "Pendente";
}
