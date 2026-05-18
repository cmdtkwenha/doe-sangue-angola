import {
  demoAccounts,
  demoPasswords,
  getAuthMode,
  getRedirectForRole,
  isDemoAuthAllowed
} from "@doe-sangue-angola/shared-services";

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
    assert.equal(account.password, "demo@2026");
  });
  assert.deepEqual([...demoPasswords], ["demo@2026", "Demo@2026"]);
});

test("contas demo redirecionam para o portal correto", () => {
  demoAccounts.forEach((account) => {
    assert.equal(account.route, getRedirectForRole(account.role));
  });
});

test("AUTH_MODE=mock ativa login demo em produção", () => {
  const previousAuth = process.env.NEXT_PUBLIC_AUTH_MODE;
  const previousEnv = process.env.NEXT_PUBLIC_APP_ENV;

  process.env.NEXT_PUBLIC_AUTH_MODE = "mock";
  process.env.NEXT_PUBLIC_APP_ENV = "production";

  assert.equal(getAuthMode(), "demo");
  assert.equal(isDemoAuthAllowed(), true);

  if (previousAuth) process.env.NEXT_PUBLIC_AUTH_MODE = previousAuth;
  else delete process.env.NEXT_PUBLIC_AUTH_MODE;
  if (previousEnv) process.env.NEXT_PUBLIC_APP_ENV = previousEnv;
  else delete process.env.NEXT_PUBLIC_APP_ENV;
});
