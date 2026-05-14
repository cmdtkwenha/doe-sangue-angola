import {
  eligibilityAgent,
  referralAgent,
  rewardAgent
} from "@doe-sangue-angola/agents";
import { listDonors } from "@doe-sangue-angola/shared-services";

const donor = listDonors()[0];

export const eligibilityQuestions = [
  ["feelingSick", "Como você está se sentindo hoje?", "Estou bem, saudável", true],
  ["weightOk", "Seu peso está acima de 50 kg?", "Sim, está adequado", true],
  ["recentTravel", "Viajou recentemente?", "Não viajei nos últimos 30 dias", false],
  ["medication", "Está usando medicação?", "Não estou usando medicação", false],
  ["lastDonationOk", "Já passou o intervalo mínimo?", "Sim, posso doar", true]
] as const;

export const eligibility = eligibilityAgent({
  feelingSick: false,
  weightOk: true,
  recentTravel: false,
  medication: false,
  lastDonationOk: true
});

export const rewards = rewardAgent(donor, true);

export const milestones = [
  ["Primeira Doação", "Parabéns pela sua primeira doação", true],
  ["Salvador de Vidas", "Faça 3 doações", true],
  ["Herói da Comunidade", "Indique 3 amigos", false],
  ["Platina Nacional", "Alcance 2.000 pontos", false]
] as const;

export const referrals = referralAgent([
  { name: "João Paulo", status: "Concluiu cadastro" },
  { name: "Ana Costa", status: "Concluiu cadastro" },
  { name: "Carlos Manuel", status: "Pendente" }
]);

export const provinceLeaderboard = [
  ["1", "Maria João Santos", "Luanda", "1.250 pts"],
  ["2", "Adão Domingos", "Luanda", "1.140 pts"],
  ["3", "Celina Mateus", "Huambo", "980 pts"],
  ["4", "Lourenço Miguel", "Luanda", "920 pts"]
];
