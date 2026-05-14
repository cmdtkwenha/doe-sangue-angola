import {
  canAccessArea,
  canAccessPath,
  canReadAdminData,
  canReadDonorData,
  canReadHospitalData,
  getAllowedRolesForPath,
  maskPatientCode,
  permissionMatrix
} from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

const admin = { role: "admin" as UserRole, userId: "u-admin" };
const hospitalA = { role: "hospital" as UserRole, userId: "u-h1", hospitalId: "h1" };
const hospitalB = { role: "hospital" as UserRole, userId: "u-h2", hospitalId: "h2" };
const donor = { role: "donor" as UserRole, userId: "u-d1", donorId: "d1" };

test("rotas principais exigem a função correta", () => {
  assert.deepEqual(getAllowedRolesForPath("/admin/requests"), ["admin"]);
  assert.deepEqual(getAllowedRolesForPath("/hospital/settings"), ["hospital"]);
  assert.deepEqual(getAllowedRolesForPath("/mobile/settings"), ["donor"]);
});

test("admin não permite acesso hospitalar ou dador por engano", () => {
  assert.equal(canAccessPath("admin", "/admin"), true);
  assert.equal(canAccessPath("hospital", "/admin"), false);
  assert.equal(canAccessPath("donor", "/admin/audit"), false);
});

test("hospital não consegue ler dados de outro hospital", () => {
  assert.equal(canReadHospitalData(hospitalA, "h1"), true);
  assert.equal(canReadHospitalData(hospitalA, "h2"), false);
  assert.equal(canReadHospitalData(hospitalB, "h1"), false);
});

test("dador só consegue ler o próprio perfil de dador", () => {
  assert.equal(canReadDonorData(donor, "d1"), true);
  assert.equal(canReadDonorData(donor, "d2"), false);
  assert.equal(canReadAdminData(donor), false);
});

test("admin pode auditar dados nacionais e hospitalares", () => {
  assert.equal(canReadAdminData(admin), true);
  assert.equal(canReadHospitalData(admin, "h2"), true);
  assert.equal(canReadDonorData(admin, "d2"), true);
});

test("matriz de permissões bloqueia auditoria para hospital e dador", () => {
  assert.deepEqual(permissionMatrix.auditLogs, ["admin"]);
  assert.equal(canAccessArea("hospital", "auditLogs"), false);
  assert.equal(canAccessArea("donor", "auditLogs"), false);
});

test("código de paciente pode ser mascarado em superfícies não clínicas", () => {
  assert.equal(maskPatientCode("PAC-4821"), "***-4821");
  assert.equal(maskPatientCode("123"), "****");
});
