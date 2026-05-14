import { findCompatibleDonors, listRequestsForHospital } from "./requestService";
import { hospitals } from "./mockStore";
import { listAppointmentsForHospital, validatePin } from "./appointmentService";
import { publishRealtimeEvent } from "./realtimeService";

// TODO(production): enforce hospital ownership through HospitalRepositoryInterface and RLS.
export function getHospitalById(hospitalId: string) {
  return hospitals.find((item) => item.id === hospitalId);
}

export function verifyHospital(hospitalId: string) {
  const hospital = getHospitalById(hospitalId);
  if (hospital) {
    hospital.verified = true;
    publishRealtimeEvent("HOSPITAL_VERIFIED", { hospital });
  }

  return hospital;
}

export function getHospitalDashboard(hospitalId: string) {
  const requests = listRequestsForHospital(hospitalId);
  const primary = requests[0];

  // Mock flow step 7: hospital reads incoming donor/PIN state from appointments.
  return {
    hospital: getHospitalById(hospitalId),
    requests,
    appointments: listAppointmentsForHospital(hospitalId),
    incomingDonors: primary ? findCompatibleDonors(primary.id).slice(0, 4) : []
  };
}

export function confirmDonorArrival(pin: string) {
  return validatePin(pin);
}
