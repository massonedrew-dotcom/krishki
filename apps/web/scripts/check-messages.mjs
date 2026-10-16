import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compareMessages } from "./compare-messages.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");
const catalogs = {};
for (const locale of ["ru", "uz", "en"]) {
  catalogs[locale] = JSON.parse(readFileSync(join(dir, `${locale}.json`), "utf8"));
}
const problems = compareMessages(catalogs);
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("messages: ru/uz/en key sets match");
