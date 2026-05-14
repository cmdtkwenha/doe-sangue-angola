import {
  acceptWorkflowRequest,
  completeWorkflowDonation,
  createWorkflowRequest,
  donors,
  getWorkflowSnapshot,
  listAuditLogs,
  listNotifications,
  markDonorOnWay,
  validateWorkflowPin
} from "@doe-sangue-angola/shared-services";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

test("fluxo completo liga hospital, admin, dador, PIN, recompensa, notificações e auditoria", () => {
  const donorId = "d1";
  const beforeNotifications = listNotifications(donorId).length;
  const beforeAudit = listAuditLogs().length;
  const beforePoints = donors.find((donor) => donor.id === donorId)?.points ?? 0;

  const created = createWorkflowRequest({
    bloodType: "O-",
    hospitalId: "h1",
    patientCode: "PAC-E2E",
    units: 4,
    urgency: "Critica"
  });

  assert.equal(created.ok, true);
  assert.equal(created.request.status, "Em Correspondência");
  assert.ok(created.matches.length > 0);
  assert.ok(listNotifications(donorId).length > beforeNotifications);

  const accepted = acceptWorkflowRequest(donorId, created.request.id);
  assert.equal(accepted.ok, true);
  assert.match(accepted.appointment.pin, /^\d{4}$/);
  assert.equal(getWorkflowSnapshot(created.request.id).request.status, "Agendado");

  const onWay = markDonorOnWay(created.request.id);
  assert.equal(onWay.request?.status, "Doador a Caminho");

  const validated = validateWorkflowPin(accepted.appointment.pin, created.request.id);
  assert.equal(validated.ok, true);
  assert.equal(getWorkflowSnapshot(created.request.id).request.status, "PIN Validado");

  const completed = completeWorkflowDonation(donorId, created.request.id);
  assert.equal(completed.ok, true);
  assert.equal(completed.request.status, "Concluído");
  assert.equal(completed.donor.points, beforePoints + completed.reward.earned);
  assert.ok(listNotifications(donorId).length > beforeNotifications + 1);
  assert.ok(listAuditLogs().length > beforeAudit);
});
