import {
  approveVerification,
  createInAppNotification,
  getRepositories,
  getMonitoringSummary,
  getNationalSummary,
  listHospitalVerificationQueue,
  listNotifications,
  monitoringService
} from "@doe-sangue-angola/shared-services";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

test("founder overview usa dados nacionais simples", () => {
  const summary = getNationalSummary();

  assert.ok(summary.hospitals >= 1);
  assert.ok(summary.availableDonors >= 1);
});

test("atalho de aprovação de hospital devolve verificado", () => {
  const pending = listHospitalVerificationQueue()
    .find((item) => item.status !== "Verificado");

  assert.ok(pending);
  assert.equal(approveVerification(pending.id).status, "Verificado");
});

test("broadcast de teste cria notificação in-app segura", () => {
  const donor = getRepositories().donor.listDonors()[0];
  assert.ok(donor);

  const before = listNotifications(donor.id).length;

  createInAppNotification(donor.id, "Mensagem da plataforma", "Teste seguro", "urgent");

  assert.equal(listNotifications(donor.id).length, before + 1);
});

test("simulação de encerramento fica só em monitorização", () => {
  const before = getMonitoringSummary().events;

  monitoringService({
    message: "Simulação founder",
    status: "warning",
    type: "USER_ACTION"
  });

  assert.equal(getMonitoringSummary().events, before + 1);
});
