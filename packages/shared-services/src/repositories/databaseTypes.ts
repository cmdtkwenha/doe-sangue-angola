import type {
  Appointment,
  BloodRequest,
  BloodType,
  Donor,
  Hospital,
  RequestStatus,
  Urgency
} from "@doe-sangue-angola/shared-types";
import type { MockNotification } from "../notificationService";

export type DonorRow = {
  id: string;
  blood_type: BloodType;
  province: string;
  municipality: string;
  available: boolean;
  last_donation: string;
  points: number;
  preferred_hospital_id: string | null;
  user_id?: string | null;
  users?: { name?: string | null } | null;
};

export type HospitalRow = {
  id: string;
  name: string;
  province: string;
  municipality: string;
  verified: boolean;
  capacity: number;
  contact: string | null;
};

export type RequestRow = {
  id: string;
  hospital_id: string;
  patient_code: string;
  blood_type: BloodType;
  units: number;
  urgency: Urgency;
  status: RequestStatus;
  created_at: string;
};

export type AppointmentRow = {
  id: string;
  donor_id: string;
  hospital_id: string;
  date: string;
  time: string;
  pin: string;
  status: Appointment["status"];
};

export function mapDonor(row: DonorRow): Donor {
  return {
    id: row.id,
    name: row.users?.name ?? "Dador verificado",
    bloodType: row.blood_type,
    province: row.province,
    municipality: row.municipality,
    available: row.available,
    lastDonation: row.last_donation,
    points: row.points,
    preferredHospitalId: row.preferred_hospital_id ?? undefined
  };
}

export function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    name: row.name,
    province: row.province,
    municipality: row.municipality,
    verified: row.verified,
    capacity: row.capacity,
    contact: row.contact ?? ""
  };
}

export function mapRequest(row: RequestRow): BloodRequest {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    patientCode: row.patient_code,
    bloodType: row.blood_type,
    units: row.units,
    urgency: row.urgency,
    status: row.status,
    createdAt: row.created_at
  };
}

export function mapNotification(row: {
  id: string;
  title: string;
  body: string;
  type: MockNotification["type"];
  read: boolean;
  created_at: string;
  user_id: string | null;
}): MockNotification {
  return {
    id: row.id,
    donorId: row.user_id ?? "",
    title: row.title,
    body: row.body,
    type: row.type,
    read: row.read,
    channel: "in-app",
    createdAt: new Date(row.created_at).toLocaleString("pt-PT")
  };
}
