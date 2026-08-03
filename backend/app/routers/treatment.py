from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.treatment.treatment_plan import (
    generate_treatment_plan,
)

router = APIRouter(
    prefix="/treatment",
    tags=["Treatment Engine"],
)


class TreatmentRequest(BaseModel):
    health_score: float = 100
    noise_stability: float = 100
    missing_stability: float = 100
    outlier_stability: float = 100
    drift_stability: float = 100
    class_balance: float = 100
    duplicate_score: float = 100
    leakage_score: float = 100
    extra_metrics: dict[str, Any] = Field(
        default_factory=dict
    )


@router.post("/generate")
def create_treatment_plan(
    request: TreatmentRequest,
) -> dict[str, Any]:
    metrics = request.model_dump()
    extra_metrics = metrics.pop("extra_metrics", {})
    metrics.update(extra_metrics)

    treatment_plan = generate_treatment_plan(metrics)

    return {
        "message": "Treatment plan generated successfully.",
        "treatment_plan": treatment_plan,
    }