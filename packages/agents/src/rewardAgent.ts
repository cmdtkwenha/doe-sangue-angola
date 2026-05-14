import type { Donor } from "@doe-sangue-angola/shared-types";

const tiers = [
  { name: "Bronze", points: 0 },
  { name: "Prata", points: 500 },
  { name: "Ouro", points: 1000 },
  { name: "Platina", points: 2000 }
];

export function rewardAgent(donor: Donor, completedDonation: boolean) {
  const earned = completedDonation ? 120 : 0;
  const currentPoints = donor.points + earned;
  const tier = tiers.reduce(
    (best, item) => (currentPoints >= item.points ? item : best),
    tiers[0]
  );
  const next = tiers.find((item) => item.points > currentPoints);

  return {
    donorId: donor.id,
    currentPoints,
    earned,
    tier: tier.name,
    tiers,
    nextTier: next?.name ?? "Nível máximo",
    pointsToNext: next ? next.points - currentPoints : 0
  };
}
