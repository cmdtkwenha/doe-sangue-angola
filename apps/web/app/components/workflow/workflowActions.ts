"use client";

import {
  acceptWorkflowRequest,
  completeWorkflowDonation,
  createWorkflowRequest,
  isSupabaseMode,
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
  if (!isSupabaseMode()) return createWorkflowRequest(input);

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
  if (!isSupabaseMode()) return acceptWorkflowRequest(donorId, requestId);
  return post<Appointment>("/api/appointments/accept", { donorId, requestId });
}

export async function updateStatusAction(requestId: string, status: RequestStatus) {
  if (!isSupabaseMode()) return markDonorOnWay(requestId);
  const result = await post<BloodRequest>("/api/blood-requests/status", { requestId, status });
  if (result.ok) publishRealtimeEvent("REQUEST_UPDATED", { request: result.data });
  return result;
}

export async function validatePinAction(pin: string, requestId: string) {
  if (!isSupabaseMode()) return validateWorkflowPin(pin, requestId);
  return post<Appointment>("/api/appointments/validate-pin", { pin, requestId });
}

export async function completeDonationAction(donorId: string, requestId: string) {
  if (!isSupabaseMode()) return completeWorkflowDonation(donorId, requestId);
  return post<BloodRequest>("/api/appointments/complete", { donorId, requestId });
}
