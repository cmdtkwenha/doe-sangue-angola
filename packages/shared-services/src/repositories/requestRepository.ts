import { schedulingAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { getDatabaseClient } from "../databaseService";
import { donorRepository } from "./donorRepository";
import { hospitalRepository } from "./hospitalRepository";
import { mapAppointment, mapRequest, type AppointmentRow, type RequestRow } from "./databaseTypes";

type CreateRequestInput = Omit<BloodRequest, "createdAt" | "id" | "status">;
type UpdateRequestInput = Partial<CreateRequestInput> & { status?: BloodRequest["status"] };
type SelectResult = { data: unknown; error: { message?: string; code?: string } | null };

export const requestRepository = {
  async listRequests() {
    const result = await getDatabaseClient()
      .from("blood_requests")
      .select(requestColumns)
      .order("created_at", { ascending: false });

    const { data, error } = await retryWithoutQuotaColumns(result);
    if (error) throw error;
    return (data as unknown as RequestRow[]).map(mapRequest);
  },

  async listRequestsForHospital(hospitalId: string) {
    const result = await getDatabaseClient()
      .from("blood_requests")
      .select(requestColumns)
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    const { data, error } = await retryWithoutQuotaColumns(result, hospitalId);
    if (error) throw error;
    return (data as unknown as RequestRow[]).map(mapRequest);
  },

  async createRequest(input: CreateRequestInput) {
    const { data, error } = await getDatabaseClient()
      .from("blood_requests")
      .insert({
        created_by: input.createdBy,
        hospital_id: input.hospitalId,
        patient_code: input.patientCode,
        blood_type: input.bloodType,
        units: input.units,
        units_needed: input.units,
        province: input.province,
        municipality: input.municipality,
        notes: input.notes,
        urgency: input.urgency,
        accepted_count: 0,
        remaining_slots: input.units,
        status: "OPEN"
      })
      .select(requestColumns)
      .single();

    if (error) throw error;
    return mapRequest(data as unknown as RequestRow);
  },

  async updateRequest(id: string, input: UpdateRequestInput) {
    const payload = {
      blood_type: input.bloodType,
      created_by: input.createdBy,
      hospital_id: input.hospitalId,
      municipality: input.municipality,
      notes: input.notes,
      patient_code: input.patientCode,
      province: input.province,
      status: input.status,
      units: input.units,
      units_needed: input.units,
      urgency: input.urgency
    };
    const { data, error } = await getDatabaseClient()
      .from("blood_requests")
      .update(removeUndefined(payload))
      .eq("id", id)
      .select(requestColumns)
      .single();

    if (error) throw error;
    return mapRequest(data as unknown as RequestRow);
  },

  closeRequest(id: string) {
    return this.updateRequestStatus(id, "CANCELLED");
  },

  async updateRequestStatus(id: string, status: BloodRequest["status"]) {
    const { data, error } = await getDatabaseClient()
      .from("blood_requests")
      .update({ status })
      .eq("id", id)
      .select(requestColumns)
      .single();

    if (error) throw error;
    return mapRequest(data as unknown as RequestRow);
  },

  async completeRequest(donorId: string, requestId: string) {
    const { error } = await getDatabaseClient()
      .from("appointments")
      .update({ status: "Concluido" })
      .eq("donor_id", donorId)
      .eq("blood_request_id", requestId);
    if (error) throw error;

    await donorRepository.addRewardPoints(donorId, 120);
    return this.updateRequestStatus(requestId, "COMPLETED");
  },

  async acceptRequest(donorId: string, requestId: string) {
    const existing = await findAppointment(donorId, requestId);
    if (existing) {
      await this.updateRequestStatus(requestId, "Doador a Caminho");
      return existing;
    }

    const request = await findRequest(requestId);
    const donor = await donorRepository.findDonor(donorId);
    const hospital = await hospitalRepository.getHospital(request.hospitalId);
    const appointment = schedulingAgent(donor, hospital);

    const { data, error } = await getDatabaseClient()
      .from("appointments")
      .insert({
        donor_id: donorId,
        hospital_id: request.hospitalId,
        blood_request_id: requestId,
        date: appointment.date,
        time: appointment.time,
        pin: appointment.pin,
        status: "Pendente"
      })
      .select("id,donor_id,hospital_id,blood_request_id,created_at,date,time,pin,status")
      .single();

    if (error) throw error;
    await this.updateRequestStatus(requestId, "Doador a Caminho");

    return mapAppointment(data as unknown as AppointmentRow);
  },

  async validatePin(pin: string, requestId?: string) {
    let query = getDatabaseClient()
      .from("appointments")
      .update({ status: "Confirmado" })
      .eq("pin", pin)
      .select("id,donor_id,hospital_id,date,time,pin,status,blood_request_id,created_at");

    if (requestId) query = query.eq("blood_request_id", requestId);
    const { data, error } = await query.single();

    if (error) throw error;
    if (data.blood_request_id) {
      await this.updateRequestStatus(data.blood_request_id, "PIN Validado");
    }

    return mapAppointment(data as unknown as AppointmentRow);
  }
};

const requestColumns = [
  "id",
  "created_by",
  "hospital_id",
  "patient_code",
  "blood_type",
  "units",
  "units_needed",
  "accepted_count",
  "remaining_slots",
  "province",
  "municipality",
  "notes",
  "urgency",
  "status",
  "created_at"
].join(",");

const legacyRequestColumns = requestColumns
  .split(",")
  .filter((column) => !["accepted_count", "remaining_slots"].includes(column))
  .join(",");

function removeUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}

async function findRequest(id: string) {
  const result = await getDatabaseClient()
    .from("blood_requests")
    .select(requestColumns)
    .eq("id", id)
    .single();

  const { data, error } = isMissingQuotaColumn(result.error)
    ? await getDatabaseClient().from("blood_requests").select(legacyRequestColumns).eq("id", id).single()
    : result;
  if (error) throw error;
  return mapRequest(data as unknown as RequestRow);
}

async function retryWithoutQuotaColumns(
  result: SelectResult,
  hospitalId?: string
) {
  if (!isMissingQuotaColumn(result.error)) return result;
  let query = getDatabaseClient()
    .from("blood_requests")
    .select(legacyRequestColumns);
  if (hospitalId) query = query.eq("hospital_id", hospitalId);
  return query.order("created_at", { ascending: false });
}

function isMissingQuotaColumn(error?: { code?: string; message?: string } | null) {
  return Boolean(error?.message?.includes("accepted_count") || error?.message?.includes("remaining_slots"));
}

async function findAppointment(donorId: string, requestId: string) {
  const { data, error } = await getDatabaseClient()
    .from("appointments")
    .select("id,donor_id,hospital_id,blood_request_id,created_at,date,time,pin,status")
    .eq("donor_id", donorId)
    .eq("blood_request_id", requestId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAppointment(data as unknown as AppointmentRow) : undefined;
}
