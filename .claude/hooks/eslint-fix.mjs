// PostToolUse (Edit|Write): eslint --fix on an edited apps/web .ts/.tsx file, so lint drift is fixed at once.
// Remaining (unfixable) problems are reported back to Claude as context; the hook itself never fails the edit.
import { execFileSync } from "node:child_process";
import path from "node:path";

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  const input = JSON.parse(raw || "{}");
  const file = String(input.tool_input?.file_path ?? input.tool_response?.filePath ?? "");
  const norm = file.replace(/\\/g, "/");
  if (!/\/apps\/web\/(src|e2e)\/.+\.tsx?$/.test(norm)) return;
  const web = norm.slice(0, norm.indexOf("/apps/web/") + "/apps/web".length);
  try {
    execFileSync(process.execPath, [path.join(web, "node_modules/eslint/bin/eslint.js"), "--fix", file], { cwd: web, stdio: "pipe" });
  } catch (err) {
    const out = String(err.stdout ?? err.message ?? "").trim().slice(0, 1500);
    if (out) {
      process.stdout.write(
        JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: `eslint after edit:\n${out}` } }),
      );
    }
  }
});
