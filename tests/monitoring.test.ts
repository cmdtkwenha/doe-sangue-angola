import {
  clearLoggerRecords,
  clearMonitoringRecords,
  createBloodRequest,
  listErrorLogs,
  listLoggerRecords,
  listMonitoringRecords,
  monitoringService,
  performanceTracker,
  trackFailedAction
} from "@doe-sangue-angola/shared-services";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

test("monitoringService regista atividade e logger central", () => {
  clearMonitoringRecords();
  clearLoggerRecords();

  monitoringService({
    actor: "admin@sangueangola.ao",
    message: "Login de teste monitorizado",
    status: "ok",
    type: "LOGIN"
  });

  assert.equal(listMonitoringRecords()[0].type, "LOGIN");
  assert.equal(listLoggerRecords()[0].level, "info");
});

test("criação de pedido gera evento de monitorização", () => {
  clearMonitoringRecords();

  createBloodRequest({
    bloodType: "O-",
    hospitalId: "h1",
    patientCode: "PAC-SEG",
    units: 2,
    urgency: "Alta"
  });

  assert.equal(listMonitoringRecords()[0].type, "REQUEST_CREATED");
});

test("ações falhadas aparecem na tabela de erros", () => {
  clearMonitoringRecords();

  trackFailedAction("PIN inválido em teste", { pin: "oculto" });

  assert.equal(listErrorLogs()[0].status, "error");
  assert.equal(listErrorLogs()[0].type, "FAILED_ACTION");
});

test("performanceTracker cria métrica de performance", () => {
  clearMonitoringRecords();

  performanceTracker({ durationMs: 75, label: "Render teste", route: "/admin" });

  assert.equal(listMonitoringRecords()[0].type, "PERFORMANCE");
  assert.equal(listMonitoringRecords()[0].status, "ok");
});
