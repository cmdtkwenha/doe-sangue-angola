import type {
  BloodRequest,
  BloodType,
  Donor,
  MatchResult
} from "@doe-sangue-angola/shared-types";

const donationCompatibility: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"]
};

export function canDonorDonateToRequest(
  donorBloodType: BloodType | null | undefined,
  requestBloodType: BloodType | null | undefined
) {
  if (!donorBloodType || !requestBloodType) return false;
  return donationCompatibility[donorBloodType]?.includes(requestBloodType) ?? false;
}

export function matchingAgent(request: BloodRequest | undefined, donors: Donor[]): MatchResult[] {
  if (!request?.id) return [];

  return donors
    .map((donor) => scoreDonor(request, donor))
    .sort((a, b) => b.score - a.score);
}

function scoreDonor(request: BloodRequest, donor: Donor): MatchResult {
  const reasons: string[] = [];
  let score = 0;
  const critical = request.urgency === "Critica" || request.urgency === "Desastre";

  if (canDonorDonateToRequest(donor.bloodType, request.bloodType)) {
    score += 55;
    reasons.push("Tipo sanguineo compativel");
  }

  if (donor.available) {
    score += 25;
    reasons.push("Disponivel para contacto");
  }

  if (request.municipality && donor.municipality === request.municipality) {
    score += 18;
    reasons.push("Mesmo municipio");
  } else if (request.province && donor.province === request.province) {
    score += 10;
    reasons.push("Mesma provincia");
  }

  if (isPastCooldown(donor) || critical) {
    score += critical ? 8 : 12;
    reasons.push(critical ? "Pedido critico reduz peso do intervalo" : "Intervalo de doacao cumprido");
  } else {
    score -= 25;
    reasons.push("Ainda em intervalo de seguranca");
  }

  score += Math.min(10, Math.max(0, donor.reliabilityScore ?? 7));
  if ((donor.responseSpeedMinutes ?? 60) <= 30) {
    score += 8;
    reasons.push("Historico de resposta rapida");
  }

  if (critical) {
    score += 10;
    reasons.push("Prioridade nacional critica");
  }

  if (donor.preferredHospitalId === request.hospitalId) {
    score += 10;
    reasons.push("Preferencia pelo hospital");
  }

  return {
    donor,
    score,
    recommendation: getRecommendation(score),
    reasons
  };
}

function isPastCooldown(donor: Donor) {
  if (donor.nextEligibleDonationDate) {
    return new Date(donor.nextEligibleDonationDate).getTime() <= Date.now();
  }
  if (!donor.lastDonation) return true;
  const days = donor.gender === "Feminino" ? 120 : 90;
  const next = new Date(donor.lastDonation);
  next.setDate(next.getDate() + days);
  return next.getTime() <= Date.now();
}

function getRecommendation(score: number): MatchResult["recommendation"] {
  if (score >= 80) return "Notificar";
  if (score >= 55) return "Reserva";
  return "Aguardar";
}
