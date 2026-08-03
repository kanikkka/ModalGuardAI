import json
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_DIR = BASE_DIR / "database"

DATABASE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

REGISTRY_FILE = DATABASE_DIR / "model_dna_registry.json"


def load_registry() -> list[dict[str, Any]]:
    if not REGISTRY_FILE.exists():
        return []

    try:
        content = REGISTRY_FILE.read_text(
            encoding="utf-8"
        )

        if not content.strip():
            return []

        data = json.loads(content)

        if not isinstance(data, list):
            return []

        return data

    except (json.JSONDecodeError, OSError):
        return []


def save_registry(
    registry: list[dict[str, Any]],
) -> None:
    REGISTRY_FILE.write_text(
        json.dumps(
            registry,
            indent=2,
        ),
        encoding="utf-8",
    )


def register_model_dna(
    model_dna: dict[str, Any],
) -> dict[str, Any]:
    registry = load_registry()

    existing_model = next(
        (
            item
            for item in registry
            if item.get("model_hash")
            == model_dna.get("model_hash")
        ),
        None,
    )

    if existing_model is not None:
        return existing_model

    version_number = len(registry) + 1

    model_dna["registry_version"] = (
        f"v{version_number}"
    )

    registry.append(model_dna)

    save_registry(registry)

    return model_dna


def get_all_model_dna() -> list[dict[str, Any]]:
    return load_registry()


def get_model_dna_by_id(
    model_id: str,
) -> dict[str, Any] | None:
    registry = load_registry()

    for item in registry:
        if item.get("model_id") == model_id:
            return item

    return None