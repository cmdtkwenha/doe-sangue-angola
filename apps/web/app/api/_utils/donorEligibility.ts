export function donorBlocked(donor: {
  available?: boolean;
  next_eligible_donation_date?: string | null;
}) {
  if (donor.available === false && !donor.next_eligible_donation_date) return true;
  if (!donor.next_eligible_donation_date) return false;
  return new Date(donor.next_eligible_donation_date).getTime() > Date.now();
}
