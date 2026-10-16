# krishki-kit — стартовый набор для Claude Code

## Что внутри
- `CLAUDE.md` — правила проекта, стек, роли
- `.claude/skills/` — 7 скиллов проекта: domain, design-system, 3d, backend, security, seo-i18n, qa
- `.claude/agents/` — 6 ролей: architect, frontend-dev, threed-dev, backend-dev, security-reviewer, qa-seo
- `prompts/00…08` — промпты по этапам, запускать по порядку
- `TASKS.md` — кто что делает и в каком порядке
- `scripts/install.sh` / `install.ps1` — клонирует 3D-репозитории и скиллы в `vendor/`, копирует скиллы в `.claude/skills`, ставит npm-пакеты и Blender MCP

## Запуск
1. Распакуй в пустую папку проекта, сделай `git init`.
2. `bash scripts/install.sh` (Windows: `powershell -ExecutionPolicy Bypass -File scripts\install.ps1`).
3. `claude` в этой папке → вставь промпт из `prompts/00-kickoff.md`.
4. Дальше 01 → 08, после 01 запусти скрипт ещё раз (поставит npm-пакеты в apps/web).

## Перед использованием кода из vendor/
Открой LICENSE каждого репозитория и запиши в LICENSES.md. vendor/ — только референс, добавь его в .gitignore.
