import {
  auditAgent,
  matchingAgent,
  rewardAgent,
  schedulingAgent
} from "@doe-sangue-angola/agents";
import { donors, hospitals, requests } from "./mockStore";
import { acceptWorkflowRequest, completeWorkflowDonation, createWorkflowRequest, markDonorOnWay, validateWorkflowPin } from "./requestWorkflowService";
import { publishRealtimeEvent } from "./realtimeService";

export type DemoStep = {
  id: string;
  title: string;
  actor: string;
  detail: string;
  status: "Pronto" | "Ao vivo" | "Concluído";
};

export const demoPasswords = ["Demo@2026", "demo@2026"] as const;

export const demoAccounts = [
  {
    label: "Admin",
    role: "admin",
    email: "admin@sangueangola.ao",
    password: "Demo@2026",
    route: "/admin"
  },
  {
    label: "Hospital",
    role: "hospital",
    email: "hospital@sangueangola.ao",
    password: "Demo@2026",
    route: "/hospital"
  },
  {
    label: "Dador",
    role: "donor",
    email: "donor@sangueangola.ao",
    password: "Demo@2026",
    route: "/mobile"
  }
] as const;

export function getInvestorDemoScenario() {
  const hospital = hospitals[0];
  const request = requests[0];
  const matches = matchingAgent(request, donors);
  const donor = matches[0].donor;
  const appointment = schedulingAgent(donor, hospital);
  const reward = rewardAgent(donor, true);
  const audit = auditAgent("auditAgent", `Registou fluxo completo ${request.id}`);

  return {
    request,
    donor,
    pin: appointment.pin,
    reward,
    audit,
    steps: buildSteps(hospital.name, donor.name, appointment.pin, reward.currentPoints)
  };
}

export function generateInvestorDemoScenario() {
  const created = createWorkflowRequest({
    bloodType: "O-",
    hospitalId: "h1",
    patientCode: `DEMO-${Date.now().toString().slice(-4)}`,
    units: 4,
    urgency: "Critica"
  });

  if (!("request" in created)) return created;

  publishRealtimeEvent("REQUEST_CREATED", { request: created.request });
  publishRealtimeEvent("DONOR_MATCHED", {
    donors: created.matches.map((match) => match.donor),
    requestId: created.request.id
  });

  return {
    ...created,
    message: "Pedido demo O- criado e sincronizado nos painéis."
  };
}

export function resetInvestorDemoScenario() {
  // Later this can clear demo rows in Supabase. For now the mock scenario is deterministic.
  return {
    ok: true,
    message: "Cenário demo reposto com dados mockados."
  };
}

export function runInvestorDemoStep(stepIndex: number) {
  const scenario = getInvestorDemoScenario();
  const requestId = scenario.request.id;
  const donorId = scenario.donor.id;

  if (stepIndex === 0) generateInvestorDemoScenario();
  if (stepIndex === 2) publishRealtimeEvent("REQUEST_CREATED", { request: scenario.request });
  if (stepIndex === 3) publishRealtimeEvent("DONOR_MATCHED", { donors: [scenario.donor], requestId });
  if (stepIndex === 4) publishRealtimeEvent("NOTIFICATION_SENT", {
    donorId,
    notification: {
      id: `demo-push-${Date.now()}`,
      donorId,
      title: "Pedido urgente O-",
      body: "Pedido urgente O- perto de si.",
      createdAt: "Agora",
      read: false,
      type: "urgent",
      channel: "push"
    }
  });
  if (stepIndex === 5) acceptWorkflowRequest(donorId, requestId);
  if (stepIndex === 6) markDonorOnWay(requestId);
  if (stepIndex === 7) validateWorkflowPin(scenario.pin, requestId);
  if (stepIndex === 8) completeWorkflowDonation(donorId, requestId);

  return scenario.steps[Math.min(stepIndex, scenario.steps.length - 1)];
}

function buildSteps(
  hospitalName: string,
  donorName: string,
  pin: string,
  points: number
): DemoStep[] {
  return [
    ["1", "Admin entra", "Admin", "Acesso ao Centro de Operações Nacional."],
    ["2", "Dashboard nacional", "Admin", "KPIs, mapa de escassez e ticker ficam visíveis."],
    ["3", "Pedido O- urgente", "Hospital", `${hospitalName} cria pedido crítico.`],
    ["4", "Ticker atualiza", "Admin", "Pedido entra na fila em tempo real."],
    ["5", "Matching inteligente", "matchingAgent", `${donorName} é recomendado como compatível.`],
    ["6", "Push no telemóvel", "notificationService", "Dador recebe pedido urgente perto de si."],
    ["7", "Dador aceita", "Mobile", `${donorName} aceita o pedido.`],
    ["8", "PIN gerado", "schedulingAgent", `PIN de 4 dígitos criado: ${pin}.`],
    ["9", "Dador a caminho", "Hospital", "Hospital vê ETA, PIN e estado de chegada."],
    ["10", "PIN validado", "Hospital", "Receção confirma identidade no portal."],
    ["11", "Pedido concluído", "Admin", "Estado passa para Concluído no painel nacional."],
    ["12", "Pontos e progresso", "rewardAgent", `Dador fica com ${points} pontos.`],
    ["13", "Partilha social", "Mobile", "Dador partilha a doação nas redes sociais."]
  ].map(([id, title, actor, detail], index) => ({
    id,
    title,
    actor,
    detail,
    status: index < 2 ? "Pronto" : index < 10 ? "Ao vivo" : "Concluído"
  }));
}
