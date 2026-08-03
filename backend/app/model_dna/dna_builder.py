from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import joblib

from app.model_dna.fingerprint import (
    calculate_file_hash,
    create_short_fingerprint,
)


def build_model_dna(
    model_path: Path,
    health_score: float | None = None,
    grade: str | None = None,
    deployment_status: str | None = None,
) -> dict[str, Any]:
    if not model_path.exists():
        raise FileNotFoundError(
            "Trained model file not found."
        )

    saved_model = joblib.load(model_path)

    if isinstance(saved_model, dict):
        target_column = saved_model.get(
            "target_column"
        )

        feature_columns = saved_model.get(
            "feature_columns",
            [],
        )

        dataset_file_name = saved_model.get(
            "dataset_file_name"
        )

        pipeline = saved_model.get("pipeline")

    else:
        target_column = None
        feature_columns = []
        dataset_file_name = None
        pipeline = saved_model

    algorithm = "Unknown Model"

    if pipeline is not None:
        try:
            classifier = pipeline.named_steps.get(
                "classifier"
            )

            if classifier is not None:
                algorithm = classifier.__class__.__name__

            else:
                algorithm = pipeline.__class__.__name__

        except AttributeError:
            algorithm = pipeline.__class__.__name__

    model_hash = calculate_file_hash(model_path)

    fingerprint = create_short_fingerprint(
        model_path
    )

    model_id = f"MG-{fingerprint}"

    return {
        "dna_id": uuid4().hex,
        "model_id": model_id,
        "model_file_name": model_path.name,
        "algorithm": algorithm,
        "dataset_file_name": dataset_file_name,
        "target_column": target_column,
        "feature_columns": feature_columns,
        "feature_count": len(feature_columns),
        "model_hash": model_hash,
        "fingerprint": fingerprint,
        "health_score": health_score,
        "grade": grade,
        "deployment_status": deployment_status,
        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
        "dna_version": "1.0",
    }