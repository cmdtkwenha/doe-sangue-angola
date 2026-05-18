const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = process.cwd();

const webRoutes = [
  "apps/web/app/auth/page.tsx",
  "apps/web/app/admin/page.tsx",
  "apps/web/app/hospital/page.tsx",
  "apps/web/app/hospital/new-request/page.tsx",
  "apps/web/app/hospital/requests/page.tsx",
  "apps/web/app/mobile/page.tsx",
  "apps/web/app/admin/audit/page.tsx",
  "apps/web/app/admin/requests/page.tsx",
  "apps/web/app/api/appointments/accept/route.ts",
  "apps/web/app/api/appointments/complete/route.ts",
  "apps/web/app/api/appointments/validate-pin/route.ts",
  "apps/web/app/api/blood-requests/route.ts",
  "apps/web/app/api/health/route.ts",
  "apps/web/app/api/notifications/route.ts",
  "apps/web/app/api/push/register/route.ts"
];

const mobileFiles = [
  "apps/mobile/App.tsx",
  "apps/mobile/app/App.tsx",
  "apps/mobile/app.json",
  "apps/mobile/eas.json"
];

function exists(file) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} em falta`);
}

for (const route of webRoutes) exists(route);
for (const file of mobileFiles) exists(file);

const appJson = JSON.parse(fs.readFileSync(path.join(root, "apps/mobile/app.json"), "utf8"));
assert.equal(appJson.expo.slug, "doe-sangue-angola");
assert.equal(appJson.expo.android.package, "ao.doesangue.app");

console.log("✓ smoke routes web/mobile verificados");
