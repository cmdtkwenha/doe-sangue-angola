import {
  getAuthMode,
  getRepositories,
  getDataProviderStatus,
  getPushMode,
  pilotConfig
} from "@doe-sangue-angola/shared-services";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

test("registry usa repositórios mock por defeito", () => {
  const repositories = getRepositories();
  const hospitals = repositories.hospital.listHospitals();

  assert.ok(Array.isArray(hospitals));
  assert.ok(hospitals.length >= 1);
});

test("data provider continua seguro em modo mock", () => {
  const status = getDataProviderStatus();

  assert.equal(status.mode, "mock");
  assert.equal(status.ready, true);
});

test("configuração piloto não ativa produção real por acidente", () => {
  assert.equal(pilotConfig.notifications, true);
  assert.equal(pilotConfig.provinces.includes("Luanda"), true);
});

test("auth e push ficam em modo demo/mock por defeito", () => {
  assert.equal(getAuthMode(), "demo");
  assert.equal(getPushMode(), "mock");
});
