# Run from the project root in PowerShell: powershell -ExecutionPolicy Bypass -File scripts\install.ps1
New-Item -ItemType Directory -Force vendor, .claude\skills | Out-Null

function Clone($repo, $dir) {
  if (Test-Path "vendor\$dir") { Write-Host "skip vendor\$dir"; return }
  git clone --depth 1 "https://github.com/$repo.git" "vendor\$dir"
  if ($LASTEXITCODE -ne 0) { Write-Host "!! failed: $repo - check the repo name" }
}

Clone tsogjavklann/awwwards-3d awwwards-3d
Clone pmndrs/react-three-fiber react-three-fiber
Clone pmndrs/drei drei
Clone ruucm/shadergradient shadergradient
Clone dashersw/liquid-glass-js liquid-glass-js
Clone paper-design/liquid-logo liquid-logo
Clone paper-design/shaders paper-shaders
Clone ahujasid/blender-mcp blender-mcp
Clone pbakaus/impeccable impeccable
Clone nextlevelbuilder/ui-ux-pro-max-skill ui-ux-pro-max-skill
Clone Leonxlnx/taste-skill taste-skill
Clone VoltAgent/awesome-design-md awesome-design-md

foreach ($d in "awwwards-3d","impeccable","ui-ux-pro-max-skill","taste-skill") {
  if (-not (Test-Path "vendor\$d")) { continue }
  Get-ChildItem "vendor\$d" -Recurse -Filter SKILL.md | Where-Object { $_.FullName -notmatch "node_modules" } | ForEach-Object {
    $src = $_.Directory.FullName
    $name = if ($src -eq (Resolve-Path "vendor\$d").Path) { $d } else { $_.Directory.Name }
    if (-not (Test-Path ".claude\skills\$name")) { Copy-Item $src ".claude\skills\$name" -Recurse }
  }
}
Get-ChildItem .claude\skills

if (Test-Path apps\web\package.json) {
  Push-Location apps\web
  pnpm add three @react-three/fiber @react-three/drei gsap lenis @shadergradient/react @paper-design/shaders-react liquid-glass-js
  pnpm add -D @types/three
  Pop-Location
} else { Write-Host "apps/web not scaffolded yet - run prompt 01 first, then re-run" }

if (Get-Command uvx -ErrorAction SilentlyContinue) { claude mcp add blender -- cmd /c uvx blender-mcp }
else { Write-Host 'install uv: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"' }
Write-Host "Blender: Edit > Preferences > Add-ons > Install > vendor\blender-mcp\addon.py, then N-panel > BlenderMCP > Connect to Claude"
npx -y playwright install chromium
Write-Host "Read every vendor\*\LICENSE and record it in LICENSES.md before using code."
