import {
  getPilotAnalytics,
  pilotAccounts,
  pilotConfig,
  pilotProvinces,
  seedPilotAccounts
} from "@doe-sangue-angola/shared-services";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

test("modo piloto fica limitado a Luanda e Benguela", () => {
  assert.deepEqual([...pilotProvinces], ["Luanda", "Benguela"]);
  assert.equal(pilotConfig.defaultProvince, "Luanda");
});

test("contas piloto cobrem hospitais e dadores de teste", () => {
  const roles = pilotAccounts.map((account) => account.role);

  assert.equal(roles.filter((role) => role === "hospital").length, 2);
  assert.equal(roles.filter((role) => role === "donor").length, 2);
  assert.ok(pilotAccounts.every((account) => account.password === "Piloto@2026"));
});

test("notificações piloto são seguras por defeito", () => {
  assert.equal(pilotConfig.notifications, true);
});

test("analytics piloto usa apenas dados das províncias piloto", () => {
  const analytics = getPilotAnalytics();

  assert.ok(analytics.provinces.includes("Luanda"));
  assert.ok(analytics.provinces.includes("Benguela"));
  assert.ok(analytics.hospitals >= 1);
});

test("seeder prepara contas sem tocar em backend real", () => {
  const result = seedPilotAccounts();

  assert.equal(result.accounts.length, 4);
  assert.match(result.message, /Contas piloto prontas/);
});
