from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.model_dna.dna_builder import (
    build_model_dna,
)
from app.model_dna.registry import (
    get_all_model_dna,
    get_model_dna_by_id,
    register_model_dna,
)


router = APIRouter(
    prefix="/model-dna",
    tags=["Model DNA"],
)


BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_DIR = BASE_DIR / "trained_models"


class ModelDNARequest(BaseModel):
    model_file_name: str
    health_score: float | None = None
    grade: str | None = None
    deployment_status: str | None = None


@router.post("/generate")
def generate_model_dna(
    request: ModelDNARequest,
) -> dict[str, Any]:
    model_path = (
        MODEL_DIR / request.model_file_name
    )

    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Trained model file not found.",
        )

    try:
        model_dna = build_model_dna(
            model_path=model_path,
            health_score=request.health_score,
            grade=request.grade,
            deployment_status=(
                request.deployment_status
            ),
        )

        registered_dna = register_model_dna(
            model_dna
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate Model DNA: "
                f"{str(error)}"
            ),
        ) from error

    return {
        "message": (
            "Model DNA generated successfully."
        ),
        "model_dna": registered_dna,
    }


@router.get("/registry")
def model_dna_registry() -> dict[str, Any]:
    models = get_all_model_dna()

    return {
        "total_models": len(models),
        "models": models,
    }


@router.get("/{model_id}")
def get_model_dna(
    model_id: str,
) -> dict[str, Any]:
    model_dna = get_model_dna_by_id(
        model_id
    )

    if model_dna is None:
        raise HTTPException(
            status_code=404,
            detail="Model DNA not found.",
        )

    return {
        "model_dna": model_dna,
    }