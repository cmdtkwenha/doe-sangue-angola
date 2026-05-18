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

export type UserRow = {
  id: string;
  auth_user_id: string | null;
  role: "admin" | "hospital" | "donor";
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

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
  blood_request_id?: string | null;
  date: string;
  time: string;
  pin: string;
  status: Appointment["status"];
};

export type RewardRow = {
  id: string;
  donor_id: string;
  points: number;
  reason: string;
  tier: string | null;
  created_at: string;
};

export function mapUser(row: UserRow) {
  return {
    id: row.id,
    authUserId: row.auth_user_id ?? undefined,
    role: row.role,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    createdAt: row.created_at
  };
}

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

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    donorId: row.donor_id,
    hospitalId: row.hospital_id,
    date: row.date,
    time: row.time,
    pin: row.pin,
    status: row.status
  };
}

export function mapReward(row: RewardRow) {
  return {
    id: row.id,
    donorId: row.donor_id,
    points: row.points,
    reason: row.reason,
    tier: row.tier ?? "",
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
