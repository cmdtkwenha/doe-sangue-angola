import { demoAccounts, getRedirectForRole } from "@doe-sangue-angola/shared-services";

declare const assert: typeof import("node:assert/strict");
declare function test(name: string, fn: () => void): void;

const expectedEmails = [
  "admin@sangueangola.ao",
  "hospital@sangueangola.ao",
  "donor@sangueangola.ao"
];

test("contas demo oficiais existem para apresentações", () => {
  const emails = demoAccounts.map((account) => account.email);

  assert.deepEqual(emails, expectedEmails);
});

test("contas demo usam senha simples de apresentação", () => {
  demoAccounts.forEach((account) => {
    assert.equal(account.password, "Demo@2026");
  });
});

test("contas demo redirecionam para o portal correto", () => {
  demoAccounts.forEach((account) => {
    assert.equal(account.route, getRedirectForRole(account.role));
  });
});
