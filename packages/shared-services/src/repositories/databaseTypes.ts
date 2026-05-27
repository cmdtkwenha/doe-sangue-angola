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
  linked_entity_id?: string | null;
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
  birth_date?: string | null;
  email?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  eligibility_status?: string | null;
  full_name?: string | null;
  gender?: string | null;
  last_donation: string | null;
  last_donation_date?: string | null;
  phone?: string | null;
  points: number;
  preferred_hospital_id: string | null;
  total_donations?: number | null;
  user_id?: string | null;
  users?: { name?: string | null; phone?: string | null } | null;
};

export type HospitalRow = {
  id: string;
  address?: string | null;
  email?: string | null;
  facility_type?: string | null;
  license_number?: string | null;
  name: string;
  phone?: string | null;
  province: string;
  municipality: string;
  type?: string | null;
  verified: boolean;
  capacity: number;
  contact: string | null;
};

export type RequestRow = {
  id: string;
  created_by?: string | null;
  hospital_id: string;
  patient_code?: string | null;
  blood_type: BloodType;
  units?: number | null;
  units_needed?: number | null;
  urgency: Urgency;
  province?: string | null;
  municipality?: string | null;
  notes?: string | null;
  status: RequestStatus;
  created_at: string;
  hospitals?: {
    municipality?: string | null;
    name?: string | null;
    province?: string | null;
  } | null;
};

export type AppointmentRow = {
  id: string;
  donor_id: string;
  hospital_id: string;
  blood_request_id?: string | null;
  created_at?: string | null;
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
    linkedEntityId: row.linked_entity_id ?? undefined,
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
    userId: row.user_id ?? undefined,
    name: row.full_name ?? row.users?.name ?? "Dador verificado",
    bloodType: row.blood_type,
    province: row.province,
    municipality: row.municipality,
    available: row.available,
    birthDate: row.birth_date ?? undefined,
    email: row.email ?? undefined,
    emergencyContactName: row.emergency_contact_name ?? undefined,
    emergencyContactPhone: row.emergency_contact_phone ?? undefined,
    eligibilityStatus: row.eligibility_status ?? "Pendente",
    gender: row.gender ?? undefined,
    lastDonation: row.last_donation_date ?? row.last_donation ?? "",
    phone: row.phone ?? row.users?.phone ?? undefined,
    points: row.points,
    totalDonations: row.total_donations ?? 0,
    preferredHospitalId: row.preferred_hospital_id ?? undefined
  };
}

export function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    address: row.address ?? undefined,
    email: row.email ?? undefined,
    licenseNumber: row.license_number ?? undefined,
    name: row.name,
    province: row.province,
    municipality: row.municipality,
    verified: row.verified,
    capacity: row.capacity,
    contact: row.contact ?? row.phone ?? "",
    type: row.facility_type ?? row.type ?? undefined
  };
}

export function mapRequest(row: RequestRow): BloodRequest {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    patientCode: row.patient_code ?? row.id.slice(0, 8),
    bloodType: row.blood_type,
    units: row.units_needed ?? row.units ?? 1,
    urgency: row.urgency,
    province: row.province ?? undefined,
    municipality: row.municipality ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    hospitalName: row.hospitals?.name ?? undefined,
    hospitalLocation: formatHospitalLocation(row)
  };
}

function formatHospitalLocation(row: RequestRow) {
  const municipality = row.hospitals?.municipality ?? row.municipality;
  const province = row.hospitals?.province ?? row.province;
  return [municipality, province].filter(Boolean).join(", ") || undefined;
}

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    donorId: row.donor_id,
    hospitalId: row.hospital_id,
    bloodRequestId: row.blood_request_id ?? undefined,
    createdAt: row.created_at ?? undefined,
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
