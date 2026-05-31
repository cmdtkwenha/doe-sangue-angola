import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";

export type AcceptedDonor = {
  acceptedAt?: string;
  age?: number;
  bloodRequestId?: string;
  completedDonations?: number;
  createdAt?: string;
  donorBloodType: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  eta: string;
  gender?: string;
  hospitalId?: string;
  hospitalName?: string;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  pin: string;
  pinValidationStatus?: string;
  reliabilityScore?: number;
  responseId: string;
  requestBloodType: string;
  requestStatus: string;
  status: string;
  totalDonations?: number;
  verificationStatus?: string;
};

export type WorkflowStatus = Exclude<DonorResponseStatus, "accepted">;
export type PendingAction = { row: AcceptedDonor; status: WorkflowStatus } | null;
