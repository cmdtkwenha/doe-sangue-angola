"use client";

import {
  subscribeRealtime
} from "@doe-sangue-angola/shared-services";
import { matchingAgent } from "@doe-sangue-angola/agents";
import type {
  Appointment,
  BloodRequest,
  Donor,
  Hospital,
  MatchResult
} from "@doe-sangue-angola/shared-types";
import { useEffect, useState } from "react";
import { useCurrentHospital } from "../hospital/useCurrentHospital";

type Snapshot = {
  appointment?: Appointment;
  hospital?: Hospital;
  matches: MatchResult[];
  request?: BloodRequest;
  responses: Array<{
    decision: "Aceite" | "Recusado";
    donorId: string;
    donorName: string;
    id: string;
    requestId: string;
    time: string;
  }>;
};

type Envelope<T> = { ok: boolean; data?: T };

export function useWorkflowSnapshot() {
  const { data: hospital } = useCurrentHospital();
  const [version, setVersion] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);

  useEffect(() => {
    const hospitalId = hospital?.id ?? "";
    let active = true;
    Promise.all([
      fetch(hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests")
        .then((item) => item.json() as Promise<Envelope<BloodRequest[]>>),
      fetch(hospitalId ? `/api/appointments?hospitalId=${hospitalId}` : "/api/appointments?hospitalId=missing")
        .then((item) => item.json() as Promise<Envelope<Appointment[]>>),
      fetch("/api/donors").then((item) => item.json() as Promise<Envelope<Donor[]>>)
    ]).then(([requestPayload, appointmentPayload, donorPayload]) => {
      if (!active) return;
      const request = requestPayload.data?.[0];
      const appointment = appointmentPayload.data?.[0];
      const donors = donorPayload.data ?? [];
      const matches = request ? matchingAgent(request, donors) : [];
      const donor = donors.find((item) => item.id === appointment?.donorId);
      setSnapshot({
        appointment,
        matches,
        hospital: hospital ?? undefined,
        request,
        responses: appointment && request ? [{
          decision: "Aceite",
          donorId: appointment.donorId,
          donorName: donor?.name ?? "Dador compatível",
          id: appointment.id,
          requestId: request.id,
          time: appointment.time
        }] : []
      });
    }).catch(() => active && setSnapshot(emptySnapshot));

    return () => {
      active = false;
    };
  }, [hospital, version]);

  useEffect(() => {
    return subscribeRealtime(() => setVersion((item) => item + 1));
  }, []);

  return {
    ...snapshot,
    refresh: () => setVersion(version + 1)
  };
}

const emptySnapshot: Snapshot = {
  matches: [],
  responses: []
};
