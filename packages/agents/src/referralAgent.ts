export type Referral = {
  name: string;
  status: "Concluiu cadastro" | "Pendente";
};

export function referralAgent(referrals: Referral[]) {
  const completed = referrals.filter((item) => item.status === "Concluiu cadastro");
  const target = 3;

  return {
    code: "MARIA125",
    completed: completed.length,
    target,
    rewardPoints: completed.length >= target ? 250 : 0,
    remaining: Math.max(target - completed.length, 0),
    referrals
  };
}
