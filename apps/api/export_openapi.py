"""Write the OpenAPI schema to packages/shared/openapi.json (run after every API change)."""

import argparse
import json
import os
from pathlib import Path

# The schema does not need a real database; avoid requiring one to export it.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://export:export@localhost/export")
os.environ["APP_ENV"] = "local"  # docs/openapi are disabled in production

from app.core.config import Settings  # noqa: E402
from app.main import create_app  # noqa: E402

TARGET = Path(__file__).resolve().parent.parent.parent / "packages" / "shared" / "openapi.json"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check", action="store_true", help="build the schema and exit without writing a file"
    )
    args = parser.parse_args()
    schema = create_app(Settings()).openapi()
    if args.check:
        print(f"ok: {len(schema['paths'])} paths")
        return
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(schema, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
