import { DONOR_ELIGIBILITY_STATUS } from "@doe-sangue-angola/shared-types";

export function donorBlocked(donor: {
  available?: boolean;
  eligibility_status?: string | null;
  next_eligible_donation_date?: string | null;
}) {
  if (donor.eligibility_status && donor.eligibility_status !== DONOR_ELIGIBILITY_STATUS.ELEGIVEL) return true;
  if (donor.available === false && !donor.next_eligible_donation_date) return true;
  if (!donor.next_eligible_donation_date) return false;
  return new Date(donor.next_eligible_donation_date).getTime() > Date.now();
}
