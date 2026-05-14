const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = function loadTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    },
    fileName: filename
  });

  module._compile(output.outputText, filename);
};

global.test = (name, fn) => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✕ ${name}`);
    throw error;
  }
};

global.assert = assert;

const testDir = path.join(process.cwd(), "tests");
for (const file of fs.readdirSync(testDir).filter((item) => item.endsWith(".test.ts"))) {
  require(path.join(testDir, file));
}
