import { eligibilityAgent } from "@doe-sangue-angola/agents";

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

export const milestones = [
  ["Primeira Doação", "Parabéns pela sua primeira doação", true],
  ["Salvador de Vidas", "Faça 3 doações", true],
  ["Herói da Comunidade", "Indique 3 amigos", false],
  ["Platina Nacional", "Alcance 2.000 pontos", false]
] as const;
