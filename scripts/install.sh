#!/usr/bin/env bash
# Run from the project root: bash scripts/install.sh
set -u
mkdir -p vendor .claude/skills

clone() { # repo dir
  if [ -d "vendor/$2" ]; then echo "skip vendor/$2 (exists)"; return; fi
  git clone --depth 1 "https://github.com/$1.git" "vendor/$2" || echo "!! failed: $1 — check the repo name"
}

echo "== 3D / shader repos (reference + source) =="
clone tsogjavklann/awwwards-3d awwwards-3d
clone pmndrs/react-three-fiber react-three-fiber
clone pmndrs/drei drei
clone ruucm/shadergradient shadergradient
clone dashersw/liquid-glass-js liquid-glass-js
clone paper-design/liquid-logo liquid-logo
clone paper-design/shaders paper-shaders
clone ahujasid/blender-mcp blender-mcp

echo "== Design skills =="
clone pbakaus/impeccable impeccable
clone nextlevelbuilder/ui-ux-pro-max-skill ui-ux-pro-max-skill
clone Leonxlnx/taste-skill taste-skill
clone VoltAgent/awesome-design-md awesome-design-md

# copy skill folders into .claude/skills (paths differ per repo; copies every SKILL.md parent dir)
for d in awwwards-3d impeccable ui-ux-pro-max-skill taste-skill; do
  [ -d "vendor/$d" ] || continue
  find "vendor/$d" -name SKILL.md -not -path "*/node_modules/*" | while read -r f; do
    src=$(dirname "$f"); name=$(basename "$src")
    [ "$src" = "vendor/$d" ] && name="$d"
    [ -d ".claude/skills/$name" ] || cp -r "$src" ".claude/skills/$name"
  done
done
echo "skills now in .claude/skills:"; ls .claude/skills

echo "== npm packages (apps/web) =="
if [ -f apps/web/package.json ]; then
  (cd apps/web && pnpm add three @react-three/fiber @react-three/drei gsap lenis \
     @shadergradient/react @paper-design/shaders-react liquid-glass-js \
     && pnpm add -D @types/three)
else
  echo "apps/web not scaffolded yet — run prompt 01 first, then re-run this script"
fi

echo "== Blender MCP for Claude Code =="
if command -v uvx >/dev/null 2>&1; then
  claude mcp add blender uvx blender-mcp || true
else
  echo "install uv first: https://docs.astral.sh/uv/  then: claude mcp add blender uvx blender-mcp"
fi
echo "In Blender: Edit > Preferences > Add-ons > Install > vendor/blender-mcp/addon.py, enable, N-panel > BlenderMCP > Connect to Claude"

echo "== Playwright =="
command -v npx >/dev/null && npx -y playwright install chromium || true

echo "Done. Read every vendor/*/LICENSE and record it in LICENSES.md before using code."
