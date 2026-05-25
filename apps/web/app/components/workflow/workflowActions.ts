"use client";

import {
  acceptWorkflowRequest,
  completeWorkflowDonation,
  createWorkflowRequest,
  markDonorOnWay,
  publishRealtimeEvent,
  validateWorkflowPin
} from "@doe-sangue-angola/shared-services";
import type {
  Appointment,
  BloodRequest,
  MatchResult,
  RequestStatus
} from "@doe-sangue-angola/shared-types";

type RequestDraft = Partial<BloodRequest>;
type ApiEnvelope<T> = { ok: boolean; data?: T; message?: string };
type CreateRequestResult = {
  matches: MatchResult[];
  request: BloodRequest;
};

function canUseMock() {
  return process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DATA_MODE !== "supabase";
}

async function post<T>(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.ok) {
    return { ok: false as const, message: payload.message ?? "Falha na sincronização." };
  }
  return { ok: true as const, data: payload.data as T };
}

export async function createRequestAction(input?: RequestDraft) {
  if (canUseMock()) return createWorkflowRequest(input);

  const result = await post<CreateRequestResult>("/api/blood-requests", {
    hospitalId: input?.hospitalId ?? "h1",
    patientCode: input?.patientCode ?? `PAC-${Date.now().toString().slice(-4)}`,
    bloodType: input?.bloodType ?? "O-",
    createdBy: input?.createdBy,
    municipality: input?.municipality,
    notes: input?.notes,
    province: input?.province,
    units: input?.units ?? 4,
    urgency: input?.urgency ?? "Critica"
  });
  if (result.ok) {
    publishRealtimeEvent("REQUEST_CREATED", { request: result.data.request });
  }
  return result;
}

export async function acceptRequestAction(donorId: string, requestId: string) {
  if (canUseMock()) return acceptWorkflowRequest(donorId, requestId);
  const result = await post<Appointment>("/api/appointments/accept", { donorId, requestId });
  if (result.ok) {
    publishRealtimeEvent("DONOR_ACCEPTED", { donorId, requestId });
    publishRealtimeEvent("APPOINTMENT_CREATED", { appointment: result.data });
  }
  return result;
}

export async function updateStatusAction(requestId: string, status: RequestStatus) {
  if (canUseMock()) return markDonorOnWay(requestId);
  const result = await post<BloodRequest>("/api/blood-requests/status", { requestId, status });
  if (result.ok) publishRealtimeEvent("REQUEST_UPDATED", { request: result.data });
  return result;
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: Appointment["status"]
) {
  const result = await post<Appointment>("/api/appointments/status", { appointmentId, status });
  if (result.ok) publishRealtimeEvent("APPOINTMENT_CREATED", { appointment: result.data });
  return result;
}

export async function validatePinAction(pin: string, requestId: string) {
  if (canUseMock()) return validateWorkflowPin(pin, requestId);
  return post<Appointment>("/api/appointments/validate-pin", { pin, requestId });
}

export async function completeDonationAction(donorId: string, requestId: string) {
  if (canUseMock()) return completeWorkflowDonation(donorId, requestId);
  return post<BloodRequest>("/api/appointments/complete", { donorId, requestId });
}
