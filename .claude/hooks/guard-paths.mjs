// PreToolUse (Edit|Write): refuse writes to secrets (.env*, except .env.example) and to Next build dirs
// (apps/web/.next, .next-review): a stale or half-written build there broke the review server on 30 Oct.
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  const input = JSON.parse(raw || "{}");
  const file = String(input.tool_input?.file_path ?? "").replace(/\\/g, "/");
  const name = file.split("/").pop() ?? "";
  const isEnv = /^\.env(\..+)?$/.test(name) && name !== ".env.example";
  const isBuild = /\/apps\/web\/\.next[^/]*\//.test(file);
  if (!isEnv && !isBuild) return;
  const reason = isEnv
    ? `${name}: secrets live only in local .env files; edit .env.example (names only) instead.`
    : "apps/web/.next*: build output, written by next build only.";
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason },
    }),
  );
});
